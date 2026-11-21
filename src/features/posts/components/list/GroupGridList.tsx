import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { usePagination } from "@/shared/hooks/usePagination";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { PostListHeader } from "../shared/PostListHeader";
import { TagFilter } from "../shared/TagFilter";
import { PostListCard } from "../cards/PostListCard";
import { BookPostGridCard } from "../cards/BookPostGridCard";
import { GroupGridCard } from "../cards/GroupGridCard";
import { Pagination } from "@/shared/components/Pagination";
import { EmptyState } from "../shared/EmptyState";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { loadGroupsByCategory } from "@/features/posts/utils/group-loader";
import { SearchToggle } from "../shared/SearchToggle";

interface GroupPostListProps {
  category: string; // "책" | "프로젝트"
}

export const GroupGridList = ({ category }: GroupPostListProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedGroupTag, setSelectedGroupTag] = useState<string | null>(null);
  const [selectedBookCategory, setSelectedBookCategory] =
    useState<string>("전체");
  const [searchParams, setSearchParams] = useSearchParams();

  // 기본 갤러리, ?view=list 이면 리스트
  const isGalleryView = searchParams.get("view") !== "list";

  const { filteredPosts, availableTags, viewCounts, commentCounts } =
    usePostStorage(category, selectedTag);

  const [searchQuery, setSearchQuery] = useState("");

  const searchedPosts = useMemo(() => {
    if (isGalleryView) {
      return filteredPosts;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredPosts;
    const kws = q.split(/\s+/).filter(Boolean);
    return filteredPosts.filter((post) => {
      const text = [post.title, post.content, post.category]
        .join(" ")
        .toLowerCase();
      return kws.every((k) => text.includes(k));
    });
  }, [filteredPosts, isGalleryView, searchQuery]);

  const groups = loadGroupsByCategory(category);

  const groupBookCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach((group) => {
      map[group.id] = group.bookCategory ?? "미분류";
    });
    return map;
  }, [groups]);

  const bookCategoryOptions = useMemo(() => {
    if (category !== "책") return [];

    const values = [
      ...groups.map((g) => g.bookCategory).filter(Boolean),
      ...filteredPosts.map((p) => p.bookCategory).filter(Boolean),
    ] as string[];

    return ["전체", ...Array.from(new Set(values))];
  }, [category, groups, filteredPosts]);

  const toBookCategory = (value?: string) => value ?? "미분류";

  const resolvePostBookCategory = (post: {
    bookCategory?: string;
    groupId?: string;
  }) => {
    if (post.bookCategory) return post.bookCategory;
    if (post.groupId && groupBookCategoryMap[post.groupId]) {
      return groupBookCategoryMap[post.groupId];
    }
    return "미분류";
  };

  const filteredPostsByBookCategory = useMemo(() => {
    if (category !== "책" || selectedBookCategory === "전체") {
      return filteredPosts;
    }
    return filteredPosts.filter(
      (post) => resolvePostBookCategory(post) === selectedBookCategory,
    );
  }, [category, filteredPosts, selectedBookCategory, groupBookCategoryMap]);

  const standalonePosts = useMemo(
    () => filteredPostsByBookCategory.filter((post) => !post.groupId),
    [filteredPostsByBookCategory],
  );

  const searchedPostsByBookCategory = useMemo(() => {
    if (category !== "책" || selectedBookCategory === "전체") {
      return searchedPosts;
    }
    return searchedPosts.filter(
      (post) => resolvePostBookCategory(post) === selectedBookCategory,
    );
  }, [category, searchedPosts, selectedBookCategory, groupBookCategoryMap]);

  const availableGroupTags = Array.from(
    new Set(groups.flatMap((g) => g.tags ?? [])),
  );

  const filteredGroups = selectedGroupTag
    ? groups.filter((g) => g.tags?.includes(selectedGroupTag))
    : groups;

  const filteredGroupsByBookCategory =
    category === "책" && selectedBookCategory !== "전체"
      ? filteredGroups.filter(
          (group) =>
            toBookCategory(group.bookCategory) === selectedBookCategory,
        )
      : filteredGroups;

  const bookGridItems = useMemo(
    () => [
      ...filteredGroupsByBookCategory.map((group) => ({
        type: "group" as const,
        group,
      })),
      ...standalonePosts.map((post) => ({ type: "post" as const, post })),
    ],
    [filteredGroupsByBookCategory, standalonePosts],
  );

  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } =
    usePagination(searchedPostsByBookCategory, POSTS_PER_PAGE);

  useEffect(() => {
    setSelectedTag(null);
    setSelectedGroupTag(null);
    setSelectedBookCategory("전체");
    setSearchQuery("");
    resetPage();
  }, [category, resetPage]);

  const setView = (view: "gallery" | "list") => {
    const p = new URLSearchParams(searchParams);
    if (view === "gallery") p.delete("view");
    else p.set("view", "list");
    setSearchParams(p);
    resetPage();
    setSelectedTag(null);
    setSelectedGroupTag(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <PostListHeader
          category={category}
          totalCount={
            isGalleryView && category === "책"
              ? filteredGroupsByBookCategory.length + standalonePosts.length
              : searchedPostsByBookCategory.length
          }
        />
        <div className="flex items-center gap-1 mt-1 shrink-0">
          <button
            onClick={() => setView("gallery")}
            className={`p-1.5 rounded transition-colors ${isGalleryView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
            title="갤러리 뷰">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded transition-colors ${!isGalleryView ? "bg-blog-primary text-white" : "text-gray-400 hover:text-blog-primary"}`}
            title="리스트 뷰">
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {category === "책" && bookCategoryOptions.length > 1 && (
        <div
          className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 ${isGalleryView ? "" : "mb-5"}`}>
          {bookCategoryOptions.map((bookCategory) => {
            const isActive = selectedBookCategory === bookCategory;
            return (
              <button
                key={bookCategory}
                onClick={() => {
                  setSelectedBookCategory(bookCategory);
                  resetPage();
                }}
                className={`transition-colors ${
                  isActive
                    ? "font-bold text-gray-900 dark:text-gray-100"
                    : "hover:text-blog-primary"
                }`}>
                {bookCategory}
              </button>
            );
          })}
        </div>
      )}

      {!isGalleryView && (
        <div className="mt-4 mb-6 flex gap-6 justify-between items-start">
          <div className="flex-1"></div>
          <SearchToggle
            value={searchQuery}
            onChange={(v) => {
              setSearchQuery(v);
              resetPage();
            }}
            placeholder="제목, 본문, 카테고리"
          />
        </div>
      )}

      {
        isGalleryView ? (
          <>
            {category !== "책" && availableGroupTags.length > 0 && (
              <TagFilter
                tags={availableGroupTags}
                selectedTag={selectedGroupTag}
                onTagClick={(tag) =>
                  setSelectedGroupTag((prev) => (prev === tag ? null : tag))
                }
                onClear={() => setSelectedGroupTag(null)}
              />
            )}
            {bookGridItems.length === 0 ? (
              <EmptyState
                type="gallery"
                message="해당 태그의 항목이 없습니다."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {bookGridItems.map((item, i) => (
                  <motion.div
                    key={item.type === "group" ? item.group.id : item.post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.35,
                      ease: "easeOut",
                    }}>
                    {item.type === "group" ? (
                      <GroupGridCard group={item.group} />
                    ) : (
                      <BookPostGridCard post={item.post} />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {category !== "책" && availableTags.length > 0 && (
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
                <EmptyState
                  message={
                    searchQuery
                      ? `${searchQuery}에 대한 글이 없습니다.`
                      : undefined
                  }
                />
              ) : (
                currentItems.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}>
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
        )
        // 갤러리 뷰: groups.json 기반 카드
        //   groups.length === 0 ? (
        //     <EmptyState type="gallery" message="아직 등록된 항목이 없습니다" />
        //   ) : (
        //     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        //       {groups.map((group, i) => (
        //         <motion.div
        //           key={group.id}
        //           initial={{ opacity: 0, y: 16 }}
        //           animate={{ opacity: 1, y: 0 }}
        //           transition={{
        //             delay: i * 0.08,
        //             duration: 0.35,
        //             ease: "easeOut",
        //           }}
        //         >
        //           <GroupGridCard group={group} />
        //         </motion.div>
        //       ))}
        //     </div>
        //   )
        // ) : (
        //   // 리스트 뷰: 일반 포스트 목록
        //   <>
        //     <TagFilter
        //       tags={availableTags}
        //       selectedTag={selectedTag}
        //       onTagClick={(tag) => {
        //         setSelectedTag((prev) => (prev === tag ? null : tag));
        //         resetPage();
        //       }}
        //       onClear={() => {
        //         setSelectedTag(null);
        //         resetPage();
        //       }}
        //     />
        //     <div className="space-y-3 mb-8">
        //       {currentItems.length === 0 ? (
        //         <EmptyState />
        //       ) : (
        //         currentItems.map((post, i) => (
        //           <motion.div
        //             key={post.id}
        //             initial={{ opacity: 0, x: -10 }}
        //             animate={{ opacity: 1, x: 0 }}
        //             transition={{ delay: i * 0.06 }}
        //           >
        //             <PostListCard
        //               post={post}
        //               viewCount={viewCounts[post.id] ?? 0}
        //               commentCount={commentCounts[post.id] ?? 0}
        //               selectedTag={selectedTag}
        //             />
        //           </motion.div>
        //         ))
        //       )}
        //     </div>
        //     <Pagination
        //       currentPage={currentPage}
        //       totalPages={totalPages}
        //       onPageChange={handlePageChange}
        //     />
        //   </>
        // )}
      }
    </div>
  );
};
