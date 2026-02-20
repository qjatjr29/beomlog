import { Link } from "react-router";
import { Calendar, Eye, MessageSquare } from "lucide-react";
import { PostCardProps } from "../types";

export const HomePostCard = ({
  post,
  viewCount,
  commentCount,
}: PostCardProps) => (
  <Link
    to={`/post/${post.id}`}
    className="flex items-center gap-2 py-2 border-b border-blog-border-light hover:bg-blog-lightest transition-colors group px-1"
  >
    <span className="shrink-0 text-[9px] px-1.5 py-0.5 bg-blog-light border border-blog-border text-blog-primary rounded font-bold whitespace-nowrap">
      {post.category}
    </span>

    <span className="flex-1 min-w-0 text-[12px] text-gray-700 group-hover:text-blog-primary transition-colors truncate font-medium">
      {post.title}
    </span>

    {post.tags.length > 0 && (
      <span className="hidden sm:inline shrink-0 text-[9px] px-1.5 py-0.5 bg-blog-lighter text-gray-400 rounded">
        #{post.tags[0]}
        {post.tags.length > 1 && ` +${post.tags.length - 1}`}
      </span>
    )}

    {/* 날짜 / 조회수 / 댓글 */}
    <div className="flex items-center gap-2 shrink-0 text-[10px] text-gray-400">
      <span className="hidden sm:inline items-center gap-0.5">
        <Calendar className="w-2.5 h-2.5 inline mr-0.5" />
        {post.createdAt}
      </span>
      <span className="flex items-center gap-0.5">
        <Eye className="w-2.5 h-2.5" />
        {viewCount}
      </span>
      <span className="flex items-center gap-0.5">
        <MessageSquare className="w-2.5 h-2.5" />
        {commentCount ?? 0}
      </span>
    </div>
  </Link>
);
