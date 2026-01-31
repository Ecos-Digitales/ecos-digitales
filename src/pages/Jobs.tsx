import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobListItem } from "@/components/jobs/JobListItem";
import { JobSearch } from "@/components/jobs/JobSearch";
import { LatestNewsWidget } from "@/components/jobs/LatestNewsWidget";
import { JobsLoadingSkeleton } from "@/components/LoadingGrid";
import { ErrorState } from "@/components/ErrorState";
import { SEO } from "@/components/SEO";
import { useJobs } from "@/hooks/useJobs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const JOBS_PER_PAGE = 12;

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: jobs,
    isLoading,
    error,
    refetch
  } = useJobs();

  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs || [];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) || 
        job.company.toLowerCase().includes(query)
      );
    }

    return result;
  }, [jobs, searchQuery]);

  // Pagination
  const totalJobs = filteredAndSortedJobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = filteredAndSortedJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      <SEO
        title="Trabajos Tech"
        description="Encuentra las mejores oportunidades laborales en tecnología. Trabajos remotos, híbridos y presenciales en startups y empresas tech."
        url="https://serif-stream.lovable.app"
        type="website"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

      <main className="flex-1">
        <section className="container py-8">
          {isLoading ? (
            <JobsLoadingSkeleton />
          ) : error ? (
            <ErrorState message="No se pudieron cargar los trabajos" onRetry={() => refetch()} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Contenido Principal - Lista de Trabajos (primero en mobile) */}
              <div className="flex-1 order-1">
                <h2 className="mb-4 text-sm font-semibold text-foreground lg:hidden">Trabajos</h2>
                
                {/* Lista de Trabajos */}
                {paginatedJobs.length > 0 ? (
                  <div>
                    {paginatedJobs.map(job => (
                      <JobListItem key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-12 text-center">
                    <p className="text-lg text-muted-foreground">
                      No hay trabajos que coincidan con tu búsqueda
                    </p>
                    {searchQuery && (
                      <button 
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }} 
                        className="mt-4 text-primary hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            if (totalPages <= 5) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                            return (
                              <PaginationItem key={page}>
                                {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                                <PaginationLink 
                                  onClick={() => handlePageChange(page)} 
                                  isActive={page === currentPage} 
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>

              {/* Sidebar - Noticias (después de trabajos en mobile) */}
              <aside className="w-full lg:w-72 flex-shrink-0 order-2">
                <LatestNewsWidget />
              </aside>
            </div>
          )}
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
};

export default Jobs;