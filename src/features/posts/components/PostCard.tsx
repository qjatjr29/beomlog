import { Link } from "react-router";
import { Calendar, Eye, MessageSquare } from "lucide-react";
import { PostCardProps } from "../types";

export const PostCard = ({
  post,
  viewCount,
  commentCount,
  selectedTag,
}: PostCardProps) => {
  return (
    <Link
      to={`/post/${post.id}`}
      className="block rounded overflow-hidden border border-blog-border dark:border-gray-700 hover:shadow-md transition-all group"
    >
      {/* 제목 바 */}
      <div className="bg-linear-to-r from-blog-primary to-blog-primary-hover px-3 py-1.5 flex items-center justify-between">
        <h3 className="text-white text-xs font-bold truncate group-hover:text-white/80 transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 text-white/70 text-[10px] shrink-0 ml-2">
          <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px]">
            {post.category}
          </span>
          <span className="flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5" />
            {post.createdAt}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-3 bg-white dark:bg-gray-800">
        {post.excerpt && (
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedTag === tag
                    ? "bg-blog-primary text-white"
                    : "bg-blog-lighter dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 pt-2 border-t border-blog-border-light dark:border-gray-700">
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            {viewCount}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3" />
            {commentCount ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
};
