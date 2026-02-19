import { Link } from "react-router";
import { Calendar, Eye } from "lucide-react";
import { PostCardProps } from "../types";

export const PostCard = ({ post, viewCount, selectedTag }: PostCardProps) => (
  <Link
    to={`/post/${post.id}`}
    className="block bg-linear-to-r from-blog-lightest to-white rounded border border-gray-200 p-5 hover:border-blog-border hover:shadow-md transition-all group"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-m text-gray-800 flex-1 group-hover:text-blog-primary transition-colors">
        {post.title}
      </h3>
      <span className="px-2 py-1 bg-blog-light border border-blog-border rounded text-xs text-gray-700 ml-4 whitespace-nowrap">
        {post.category}
      </span>
    </div>

    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
      <span className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {post.createdAt}
      </span>
      <span className="flex items-center gap-1">
        <Eye className="w-3 h-3" />
        {viewCount}
      </span>
    </div>

    {post.tags.length > 0 && (
      <div className="flex items-center gap-2 flex-wrap">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-1 rounded ${
              selectedTag === tag
                ? "bg-blog-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            #{tag}
          </span>
        ))}
      </div>
    )}
  </Link>
);
