import { useState, useMemo, useCallback } from "react";

interface PaginationOptions {
  scrollToTop?: boolean;
}

export const usePagination = <T>(
  data: T[],
  itemsPerPage: number,
  options: PaginationOptions = { scrollToTop: true },
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  const currentItems = useMemo<T[]>(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      if (options.scrollToTop !== false) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [options.scrollToTop],
  );

  const resetPage = useCallback(() => setCurrentPage(1), []);

  return { currentPage, totalPages, currentItems, handlePageChange, resetPage };
};
