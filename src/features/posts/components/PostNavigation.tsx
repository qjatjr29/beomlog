import { Link } from "react-router";
import { PostNavigationProps } from "../types";

export const PostNavigation = ({ prevPost, nextPost }: PostNavigationProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 pb-8">
    {prevPost ? (
      <Link
        to={`/post/${prevPost.id}`}
        className="group bg-blog-lighter border border-blog-border dark:border-gray-700 p-4 rounded hover:bg-blog-light transition-colors"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 group-hover:text-blog-primary transition-colors">
          ← 이전 글
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
          {prevPost.title}
        </div>
      </Link>
    ) : (
      <div />
    )}
    {nextPost && (
      <Link
        to={`/post/${nextPost.id}`}
        className="group bg-blog-lighter border border-blog-border dark:border-gray-700 p-4 rounded hover:bg-blog-light transition-colors text-right"
      >
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 group-hover:text-blog-primary transition-colors">
          다음 글 →
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
          {nextPost.title}
        </div>
      </Link>
    )}
  </div>
);
