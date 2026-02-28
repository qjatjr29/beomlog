import { useMemo } from "react";
import { usePosts } from "@/contexts/PostsContext";
import { PostNavigationResult } from "../types";

export const usePostNavigation = (postId: string): PostNavigationResult => {
  const { posts } = usePosts();

  return useMemo(() => {
    const currentPost = posts.find((p) => p.id === postId);
    if (!currentPost) return { prevPost: null, nextPost: null };

    const scopedPosts = currentPost.groupId
      ? posts.filter((p) => p.groupId === currentPost.groupId)
      : posts.filter((p) => p.category === currentPost.category && !p.groupId);

    const sorted = [...scopedPosts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const currentIndex = sorted.findIndex((p) => p.id === postId);

    const prevPost =
      currentIndex > 0
        ? {
            id: sorted[currentIndex - 1].id,
            title: sorted[currentIndex - 1].title,
          }
        : null;

    const nextPost =
      currentIndex < sorted.length - 1
        ? {
            id: sorted[currentIndex + 1].id,
            title: sorted[currentIndex + 1].title,
          }
        : null;

    return { prevPost, nextPost };
  }, [posts, postId]);
};
