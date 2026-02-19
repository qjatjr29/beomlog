import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { VisitorStats } from "@/shared/types";
import { getStatusText, setStatusText } from "@/data/storage/setting.storage";
import minimiImage from "@/assets/minimiImage.jpeg";
import { useAdmin } from "@/contexts/AdminContext";

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
    <div className="bg-white border-2 border-blog-border rounded-lg shadow-md overflow-hidden">
      <div className="bg-linear-to-r from-blog-primary to-blog-primary-hover px-3 py-2">
        <span className="text-white text-sm">Profile</span>
      </div>
      <div className="p-4 bg-linear-to-b from-white to-gray-50">
        {/* 프로필 이미지 */}
        <div className="relative mb-4">
          <div className="w-full h-40 bg-linear-to-b from-blog-light to-blog-gradient-end rounded border-2 border-blog-border-lighter flex items-center justify-center overflow-hidden">
            <img
              src={minimiImage}
              alt="미니미"
              className="w-32 h-32 object-cover rounded-full"
            />
          </div>
        </div>

        {/* 상태 메시지 */}
        <div className="mb-3 p-2 bg-blog-lightest border border-blog-border-light rounded text-xs">
          <div className="text-gray-500 mb-1">TODAY IS...</div>
          {isAdminMode && isEditingStatus ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                className="flex-1 border border-blog-border rounded px-1.5 py-0.5 text-xs outline-none focus:border-blog-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveStatus();
                  if (e.key === "Escape") setIsEditingStatus(false);
                }}
              />
              <button
                onClick={handleSaveStatus}
                className="p-0.5 text-blog-primary hover:text-blog-primary-hover transition-colors"
                title="저장"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingStatus(false)}
                className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="취소"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{statusText}</span>
              {isAdminMode && (
                <button
                  onClick={() => {
                    setTempStatus(statusText);
                    setIsEditingStatus(true);
                  }}
                  className="text-xs px-1.5 py-0.5 bg-blog-light border border-blog-border rounded text-blog-primary hover:bg-blog-gradient-end transition-colors ml-2 shrink-0"
                >
                  수정
                </button>
              )}
            </div>
          )}
        </div>

        {/* 방문자 수 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blog-lighter border border-blog-border-light rounded p-2 text-center">
            <div className="text-gray-500">TODAY</div>
            <div className="text-blog-primary text-base">
              {visitorStats.today}
            </div>
          </div>
          <div className="bg-blog-lighter border border-blog-border-light rounded p-2 text-center">
            <div className="text-gray-500">TOTAL</div>
            <div className="text-blog-primary text-base">
              {visitorStats.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
