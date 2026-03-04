import { Calendar, Eye } from "lucide-react";
import { Post } from "../../types";
import { formatDateTime } from "@/shared/utils";

export interface PostHeaderProps {
  post: Post;
  views: number;
}

export const PostHeader = ({ post, views }: PostHeaderProps) => (
  <div className="mb-8 pb-6 border-b-2 border-dotted border-gray-300 dark:border-gray-600">
    <h1 className="text-4xl font-bold mb-5 text-gray-800 dark:text-gray-100 wrap-break-word leading-tight">
      {post.title}
    </h1>
    <div className="flex items-center gap-4 mb-5 text-xs text-gray-500 dark:text-gray-400">
      <span className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {formatDateTime(post.createdAt)}
      </span>
      <span className="flex items-center gap-1">
        <Eye className="w-3 h-3" />
        {views}
      </span>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <span className="px-3 py-1 bg-blog-light border border-blog-border rounded text-xs text-blog-primary-hover font-medium">
        {post.category}
      </span>
      {post.tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
        >
          #{tag}
        </span>
      ))}
    </div>
  </div>
);
