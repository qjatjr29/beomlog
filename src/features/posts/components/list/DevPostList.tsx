import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePagination } from "@/shared/hooks/usePagination";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { PostListHeader } from "../shared/PostListHeader";
import { TagFilter } from "../shared/TagFilter";
import { PostListCard } from "../cards/PostListCard";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "../shared/EmptyState";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";

export const DevPostList = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { filteredPosts, availableTags, viewCounts, commentCounts } =
    usePostStorage("개발", selectedTag);

  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } =
    usePagination(filteredPosts, POSTS_PER_PAGE);

  useEffect(() => {
    resetPage();
    setSelectedTag(null);
  }, []); // 마운트 시 한 번

  return (
    <div>
      <PostListHeader category="개발" totalCount={filteredPosts.length} />
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
        {currentItems.length === 0 ? (
          <EmptyState />
        ) : (
          currentItems.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <PostListCard
                post={post}
                viewCount={viewCounts[post.id] ?? 0}
                commentCount={commentCounts[post.id] ?? 0}
                selectedTag={selectedTag}
              />
            </motion.div>
          ))
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
