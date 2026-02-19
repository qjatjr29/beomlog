import { useMemo } from "react";
import { usePosts } from "@/contexts/PostsContext";
import { PostNavigationResult } from "../types";

export const usePostNavigation = (postId: string): PostNavigationResult => {
  const { posts } = usePosts();

  return useMemo(() => {
    const currentIndex = posts.findIndex((p) => p.id === postId);

    const prevPost =
      currentIndex > 0
        ? {
            id: posts[currentIndex - 1].id,
            title: posts[currentIndex - 1].title,
          }
        : null;

    const nextPost =
      currentIndex < posts.length - 1
        ? {
            id: posts[currentIndex + 1].id,
            title: posts[currentIndex + 1].title,
          }
        : null;

    return { prevPost, nextPost };
  }, [posts, postId]);
};
