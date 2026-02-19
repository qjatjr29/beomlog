export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  password: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface CommentFormData {
  author: string;
  password: string;
  content: string;
}

export interface CommentSectionProps {
  postId: string;
  title?: string;
  iconType: "comment" | "guestbook";
  pageSize?: number;
}
