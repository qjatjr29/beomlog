import { useState } from "react";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
  onClear: () => void;
}

const MAX_VISIBLE = 8;

export const TagFilter = ({
  tags,
  selectedTag,
  onTagClick,
  onClear,
}: TagFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (tags.length === 0) return null;

  const visibleTags = isExpanded ? tags : tags.slice(0, MAX_VISIBLE);
  const hasMore = tags.length > MAX_VISIBLE;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-1.5 items-center">
        <button
          onClick={onClear}
          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
            selectedTag === null
              ? "bg-blog-primary border-blog-primary text-white"
              : "bg-white dark:bg-gray-800 border-blog-border-light dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blog-primary hover:text-blog-primary"
          }`}
        >
          전체
        </button>
        {visibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              selectedTag === tag
                ? "bg-blog-primary border-blog-primary text-white"
                : "bg-white dark:bg-gray-800 border-blog-border-light dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blog-primary hover:text-blog-primary"
            }`}
          >
            #{tag}
          </button>
        ))}
        {hasMore && (
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[10px] px-2 py-0.5 rounded border border-dashed border-blog-border text-blog-primary hover:bg-blog-light dark:hover:bg-gray-700 transition-colors"
          >
            {isExpanded ? "접기 ↑" : `+${tags.length - MAX_VISIBLE}개 더보기`}
          </button>
        )}
      </div>
    </div>
  );
};
