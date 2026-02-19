import { useState, useMemo, useCallback } from "react";
import { PaginationOptions } from "../types";

export const usePagination = <T>(
  data: T[],
  itemsPerPage: number,
  options: PaginationOptions = { scrollToTop: true },
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (options.scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetPage = useCallback(() => setCurrentPage(1), []); // useCallback 추가

  return { currentPage, totalPages, currentItems, handlePageChange, resetPage };
};
