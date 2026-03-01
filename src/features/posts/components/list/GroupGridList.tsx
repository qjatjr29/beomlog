import { useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { usePagination } from "@/shared/hooks/usePagination";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { PostListHeader } from "../shared/PostListHeader";
import { TagFilter } from "../shared/TagFilter";
import { PostListCard } from "../cards/PostListCard";
import { GroupGridCard } from "../cards/GroupGridCard";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "../shared/EmptyState";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { loadGroupsByCategory } from "@/features/posts/utils/group-loader";

interface GroupPostListProps {
  category: string; // "책" | "프로젝트"
}

export const GroupThumbnailList = ({ category }: GroupPostListProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // 기본 갤러리, ?view=list 이면 리스트
  const isGalleryView = searchParams.get("view") !== "list";

  const { filteredPosts, availableTags, viewCounts, commentCounts } =
    usePostStorage(category, selectedTag);

  const groups = loadGroupsByCategory(category);

  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } =
    usePagination(filteredPosts, POSTS_PER_PAGE);

  const setView = (view: "gallery" | "list") => {
    const p = new URLSearchParams(searchParams);
    if (view === "gallery") p.delete("view");
    else p.set("view", "list");
    setSearchParams(p);
    resetPage();
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <PostListHeader category={category} totalCount={filteredPosts.length} />
        <div className="flex items-center gap-1 mt-1 shrink-0">
          <button
            onClick={() => setView("gallery")}
            className={`p-1.5 rounded transition-colors ${isGalleryView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
            title="갤러리 뷰"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded transition-colors ${!isGalleryView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
            title="리스트 뷰"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isGalleryView ? (
        // 갤러리 뷰: groups.json 기반 카드
        groups.length === 0 ? (
          <EmptyState type="gallery" message="아직 등록된 항목이 없습니다" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {groups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >
                <GroupGridCard group={group} />
              </motion.div>
            ))}
          </div>
        )
      ) : (
        // 리스트 뷰: 일반 포스트 목록
        <>
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
        </>
      )}
    </div>
  );
};
