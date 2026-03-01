import { useState } from "react";
import { Users, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { FRIEND_BLOGS } from "../constants/links";
import { FriendBlog } from "../types";

const FriendAvatar = ({ friend }: { friend: FriendBlog }) => {
  const [imgError, setImgError] = useState(false);

  const isUrl = (str: string) =>
    str.startsWith("http://") || str.startsWith("https://");

  // emoji가 URL이면 이미지로
  if (friend.emoji && isUrl(friend.emoji) && !imgError) {
    return (
      <img
        src={friend.emoji}
        alt={friend.name}
        className="w-7 h-7 rounded-full object-cover shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  // emoji가 이모지 문자면 그대로
  if (friend.emoji && !isUrl(friend.emoji)) {
    return (
      <div className="w-7 h-7 rounded-full bg-blog-light dark:bg-gray-600 flex items-center justify-center shrink-0 text-sm">
        {friend.emoji}
      </div>
    );
  }

  // 없거나 이미지 로드 실패 시 → favicon 자동 추출
  const domain = new URL(friend.url).hostname;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <img
      src={faviconUrl}
      alt={friend.name}
      className="w-7 h-7 rounded-full object-cover shrink-0 bg-blog-light dark:bg-gray-600 p-0.5"
      onError={(e) => {
        // favicon도 실패하면 이니셜 표시
        e.currentTarget.style.display = "none";
        e.currentTarget.nextElementSibling?.classList.remove("hidden");
      }}
    />
  );
};

export const FriendLinks = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (FRIEND_BLOGS.length === 0) return null;

  return (
    <div className="mt-3">
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
              <FriendAvatar friend={friend} />
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
