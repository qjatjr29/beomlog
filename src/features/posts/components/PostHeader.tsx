import { Calendar, Eye } from "lucide-react";
import { PostHeaderProps } from "../types";

export const PostHeader = ({ post, views }: PostHeaderProps) => (
  <div className="mb-8 pb-6 border-b-2 border-dotted border-gray-300">
    <h1 className="text-4xl font-bold mb-5 text-gray-800 wrap-break-word leading-tight">
      {post.title}
    </h1>

    <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {post.createdAt}
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
          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
        >
          #{tag}
        </span>
      ))}
    </div>
  </div>
);
