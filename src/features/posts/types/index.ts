export interface PostNavigationResult {
  prevPost: { id: string; title: string } | null;
  nextPost: { id: string; title: string } | null;
}

export interface ParsedPost extends Post {
  path?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  tags: string[];
  createdAt: string;
  excerpt: string;
  content: string;
  filename: string;
  views?: number;
  updatedAt?: string;
  groupId?: string;
  coverImage?: string;
}

export interface GroupMeta {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  coverImage: string;
  description: string;
  postCount: number;
  lastEdited: string;
}

export interface PostFrontMatter {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt?: string;
  category: string;
  lastEdited?: string;
  groupId?: string;
  coverImage?: string;
}

export interface ParsedPost {
  frontMatter: PostFrontMatter;
  content: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface PostCardProps {
  post: Post;
  viewCount: number;
  commentCount?: number;
  selectedTag: string | null;
}

export interface PostHeaderProps {
  post: Post;
  views: number;
}

interface NavPost {
  id: string;
  title: string;
}

export interface PostNavigationProps {
  prevPost: NavPost | null;
  nextPost: NavPost | null;
}

export interface PostListHeaderProps {
  category?: string;
  totalCount: number;
}
