import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, subMonths, eachMonthOfInterval, eachDayOfInterval, subDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { FileText, TrendingUp, Users, FileEdit, Eye, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface AnalyticsArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  source: string | null;
  published_at: string | null;
  created_at: string | null;
  views: number | null;
  author_id: string;
  category_id: string;
  authors: { name: string } | null;
  categories: { name: string } | null;
}

const CHART_COLORS = ["#171717", "#525252", "#a3a3a3", "#404040", "#737373", "#262626", "#d4d4d4", "#0a0a0a"];

const Analytics = () => {
  const [articles, setArticles] = useState<AnalyticsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id, title, slug, status, source, published_at, created_at, views, author_id, category_id, authors(name), categories(name)"
        )
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!cancelled) {
        if (!error && data) setArticles(data as unknown as AnalyticsArticle[]);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "published");
    const drafts = articles.filter((a) => a.status === "draft");

    const now = new Date();
    const monthStart = startOfMonth(now);
    const publishedThisMonth = published.filter(
      (a) => a.published_at && new Date(a.published_at) >= monthStart
    );

    // Active authors (any article in last 90 days)
    const ninetyDaysAgo = subDays(now, 90);
    const activeAuthorIds = new Set(
      published
        .filter((a) => a.published_at && new Date(a.published_at) >= ninetyDaysAgo)
        .map((a) => a.author_id)
    );

    const totalViews = published.reduce((sum, a) => sum + (a.views ?? 0), 0);

    const aiCount = published.filter((a) => a.source === "AI").length;
    const aiPercent = published.length > 0 ? Math.round((aiCount / published.length) * 100) : 0;

    return {
      totalPublished: published.length,
      drafts: drafts.length,
      publishedThisMonth: publishedThisMonth.length,
      activeAuthors: activeAuthorIds.size,
      totalViews,
      aiPercent,
    };
  }, [articles]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(subMonths(now, 11));
    const months = eachMonthOfInterval({ start, end: now });

    return months.map((monthDate) => {
      const monthEnd = startOfMonth(subMonths(monthDate, -1));
      const inMonth = articles.filter((a) => {
        if (!a.published_at || a.status !== "published") return false;
        const d = new Date(a.published_at);
        return d >= monthDate && d < monthEnd;
      });
      const human = inMonth.filter((a) => a.source !== "AI").length;
      const ai = inMonth.filter((a) => a.source === "AI").length;
      return {
        month: format(monthDate, "MMM", { locale: es }),
        Humano: human,
        AI: ai,
      };
    });
  }, [articles]);

  const dailyData = useMemo(() => {
    const now = new Date();
    const start = startOfDay(subDays(now, 29));
    const days = eachDayOfInterval({ start, end: now });

    return days.map((dayDate) => {
      const dayEnd = startOfDay(subDays(dayDate, -1));
      const count = articles.filter((a) => {
        if (!a.published_at || a.status !== "published") return false;
        const d = new Date(a.published_at);
        return d >= dayDate && d < dayEnd;
      }).length;
      return {
        day: format(dayDate, "d MMM", { locale: es }),
        publicadas: count,
      };
    });
  }, [articles]);

  const authorData = useMemo(() => {
    const counts = new Map<string, { name: string; total: number; thisMonth: number }>();
    const monthStart = startOfMonth(new Date());

    for (const a of articles) {
      if (a.status !== "published" || !a.author_id) continue;
      const name = a.authors?.name || "—";
      const existing = counts.get(a.author_id) || { name, total: 0, thisMonth: 0 };
      existing.total += 1;
      if (a.published_at && new Date(a.published_at) >= monthStart) {
        existing.thisMonth += 1;
      }
      counts.set(a.author_id, existing);
    }

    return Array.from(counts.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [articles]);

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      if (a.status !== "published") continue;
      const name = a.categories?.name || "—";
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [articles]);

  const sourceData = useMemo(() => {
    const human = articles.filter((a) => a.status === "published" && a.source !== "AI").length;
    const ai = articles.filter((a) => a.status === "published" && a.source === "AI").length;
    return [
      { name: "Humano", value: human },
      { name: "AI", value: ai },
    ].filter((d) => d.value > 0);
  }, [articles]);

  const topByViews = useMemo(() => {
    return [...articles]
      .filter((a) => a.status === "published")
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 10);
  }, [articles]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 sm:px-10 py-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Visión general del trabajo editorial · {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
          <KpiCard icon={FileText} label="Total publicadas" value={stats.totalPublished} />
          <KpiCard icon={TrendingUp} label="Este mes" value={stats.publishedThisMonth} />
          <KpiCard icon={FileEdit} label="Borradores" value={stats.drafts} />
          <KpiCard icon={Users} label="Autores activos" value={stats.activeAuthors} hint="últimos 90 días" />
          <KpiCard icon={Eye} label="Vistas totales" value={formatCompact(stats.totalViews)} />
          <KpiCard icon={Bot} label="% generado por AI" value={`${stats.aiPercent}%`} />
        </div>

        {/* Monthly publication chart - full width */}
        <Panel title="Notas publicadas por mes" subtitle="Últimos 12 meses · desglose Humano vs AI">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="month" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="Humano" stackId="a" fill="#171717" radius={[0, 0, 0, 0]} />
              <Bar dataKey="AI" stackId="a" fill="#a3a3a3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Two-column row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Panel title="Actividad reciente" subtitle="Notas publicadas por día · últimos 30 días">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#a3a3a3"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.ceil(dailyData.length / 8)}
                />
                <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="publicadas"
                  stroke="#171717"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#171717" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Distribución por categoría" subtitle="Top 8 categorías publicadas">
            {categoryData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingLeft: 12 }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>

        {/* Authors + Source split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2">
            <Panel title="Productividad por autor" subtitle="Top 10 · total publicado y este mes">
              {authorData.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(240, authorData.length * 32)}>
                  <BarChart data={authorData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                    <XAxis type="number" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#525252"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={140}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    <Bar dataKey="total" name="Total" fill="#171717" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="thisMonth" name="Este mes" fill="#737373" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          </div>

          <Panel title="Origen del contenido" subtitle="Humano vs AI">
            {sourceData.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {sourceData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.name === "AI" ? "#a3a3a3" : "#171717"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>

        {/* Top by views */}
        <div className="mt-4">
          <Panel title="Notas más vistas" subtitle="Top 10 publicadas por número de vistas">
            {topByViews.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="-mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                      <th className="px-2 py-2 font-medium w-8">#</th>
                      <th className="px-2 py-2 font-medium">Título</th>
                      <th className="px-2 py-2 font-medium hidden md:table-cell">Autor</th>
                      <th className="px-2 py-2 font-medium hidden md:table-cell">Categoría</th>
                      <th className="px-2 py-2 font-medium text-right">Vistas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topByViews.map((a, i) => (
                      <tr key={a.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                        <td className="px-2 py-3 text-neutral-400 tabular-nums">{i + 1}</td>
                        <td className="px-2 py-3">
                          <a
                            href={`/noticias/${a.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-800 hover:text-neutral-900 hover:underline line-clamp-1"
                          >
                            {a.title}
                          </a>
                        </td>
                        <td className="px-2 py-3 text-neutral-500 hidden md:table-cell">
                          {a.authors?.name || "—"}
                        </td>
                        <td className="px-2 py-3 text-neutral-500 hidden md:table-cell">
                          {a.categories?.name || "—"}
                        </td>
                        <td className="px-2 py-3 text-right font-medium text-neutral-800 tabular-nums">
                          {formatCompact(a.views ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
};

const KpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="rounded-xl border border-black/[0.06] bg-white p-4">
    <div className="flex items-center gap-2 text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="mt-2 text-2xl font-bold text-neutral-900 tabular-nums">{value}</div>
    {hint && <div className="text-[11px] text-neutral-400 mt-0.5">{hint}</div>}
  </div>
);

const Panel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-black/[0.06] bg-white p-5">
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const EmptyState = () => (
  <div className="flex items-center justify-center h-[200px] text-sm text-neutral-400">
    Sin datos para mostrar
  </div>
);

const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
};

export default Analytics;
