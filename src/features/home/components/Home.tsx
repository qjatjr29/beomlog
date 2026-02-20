import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Quote } from "lucide-react";
import { MiniRoom } from "../../mini-room/components";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { Pagination } from "@/shared/components/Pagination";
import { usePagination } from "@/shared/hooks/usePagination";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { PostCard } from "@/features/posts/components/PostCard";
import { getComments } from "@/data/storage";
import { motion } from "framer-motion";

export const Home = () => {
  const {
    filteredPosts: allPosts,
    viewCounts,
    commentCounts,
  } = usePostStorage();

  const {
    currentPage,
    totalPages,
    currentItems: currentPosts,
    handlePageChange,
  } = usePagination(allPosts, POSTS_PER_PAGE);

  const [latestComment, setLatestComment] = useState<{
    author: string;
    content: string;
  } | null>(null);
  useEffect(() => {
    getComments("guestbook").then((comments) => {
      if (comments.length > 0) {
        const latest = comments[comments.length - 1];
        setLatestComment({ author: latest.author, content: latest.content });
      }
    });
  }, []);

  return (
    <div>
      {/* Updated news */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-gray-700">Updated news</span>
        </div>
        <div className="space-y-0">
          {allPosts.slice(0, 4).map((post) => (
            <div
              key={post.id}
              className="border-b border-blog-border-light py-1.5"
            >
              <Link
                to={`/post/${post.id}`}
                className="text-[11px] text-gray-600 hover:text-blog-primary transition-colors flex items-start gap-1"
              >
                <span className="text-blog-primary shrink-0">•</span>
                {post.title}
              </Link>
            </div>
          ))}
          {allPosts.length === 0 && (
            <div className="border-b border-blog-border-light py-1.5">
              <p className="text-[11px] text-gray-400">
                • 아직 게시물이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mini Room */}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-600">Mini Room</span>
      </div>
      <MiniRoom />

      {/* What Visitors say */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-blog-primary mb-2">
          What Visitors say
        </h3>
        <div className="p-2.5 bg-blog-lightest border border-blog-border-light rounded text-[11px]">
          {latestComment ? (
            <div className="flex items-start gap-2">
              <Quote className="w-3 h-3 text-blog-border mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-600 italic">
                  "{latestComment.content}"
                </p>
                <p className="text-blog-primary mt-1">
                  — {latestComment.author}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic pl-1">
              아직 방명록이 없어요. 첫 번째로 한마디 남겨주세요! 😎
            </p>
          )}
          <div className="mt-2 text-right">
            <Link
              to="/guestbook"
              className="text-[10px] text-blog-primary hover:underline"
            >
              방명록 보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* 전체 게시물 목록 헤더 */}
      <div className="mb-4 pb-2 border-b-2 border-dotted border-gray-300">
        <h2 className="text-sm flex items-center gap-2 font-bold text-gray-800">
          <BookOpen className="w-4 h-4 text-blog-primary" />
          전체 게시물
          <span className="text-blog-primary text-xs">({allPosts.length})</span>
        </h2>
      </div>

      <div className="space-y-2 mb-6">
        {currentPosts.map((post, i) => (
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
