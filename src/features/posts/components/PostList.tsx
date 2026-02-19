import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { usePagination } from "@/shared/hooks/usePagination";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { PostListHeader } from "./PostListHeader";
import { TagFilter } from "./TagFilter";
import { PostCard } from "./PostCard";
import { Pagination } from "@/shared/components/Pagination";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";

export const PostList = () => {
  const { category } = useParams<{ category: string }>();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { filteredPosts, availableTags, viewCounts } = usePostStorage(
    category,
    selectedTag,
  );

  const {
    currentPage,
    totalPages,
    currentItems: currentPosts,
    handlePageChange,
    resetPage,
  } = usePagination(filteredPosts, POSTS_PER_PAGE);

  useEffect(() => {
    resetPage();
    setSelectedTag(null);
  }, [category]);

  return (
    <div>
      <PostListHeader category={category} totalCount={filteredPosts.length} />

      <TagFilter
        tags={availableTags}
        selectedTag={selectedTag}
        onTagClick={(tag) => {
          setSelectedTag((prev) => (prev === tag ? null : tag));
          resetPage();
        }}
        onClear={() => {
          setSelectedTag(null);
          resetPage();
        }}
      />

      <div className="space-y-3 mb-8">
        {currentPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewCount={viewCounts[post.id] ?? 0}
            selectedTag={selectedTag}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
