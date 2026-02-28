import { VisitorStats } from "@/shared/types";
import { Moon, Sun, Unlock, Lock } from "lucide-react";

interface VisitorBarProps {
  visitorStats: VisitorStats;
  isDark: boolean;
  isAdminMode: boolean;
  onToggleDark: () => void;
  onAdminClick: () => void;
}

export const VisitorBar = ({
  visitorStats,
  isDark,
  isAdminMode,
  onToggleDark,
  onAdminClick,
}: VisitorBarProps) => (
  <div className="flex items-center justify-between mb-2 px-1">
    <div className="text-xs font-bold tracking-wide">
      <span className="text-blog-primary">TODAY </span>
      <span className="text-blog-primary font-bold">{visitorStats.today}</span>
      <span className="text-gray-400 dark:text-gray-500 mx-1">|</span>
      <span className="text-gray-500 dark:text-gray-400">TOTAL </span>
      <span className="text-gray-500 dark:text-gray-400 font-bold">
        {visitorStats.total}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleDark}
        className="p-1.5 rounded transition-all text-gray-500 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 border border-gray-300 dark:border-gray-600"
        title={isDark ? "라이트 모드" : "다크 모드"}
      >
        {isDark ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        onClick={onAdminClick}
        className={`p-1.5 rounded transition-all ${
          isAdminMode
            ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
            : "bg-white/20 text-gray-600 dark:text-gray-300 hover:bg-white/40 border border-gray-300 dark:border-gray-600"
        }`}
        title={isAdminMode ? "관리자 모드 종료" : "관리자 모드"}
      >
        {isAdminMode ? (
          <Unlock className="w-3.5 h-3.5" />
        ) : (
          <Lock className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  </div>
);
