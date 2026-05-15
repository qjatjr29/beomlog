import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { usePagination } from "@/shared/hooks/usePagination";
import { POSTS_PER_PAGE, GRID_POSTS_PER_PAGE } from "@/shared/constants";
import { PostListHeader } from "../shared/PostListHeader";
import { TagFilter } from "../shared/TagFilter";
import { PostListCard } from "../cards/PostListCard";
import { PostGridCard } from "../cards/PostGridCard";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "../shared/EmptyState";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { SearchToggle } from "../shared/SearchToggle";

export const DailyPostList = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // 기본 그리드, ?view=list 이면 리스트
  const isGridView = searchParams.get("view") !== "list";

  const { filteredPosts, availableTags, viewCounts, commentCounts } =
    usePostStorage("일상", selectedTag);

  const [searchQuery, setSearchQuery] = useState("");

  const searchedPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredPosts;
    const kws = q.split(/\s+/).filter(Boolean);
    return filteredPosts.filter((post) => {
      const text = [post.title, post.content, post.category]
        .join(" ")
        .toLowerCase();
      return kws.every((k) => text.includes(k));
    });
  }, [filteredPosts, searchQuery]);

  const itemsPerPage = isGridView ? GRID_POSTS_PER_PAGE : POSTS_PER_PAGE;

  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } =
    usePagination(searchedPosts, itemsPerPage);

  useEffect(() => {
    resetPage();
    setSelectedTag(null);
  }, []);

  const setView = (view: "grid" | "list") => {
    const p = new URLSearchParams(searchParams);
    if (view === "grid") p.delete("view");
    else p.set("view", "list");
    setSearchParams(p);
    resetPage();
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <PostListHeader category="일상" totalCount={searchedPosts.length} />
        {/* 그리드/리스트 토글 */}
        <div className="flex items-center gap-1 mt-1 shrink-0">
          <SearchToggle
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              resetPage();
            }}
            placeholder="제목, 본문, 카테고리"
          />
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded transition-colors ${isGridView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
            title="그리드 뷰"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded transition-colors ${!isGridView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
            title="리스트 뷰"
          >
            <List className="w-4 h-4" />
          </button>
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

      {isGridView ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 transition-opacity duration-300">
          {currentItems.length === 0 ? (
            <div className="col-span-4">
              <EmptyState
                message={
                  searchQuery
                    ? `${searchQuery}에 대한 글이 없습니다.`
                    : undefined
                }
              />
            </div>
          ) : (
            currentItems.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <PostGridCard
                  post={post}
                  viewCount={viewCounts[post.id] ?? 0}
                  commentCount={commentCounts[post.id] ?? 0}
                />
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-8 transition-opacity duration-300">
          {currentItems.length === 0 ? (
            <EmptyState
              message={
                searchQuery ? `${searchQuery}에 대한 글이 없습니다.` : undefined
              }
            />
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
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
