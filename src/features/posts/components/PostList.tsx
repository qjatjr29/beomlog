import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { usePagination } from "@/shared/hooks/usePagination";
import {
  GALLERY_CATEGORIES,
  GRID_CATEGORIES,
  GRID_POSTS_PER_PAGE,
  POSTS_PER_PAGE,
} from "@/shared/constants";
import { PostListHeader } from "./PostListHeader";
import { TagFilter } from "./TagFilter";
import { PostCard } from "./PostCard";
import { PostGridCard } from "./PostGridCard";
import { Pagination } from "@/shared/components/Pagination";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { BookOpen, LayoutGrid, List } from "lucide-react";
import { GalleryList } from "./GalleryList";

export const PostList = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const viewParam = searchParams.get("view");

  // 책/프로젝트: 갤러리 카드 뷰
  const isGalleryCategory = category
    ? GALLERY_CATEGORIES.has(category as "프로젝트" | "책")
    : false;

  // 일상: 그리드 뷰 (기본) / 리스트 뷰 토글 가능
  const isGridCategory = category ? GRID_CATEGORIES.has(category) : false;

  const isGalleryView = isGalleryCategory ? viewParam !== "list" : false;
  // 일상 탭: 기본 그리드, ?view=list 이면 리스트
  const isGridView = isGridCategory ? viewParam !== "list" : false;

  const { filteredPosts, availableTags, viewCounts, commentCounts } =
    usePostStorage(category, selectedTag);

  const itemsPerPage = isGridView ? GRID_POSTS_PER_PAGE : POSTS_PER_PAGE;

  const {
    currentPage,
    totalPages,
    currentItems: currentPosts,
    handlePageChange,
    resetPage,
  } = usePagination(filteredPosts, itemsPerPage);

  useEffect(() => {
    resetPage();
    setSelectedTag(null);
  }, [category]);

  return (
    <div>
      <div className="flex items-start justify-between">
        <PostListHeader category={category} totalCount={filteredPosts.length} />

        <div className="flex items-center gap-1 mt-1 shrink-0">
          {isGalleryCategory && (
            // 책/프로젝트: 갤러리 ↔ 리스트
            <>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete("view");
                  setSearchParams(p);
                }}
                className={`p-1.5 rounded transition-colors ${isGalleryView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
                title="갤러리 뷰"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set("view", "list");
                  setSearchParams(p);
                }}
                className={`p-1.5 rounded transition-colors ${!isGalleryView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
                title="리스트 뷰"
              >
                <List className="w-4 h-4" />
              </button>
            </>
          )}

          {isGridCategory && (
            // 일상: 그리드 ↔ 리스트
            <>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.delete("view");
                  setSearchParams(p);
                  resetPage();
                }}
                className={`p-1.5 rounded transition-colors ${isGridView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
                title="그리드 뷰"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams);
                  p.set("view", "list");
                  setSearchParams(p);
                  resetPage();
                }}
                className={`p-1.5 rounded transition-colors ${!isGridView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
                title="리스트 뷰"
              >
                <List className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {isGalleryView ? (
        <GalleryList category={category!} />
      ) : (
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

          {/* ✅ 일상 그리드 뷰 */}
          {isGridView ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {currentPosts.length === 0 ? (
                <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="w-7 h-7 text-blog-primary opacity-50 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    아직 게시글이 없습니다
                  </p>
                </div>
              ) : (
                currentPosts.map((post, i) => (
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
            // 리스트 뷰 (개발 + 일상 list 모드)
            <div className="space-y-3 mb-8">
              {currentPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-blog-lighter dark:bg-gray-700 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-blog-primary opacity-50" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    아직 게시글이 없습니다
                  </p>
                </div>
              ) : (
                currentPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <PostCard
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
        </>
      )}
    </div>
  );
};
