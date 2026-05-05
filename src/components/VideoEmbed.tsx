interface VideoEmbedProps {
  url: string | null;
  platform?: string | null;
  code?: string | null;
  title?: string;
  className?: string;
}

/**
 * Embeds whitelisted video URLs (YouTube, Vimeo) in a responsive 16:9
 * iframe. Returns null on any URL that doesn't match the allowlist —
 * defensive against XSS via untrusted iframe sources.
 *
 * Falls back to deriving the embed URL from `platform + code` if the
 * stored `video_embed_url` is empty.
 */
export const VideoEmbed = ({
  url,
  platform,
  code,
  title,
  className = "",
}: VideoEmbedProps) => {
  const resolvedUrl = url || deriveEmbedUrl(platform, code);
  if (!resolvedUrl) return null;

  if (!isWhitelistedEmbed(resolvedUrl)) return null;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black ${className}`}
    >
      <iframe
        src={resolvedUrl}
        title={title || "Video embebido"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
};

const isWhitelistedEmbed = (url: string): boolean => {
  try {
    const u = new URL(url);
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "youtube-nocookie.com" ||
      u.hostname === "www.youtube-nocookie.com"
    ) {
      return u.pathname.startsWith("/embed/");
    }
    if (u.hostname === "player.vimeo.com") {
      return u.pathname.startsWith("/video/");
    }
    return false;
  } catch {
    return false;
  }
};

const deriveEmbedUrl = (
  platform?: string | null,
  code?: string | null
): string | null => {
  if (!platform || !code) return null;
  const p = platform.toLowerCase().trim();
  const c = encodeURIComponent(code.trim());
  if (p === "youtube") return `https://www.youtube.com/embed/${c}`;
  if (p === "vimeo") return `https://player.vimeo.com/video/${c}`;
  return null;
};
