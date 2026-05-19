import { useState, useRef, useEffect, useCallback } from "react";
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

const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 5;
const SIDEBAR_MAX_WIDTH = 192;
const SIDEBAR_MIN_WIDTH = 144;
const SIDEBAR_RIGHT_GAP = 32;
const SIDEBAR_NAV_GAP = 12;

export const GroupSidebar = ({
  currentPost,
  group,
  groupPosts,
}: GroupSidebarProps) => {
  const navigate = useNavigate();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_MAX_WIDTH);

  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  // 현재 아이템 index 기반으로 직접 스크롤 계산
  const currentIndex = groupPosts.findIndex((p) => p.id === currentPost.id);
  const containerHeight = ITEM_HEIGHT * VISIBLE_COUNT + 16;

  const scrollToCurrentItem = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) return;
      // 각 아이템 높이 * 현재 인덱스 - 컨테이너 중앙 오프셋
      const scrollTop =
        currentIndex * ITEM_HEIGHT -
        Math.floor(VISIBLE_COUNT / 2) * ITEM_HEIGHT;
      container.scrollTop = Math.max(0, scrollTop);
    },
    [currentIndex],
  );

  // 데스크탑: 마운트 + currentIndex 변경 시
  useEffect(() => {
    // 약간의 딜레이로 DOM 렌더링 후 실행 보장
    const timer = setTimeout(() => {
      scrollToCurrentItem(desktopScrollRef.current);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentIndex, scrollToCurrentItem]);

  // 모바일: 패널 열릴 때
  useEffect(() => {
    if (isMobileOpen) {
      const timer = setTimeout(() => {
        scrollToCurrentItem(mobileScrollRef.current);
      }, 100); // AnimatePresence 애니메이션 후
      return () => clearTimeout(timer);
    }
  }, [isMobileOpen, scrollToCurrentItem]);

  useEffect(() => {
    const updateVisibility = () => {
      const nav = document.querySelector(
        "[data-nav-tabs]",
      ) as HTMLElement | null;

      if (!nav) {
        setShowDesktopSidebar(window.innerWidth >= 1280);
        setSidebarWidth(SIDEBAR_MAX_WIDTH);
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const availableWidth = Math.floor(
        window.innerWidth - SIDEBAR_RIGHT_GAP - navRect.right - SIDEBAR_NAV_GAP,
      );

      if (window.innerWidth < 1280 || availableWidth < SIDEBAR_MIN_WIDTH) {
        setShowDesktopSidebar(false);
        setSidebarWidth(SIDEBAR_MAX_WIDTH);
        return;
      }

      setShowDesktopSidebar(true);
      setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, availableWidth));
    };
    updateVisibility();
    window.addEventListener("resize", updateVisibility);
    return () => window.removeEventListener("resize", updateVisibility);
  }, []);

  const handlePostClick = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (postId === currentPost.id) return;
    setNavigatingId(postId);
    await new Promise((r) => setTimeout(r, 250));
    navigate(`/post/${postId}`);
  };

  const renderList = (scrollRef: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={scrollRef}
      className="overflow-y-auto p-2 space-y-0.5"
      style={{ height: `${containerHeight}px` }}
    >
      {groupPosts.map((post) => {
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
            style={{ height: `${ITEM_HEIGHT}px` }}
            className={`flex items-center gap-2 px-2 rounded text-[11px] transition-colors group/item cursor-pointer ${
              isCurrent
                ? "bg-blog-light dark:bg-gray-700 text-blog-primary font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-blog-lightest dark:hover:bg-gray-700 hover:text-blog-primary"
            }`}
          >
            <span className="shrink-0">
              {isCurrent ? (
                <CheckCircle2 className="w-3 h-3 text-blog-primary" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover/item:text-blog-primary/50" />
              )}
            </span>
            <span className="flex-1 truncate min-w-0">{post.title}</span>
          </motion.a>
        );
      })}
    </div>
  );

  return (
    <>
      {/* xl 이상: fixed 사이드바 */}
      {showDesktopSidebar && (
        <div
          className="fixed z-40 hidden xl:block right-8 top-20 transition-[height,opacity,transform] duration-300"
          style={{
            width: `${sidebarWidth}px`,
            height: `${isCollapsed ? 44 : containerHeight + 56}px`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 border border-blog-border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {isCollapsed ? (
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold text-blog-primary truncate">
                  {group.title}
                </span>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-1 rounded hover:bg-blog-lightest dark:hover:bg-gray-700 transition-colors"
                  aria-label="Expand sidebar"
                >
                  <ChevronDown className="w-4 h-4 text-blog-primary" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 group">
                  <div className="w-1 h-3 bg-blog-primary rounded-full shrink-0" />
                  <span className="text-[11px] font-bold text-blog-primary tracking-wider truncate">
                    {group.title}
                  </span>
                  <span className="ml-auto text-[10px] text-gray-400 shrink-0">
                    {currentIndex + 1}/{groupPosts.length}
                  </span>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="ml-2 p-1 rounded hover:bg-blog-lightest dark:hover:bg-gray-700 transition-colors"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="p-0">{renderList(desktopScrollRef)}</div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* xl 미만: 포스트 상단 인라인 패널 */}
      <div className="xl:hidden mb-4 border border-blog-border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
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

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-blog-border-light dark:border-gray-700"
            >
              {renderList(mobileScrollRef)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
