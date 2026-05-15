import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePagination } from "@/shared/hooks/usePagination";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { PostListHeader } from "../shared/PostListHeader";
import { TagFilter } from "../shared/TagFilter";
import { PostListCard } from "../cards/PostListCard";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "../shared/EmptyState";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { SearchToggle } from "../shared/SearchToggle";

export const DevPostList = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { filteredPosts, availableTags, viewCounts, commentCounts } =
    usePostStorage("개발", selectedTag);

  const [searchQuery, setSearchQuery] = useState("");

  const searchedPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredPosts;
    const kws = q.split(/\s+/).filter(Boolean);
    return filteredPosts.filter((post) => {
      const text = [post.title, post.content, post.category].join(" ").toLowerCase();
      return kws.every((k) => text.includes(k));
    });
  }, [filteredPosts, searchQuery]);

  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } =
    usePagination(searchedPosts, POSTS_PER_PAGE);

  useEffect(() => {
    resetPage();
    setSelectedTag(null);
  }, []); // 마운트 시 한 번

  return (
    <div>
      <div className="flex items-start justify-between">
        <PostListHeader category="개발" totalCount={searchedPosts.length} />
        <div className="mt-1">
          <SearchToggle
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              resetPage();
            }}
            placeholder="제목, 본문, 카테고리"
          />
        </div>
      </div>
      {availableTags.length > 0 && (
        <div className="mt-4">
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
        </div>
      )}
      <div className="space-y-3 mb-8 transition-opacity duration-300">
        {currentItems.length === 0 ? (
          <EmptyState message={searchQuery ? `${searchQuery}에 대한 글이 없습니다.` : undefined} />
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
