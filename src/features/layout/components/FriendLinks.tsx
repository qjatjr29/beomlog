import { useState } from "react";
import { Users, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { FRIEND_BLOGS } from "../constants/links";

export const FriendLinks = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (FRIEND_BLOGS.length === 0) return null;

  return (
    <div className="mt-3">
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-blog-lighter dark:bg-gray-700 hover:bg-blog-light dark:hover:bg-gray-600 transition-colors group"
      >
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blog-primary" />
          <span className="text-[11px] font-bold text-blog-primary tracking-wide">
            일촌
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {FRIEND_BLOGS.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      {/* 일촌 목록 */}
      {isOpen && (
        <div className="mt-1.5 border border-blog-border dark:border-gray-600 rounded-md overflow-hidden">
          {FRIEND_BLOGS.map((friend, i) => (
            <a
              key={i}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 hover:bg-blog-lightest dark:hover:bg-gray-700 transition-colors group border-b border-blog-border-light dark:border-gray-700 last:border-b-0"
            >
              {/* 아바타 */}
              <div className="w-7 h-7 rounded-full bg-blog-light dark:bg-gray-600 flex items-center justify-center shrink-0 text-sm">
                {friend.emoji ?? "🙂"}
              </div>
              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-blog-primary transition-colors">
                  {friend.name}
                </div>
                {friend.description && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                    {friend.description}
                  </div>
                )}
              </div>
              <ExternalLink className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-blog-primary transition-colors" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
