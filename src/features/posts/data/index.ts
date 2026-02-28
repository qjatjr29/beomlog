import { Post } from "@/features/posts/types";
import {
  extractCategoryByPath,
  extractFilenameByPath,
  parsePostContent,
} from "../utils/post-parser";

export const loadAllPosts = (): Post[] => {
  const postFiles = import.meta.glob("/src/assets/posts/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const posts: Post[] = [];

  for (const [filepath, markdownFile] of Object.entries(postFiles)) {
    try {
      const { frontMatter, content } = parsePostContent(markdownFile);
      const filename = extractFilenameByPath(filepath);
      const { category, categorySlug } = extractCategoryByPath(
        filepath,
        frontMatter,
      );
      const post: Post = {
        id: frontMatter.id,
        title: frontMatter.title,
        content,
        category,
        categorySlug,
        tags: frontMatter.tags,
        date: frontMatter.date,
        createdAt: frontMatter.createdAt ?? frontMatter.date,
        slug: frontMatter.slug ?? frontMatter.id,
        groupId: frontMatter.groupId ?? "",
        coverImage: frontMatter.coverImage ?? "",
        thumbnail: frontMatter.thumbnail ?? "",
        filename,
        excerpt: frontMatter.excerpt ?? frontMatter.title,
      };
      posts.push(post);
    } catch (error) {
      console.error(`❌ Failed to parse ${filepath}:`, error);
    }
  }

  return posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

export const loadPostBySlug = (slug: string): Post | null => {
  return loadAllPosts().find((p) => p.id === slug) || null;
};

export const loadPostsByCategory = (category: string): Post[] => {
  return loadAllPosts().filter((p) => p.category === category);
};

export const filterByCategory = (posts: Post[], category?: string) => {
  return category ? posts.filter((p) => p.category === category) : posts;
};

export const filterByTag = (posts: Post[], tag?: string | null) => {
  return tag ? posts.filter((p) => p.tags.includes(tag)) : posts;
};

export const getAvailableTags = (posts: Post[]) => {
  return Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
};

export const getPaginatedPosts = (
  posts: Post[],
  page: number,
  perPage: number,
) => {
  const start = (page - 1) * perPage;
  return posts.slice(start, start + perPage);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(loadAllPosts().map((p) => p.category))).sort();
};

export const getAllTags = (): string[] => {
  return Array.from(new Set(loadAllPosts().flatMap((p) => p.tags))).sort();
};
