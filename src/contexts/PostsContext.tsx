import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Post, Category } from "../features/posts/types";
import { supabase } from "../lib/supabase";
import { loadAllPosts } from "@/features/posts/data";

export interface PostsContextType {
  posts: Post[];
  viewCounts: Record<string, number>;
  getPostById: (id: string) => Post | undefined;
  getPostsByCategory: (category: string) => Post[];
  getCategoryCount: (category: string) => number;
  getCategoryStats: (category: string) => {
    count: number;
    topTags: string[];
  };
  getAllCategories: () => Category[];
  getAdjacentPosts: (id: string) => {
    prevPost: { id: string; title: string } | null;
    nextPost: { id: string; title: string } | null;
  };
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const posts = useMemo(() => loadAllPosts(), []);

  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (posts.length === 0) return;

    const postIds = posts.map((p) => p.id);

    supabase
      .from("post_views")
      .select("post_id, views")
      .in("post_id", postIds)
      .then(({ data }) => {
        if (!data) return;
        const counts = Object.fromEntries(
          data.map((row) => [row.post_id, row.views]),
        );
        setViewCounts(counts);
      });
  }, [posts]);

  const value = useMemo<PostsContextType>(
    () => ({
      posts,
      viewCounts,
      getPostById: (id: string) => posts.find((p) => p.id === id),
      getPostsByCategory: (category: string) =>
        posts.filter((p) => p.category === category),
      getCategoryCount: (category: string) =>
        posts.filter((p) => p.category === category).length,
      getAllCategories: () => {
        const categories = Array.from(new Set(posts.map((p) => p.category)));
        return categories.map((name) => ({
          name,
          count: posts.filter((p) => p.category === name).length,
        }));
      },

      getCategoryStats: (category: string) => {
        const categoryPosts = posts.filter((p) => p.category === category);
        return {
          count: categoryPosts.length,
          topTags: Array.from(
            new Set(categoryPosts.flatMap((p) => p.tags)),
          ).slice(0, 5),
        };
      },
      getAdjacentPosts: (id: string) => {
        const currentIndex = posts.findIndex((p) => p.id === id);
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
      },
    }),
    [posts, viewCounts],
  );

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
