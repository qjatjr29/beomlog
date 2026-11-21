import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import { Post } from "@/features/posts/types";
import { sanitizeExcerptPreview } from "@/shared/utils/post.utils";

interface BookPostGridCardProps {
  post: Post;
}

const extractFirstImageFromContent = (content: string): string => {
  const imgTagMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (imgTagMatch?.[1]) return imgTagMatch[1];

  const mdImageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (mdImageMatch?.[1]) return mdImageMatch[1];

  return "";
};

export const BookPostGridCard = ({ post }: BookPostGridCardProps) => {
  const preview = sanitizeExcerptPreview(post.description || post.excerpt);
  const coverImage =
    post.thumbnail ||
    post.coverImage ||
    extractFirstImageFromContent(post.content);

  return (
    <Link
      to={`/post/${post.id}`}
      className="block rounded-lg overflow-hidden border border-blog-border dark:border-gray-700 hover:shadow-lg transition-all group h-full">
      <div className="aspect-4/3 bg-blog-lighter dark:bg-gray-800 overflow-hidden relative">
        {coverImage ? (
          <img
            src={coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-blog-primary opacity-20" />
          </div>
        )}
      </div>

      <div className="p-3 bg-white dark:bg-gray-800">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mb-1 group-hover:text-blog-primary transition-colors">
          {post.title}
        </h3>
        {preview && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
            {preview}
          </p>
        )}
      </div>
    </Link>
  );
};
