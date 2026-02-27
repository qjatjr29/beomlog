import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { usePosts } from "@/contexts/PostsContext";
import { loadGroupById } from "../utils/group-loader";
import { PostCard } from "../components/PostCard";
import { Pagination } from "@/shared/components/Pagination";
import { usePagination } from "@/shared/hooks/usePagination";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { POSTS_PER_PAGE } from "@/shared/constants";

export const GroupPostList = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const group = loadGroupById(groupId!);
  const { viewCounts, commentCounts } = usePostStorage();
  const { posts } = usePosts();

  const groupPosts = posts
    .filter((p) => p.groupId === groupId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const { currentPage, totalPages, currentItems, handlePageChange } =
    usePagination(groupPosts, POSTS_PER_PAGE);

  if (!group) {
    return (
      <div className="py-10 text-center text-gray-500">
        그룹을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          to={`/posts/${group.category}`}
          className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blog-primary mb-3 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> {group.category}로
        </Link>

        <div className="pb-4 border-b-2 border-dotted border-gray-300 dark:border-gray-600">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {group.title}
          </h1>
          {group.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {group.description}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            총 {groupPosts.length}개의 글
          </p>
        </div>
      </div>

      {/* 포스트 목록 */}
      <div className="space-y-3 mb-8">
        {currentItems.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <PostCard
              post={post}
              viewCount={viewCounts[post.id] ?? 0}
              commentCount={commentCounts[post.id] ?? 0}
              selectedTag={null}
            />
          </motion.div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
