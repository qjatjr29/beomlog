import { BookOpen, FolderKanban } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  type?: "post" | "gallery"; // 아이콘 종류
}

export const EmptyState = ({
  message = "아직 게시글이 없습니다",
  type = "post",
}: EmptyStateProps) => {
  const Icon = type === "gallery" ? FolderKanban : BookOpen;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-blog-lighter dark:bg-gray-700 flex items-center justify-center">
        <Icon className="w-7 h-7 text-blog-primary opacity-50" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};
