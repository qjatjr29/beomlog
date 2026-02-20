import { useMemo } from "react";
import { usePosts } from "@/contexts/PostsContext";
import { filterByCategory, filterByTag, getAvailableTags } from "../data";

export const usePostStorage = (
  category?: string,
  selectedTag?: string | null,
) => {
  const { posts, viewCounts, commentCounts } = usePosts();

  const categoryPosts = useMemo(
    () => filterByCategory(posts, category),
    [posts, category],
  );

  const availableTags = useMemo(
    () => getAvailableTags(categoryPosts),
    [categoryPosts],
  );

  const filteredPosts = useMemo(
    () => filterByTag(categoryPosts, selectedTag),
    [categoryPosts, selectedTag],
  );

  return {
    allPosts: posts, // 전체 데이터
    categoryPosts, // 카테고리만 필터링된 데이터
    filteredPosts, // 카테고리 + 태그까지 필터링된 최종 데이터
    availableTags, // 현재 화면에서 선택 가능한 태그 목록
    viewCounts, // 조회수 정보
    commentCounts, // 댓글수 정보
    totalCount: filteredPosts.length, // 최종 결과 개수
  };
};
