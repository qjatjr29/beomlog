import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { VisitorStats } from "@/shared/types";
import { getStatusText, setStatusText } from "@/data/storage/setting.storage";
import minimiImage from "@/assets/minimiImage.jpeg";
import { useAdmin } from "@/contexts/AdminContext";
import { SOCIAL_LINKS } from "../constants/social";
import { BGMPlayer } from "@/features/bgm/components/BGMPlayer";
import { FriendLinks } from "./FriendLinks";

export const ProfileCard = ({
  isAdminMode,
  visitorStats,
}: {
  isAdminMode: boolean;
  visitorStats: VisitorStats;
}) => {
  const { adminPassword } = useAdmin();
  const [statusText, setStatusTextState] = useState("코딩하는 하루 ☕");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState("");

  useEffect(() => {
    getStatusText().then(setStatusTextState);
  }, []);

  const handleSaveStatus = async () => {
    const success = await setStatusText(tempStatus, adminPassword);
    if (success) {
      setStatusTextState(tempStatus);
      setIsEditingStatus(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 미니미 이미지 */}
      <div className="w-full aspect-square bg-linear-to-b from-blog-light to-blog-gradient-end border border-blog-border-lighter rounded-sm flex items-center justify-center overflow-hidden">
        <img
          src={minimiImage}
          alt="미니미"
          className="w-24 h-24 object-cover rounded-full drop-shadow-md"
        />
      </div>

      {/* TODAY IS */}
      <div className="p-1.5 bg-[hsl(40,80%,95%)] dark:bg-gray-700 border border-[hsl(40,70%,70%)] dark:border-gray-600 rounded-sm text-[10px]">
        <span className="font-bold text-gray-800 dark:text-gray-200">
          TODAY IS..
        </span>
        {isAdminMode && isEditingStatus ? (
          <div className="flex items-center gap-1 mt-1">
            <input
              type="text"
              value={tempStatus}
              onChange={(e) => setTempStatus(e.target.value)}
              className="flex-1 border border-blog-border dark:border-gray-500 rounded px-1.5 py-0.5 text-[10px] outline-none focus:border-blog-primary bg-white dark:bg-gray-800 dark:text-gray-200"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveStatus();
                if (e.key === "Escape") setIsEditingStatus(false);
              }}
            />
            <button
              onClick={handleSaveStatus}
              className="p-0.5 text-blog-primary hover:text-blog-primary-hover"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsEditingStatus(false)}
              className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-gray-700 dark:text-gray-300">
              {statusText}
            </span>
            {isAdminMode && (
              <button
                onClick={() => {
                  setTempStatus(statusText);
                  setIsEditingStatus(true);
                }}
                className="text-[9px] px-1 py-0.5 bg-blog-light dark:bg-gray-600 border border-blog-border dark:border-gray-500 rounded text-blog-primary hover:bg-blog-gradient-end dark:hover:bg-gray-500 transition-colors ml-1 shrink-0"
              >
                수정
              </button>
            )}
          </div>
        )}
      </div>

      {/* 이름 & 소개 */}
      <div className="px-0.5">
        <div className="font-bold text-sm text-gray-800 dark:text-gray-100 mb-1">
          범석
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400">
          🧑🏻‍💻 Backend Developer
        </div>
      </div>

      {/* 방문자 수 */}
      <div className="grid grid-cols-2 gap-1 text-[10px]">
        <div className="bg-blog-lighter dark:bg-gray-700 border border-blog-border-light dark:border-gray-600 rounded-sm p-1.5 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-0.5">TODAY</div>
          <div className="text-blog-primary font-bold">
            {visitorStats.today}
          </div>
        </div>
        <div className="bg-blog-lighter dark:bg-gray-700 border border-blog-border-light dark:border-gray-600 rounded-sm p-1.5 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-0.5">TOTAL</div>
          <div className="text-blog-primary font-bold">
            {visitorStats.total}
          </div>
        </div>
      </div>

      <BGMPlayer isAdminMode={isAdminMode} />
      <div className="border-t border-blog-border-light dark:border-gray-700" />

      {/* 소셜 링크 */}
      <div className="flex items-center justify-around">
        {SOCIAL_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              href={link.href}
              target={link.id !== "email" ? "_blank" : undefined}
              rel={link.id !== "email" ? "noopener noreferrer" : undefined}
              className="p-1.5 hover:bg-blog-light dark:hover:bg-gray-700 rounded-full transition-colors"
              title={link.label}
            >
              <Icon
                className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-colors ${link.hoverColor}`}
              />
            </a>
          );
        })}
      </div>
      <FriendLinks /> 
    </div>
  );
};
