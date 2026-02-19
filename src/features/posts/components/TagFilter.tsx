interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
  onClear: () => void;
}

export const TagFilter = ({
  tags,
  selectedTag,
  onTagClick,
  onClear,
}: TagFilterProps) => {
  if (tags.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-blog-lighter border border-blog-border rounded">
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`text-xs px-3 py-1.5 rounded transition-all border ${
              selectedTag === tag
                ? "bg-blog-primary text-white border-blog-primary"
                : "bg-white text-gray-700 border-gray-300 hover:border-blog-border hover:bg-blog-light"
            }`}
          >
            #{tag}
          </button>
        ))}
        {selectedTag && (
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            ✕ 전체보기
          </button>
        )}
      </div>
    </div>
  );
};
