import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Post, GroupMeta } from "@/features/posts/types";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";

interface GroupSidebarProps {
  currentPost: Post;
  group: GroupMeta;
  groupPosts: Post[];
}

export const GroupSidebar = ({
  currentPost,
  group,
  groupPosts,
}: GroupSidebarProps) => {
  const navigate = useNavigate();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handlePostClick = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (postId === currentPost.id) return;
    setNavigatingId(postId);
    await new Promise((r) => setTimeout(r, 250));
    navigate(`/post/${postId}`);
  };

  const currentIndex = groupPosts.findIndex((p) => p.id === currentPost.id);

  const PostList = () => (
    <div className="overflow-y-auto max-h-60 xl:max-h-[calc(100vh-200px)] p-2 space-y-0.5">
      {groupPosts.map((post, idx) => {
        const isCurrent = post.id === currentPost.id;
        const isNavigating = navigatingId === post.id;
        return (
          <motion.a
            key={post.id}
            href={`/post/${post.id}`}
            onClick={(e) => handlePostClick(e, post.id)}
            animate={
              isNavigating ? { opacity: 0.5, x: 4 } : { opacity: 1, x: 0 }
            }
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-2 px-2 py-1.5 rounded text-[11px] transition-colors group/item cursor-pointer ${
              isCurrent
                ? "bg-blog-light dark:bg-gray-700 text-blog-primary font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-blog-lightest dark:hover:bg-gray-700 hover:text-blog-primary"
            }`}
          >
            <span className="shrink-0 mt-0.5 text-[10px] text-gray-400 w-4 text-right">
              {idx + 1}.
            </span>
            <span className="shrink-0 mt-0.5">
              {isCurrent ? (
                <CheckCircle2 className="w-3 h-3 text-blog-primary" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover/item:text-blog-primary/50" />
              )}
            </span>
            <span className="leading-relaxed line-clamp-2">{post.title}</span>
          </motion.a>
        );
      })}
    </div>
  );

  return (
    <>
      {/* xl 이상: fixed 사이드바 */}
      <div className="fixed z-40 hidden xl:block w-44 right-8 top-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 border border-blog-border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
        >
          <Link
            to={`/group/${group.id}`}
            className="flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 hover:bg-blog-lightest dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="w-1 h-3 bg-blog-primary rounded-full shrink-0" />
            <span className="text-[11px] font-bold text-blog-primary tracking-wider truncate group-hover:underline">
              {group.title}
            </span>
          </Link>
          <PostList />
        </motion.div>
      </div>

      {/* xl 미만: 포스트 상단 인라인 패널 */}
      <div className="xl:hidden mb-4 border border-blog-border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* 헤더 - 클릭해서 접기/펼치기 */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blog-lightest dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-blog-primary" />
            <span className="text-[11px] font-bold text-blog-primary truncate">
              {group.title}
            </span>
            <span className="text-[10px] text-gray-400">
              ({currentIndex + 1}/{groupPosts.length})
            </span>
          </div>
          {isMobileOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
        </button>

        {/* 펼쳐지는 목록 */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-blog-border-light dark:border-gray-700"
            >
              <PostList />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
