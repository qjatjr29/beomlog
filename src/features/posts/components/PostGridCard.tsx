import { Link } from "react-router";
import { Eye, MessageCircle, Image } from "lucide-react";
import { PostGridCardProps } from "../types";

// 기본 이미지 (public 폴더에 넣거나 인라인 SVG 사용)
const DEFAULT_THUMBNAIL = "/default-thumbnail.png"; // public/default-thumbnail.png

export const PostGridCard = ({
  post,
  viewCount,
  commentCount,
}: PostGridCardProps) => {
  const thumbnail = post.thumbnail || DEFAULT_THUMBNAIL;
  const hasThumbnail = !!post.thumbnail;

  return (
    <Link
      to={`/post/${post.id}`}
      className="flex flex-col h-full rounded-lg border border-blog-border dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-blog-primary dark:hover:border-blog-primary transition-all group overflow-hidden"
    >
      {/* 썸네일 이미지 영역 */}
      <div className="aspect-video bg-blog-lighter dark:bg-gray-700 overflow-hidden relative">
        {hasThumbnail ? (
          <img
            src={thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          // 기본 이미지: 블로그 컬러 그라디언트 + 아이콘
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blog-lightest to-blog-lighter dark:from-gray-700 dark:to-gray-800">
            <Image className="w-6 h-6 text-blog-primary opacity-30" />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* 날짜 */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">
          {post.date}
        </div>

        {/* 제목 */}
        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-2 flex-1 group-hover:text-blog-primary transition-colors leading-relaxed">
          {post.title}
        </h3>

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 bg-blog-lightest dark:bg-gray-700 text-blog-primary rounded-full"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="text-[9px] text-gray-400">
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* 하단 통계 */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-0.5 text-[9px] text-gray-400 dark:text-gray-500">
            <Eye className="w-2.5 h-2.5" /> {viewCount}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] text-gray-400 dark:text-gray-500">
            <MessageCircle className="w-2.5 h-2.5" /> {commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
};
