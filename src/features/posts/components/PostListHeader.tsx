import { BookText } from "lucide-react";
import { CATEGORY_LABELS } from "@/shared/constants";
import { PostListHeaderProps } from "../types";
import { getCategoryIcon } from "@/shared/utils/post.utils";

export const PostListHeader = ({
  category,
  totalCount,
}: PostListHeaderProps) => {
  const CATEGORY_ICON = category ? getCategoryIcon(category) : BookText;
  return (
    <div className="mb-6 pb-4 border-b-2 border-dotted border-gray-300 dark:border-gray-600">
      <h1 className="text-xl text-gray-800 dark:text-gray-100 mb-1">
        {category ? (
          <span className="flex items-center gap-2 font-bold">
            <span className="text-blog-primary flex items-center">
              <CATEGORY_ICON />
            </span>
            {CATEGORY_LABELS[category] || category}
          </span>
        ) : (
          <span className="flex items-center gap-2 font-bold">
            <BookText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            전체 글
          </span>
        )}
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        총 {totalCount}개의 글
      </p>
    </div>
  );
};
