interface PostListHeaderProps {
  category?: string;
  totalCount: number;
}

export const PostListHeader = ({
  category,
  totalCount,
}: PostListHeaderProps) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
      {category ?? "전체"}
    </h2>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
      총 {totalCount}개의 글
    </p>
  </div>
);
