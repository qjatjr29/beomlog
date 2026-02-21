import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationProps } from "../types";
import { useMemo } from "react";

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const numbers: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      if (numbers.length > 0) {
        const last = numbers[numbers.length - 1];
        if (typeof last === "number" && i - last > 1) numbers.push("...");
      }
      numbers.push(i);
    }
  }
  return numbers;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return (
    <div className="flex justify-center items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="px-2 text-gray-400 dark:text-gray-500"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? "bg-blog-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
