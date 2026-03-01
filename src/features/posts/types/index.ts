export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  tags: string[];
  date: string; // 표시용
  createdAt: string; // 정렬용
  excerpt: string;
  content: string;
  filename: string;
  views?: number;
  updatedAt?: string;
  groupId?: string;
  coverImage?: string;
  thumbnail?: string;
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

// 파서에서 사용하는 타입
export interface PostFrontMatter {
  id: string;
  title: string;
  slug: string;
  date: string;
  createdAt?: string;
  tags: string[];
  excerpt?: string;
  category: string;
  lastEdited?: string;
  groupId?: string;
  groupSlug?: string;
  coverImage?: string;
  thumbnail?: string;
}

// usePostNavigation 반환값
export interface PostNavigationResult {
  prevPost: { id: string; title: string } | null;
  nextPost: { id: string; title: string } | null;
}

// NavPost: PostNavigation 컴포넌트와 hook에서 공유
export interface NavPost {
  id: string;
  title: string;
}
