import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Unlock, Lock } from "lucide-react";
import { LayoutProps } from "../types";
import { NAVIGATION_TABS } from "../constants/navigation";
import { incrementVisitor } from "@/data/storage";
import { VisitorStats } from "@/shared/types";
import { useAdmin } from "@/contexts/AdminContext";
import { PasswordModal } from "@/features/mini-room/components";
import { ProfileCard } from "./ProfileCard";
import { MiniPlayer } from "@/features/bgm/components/MiniBGMPlayer";

const getCachedStats = (): VisitorStats => {
  const cached = localStorage.getItem("visitorStatsCache");
  return cached ? JSON.parse(cached) : { today: 0, total: 0 };
};

export const Layout = ({ children }: LayoutProps) => {
  const [visitorStats, setVisitorStats] =
    useState<VisitorStats>(getCachedStats);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { isAdminMode, login, logout } = useAdmin();
  const location = useLocation();

  useEffect(() => {
    incrementVisitor().then(setVisitorStats);
  }, []);

  const handleAdminClick = () => {
    if (isAdminMode) logout();
    else setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(passwordInput);
    if (success) {
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-blog-bg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundSize: "20px 20px" }}
      />

      <div className="relative container mx-auto px-4 py-4 max-w-6xl">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-xs font-bold tracking-wide">
            <span className="text-blog-primary">TODAY </span>
            <span className="text-blog-primary font-bold">
              {visitorStats.today}
            </span>
            <span className="text-gray-400 mx-1">|</span>
            <span className="text-gray-500">TOTAL </span>
            <span className="text-gray-500 font-bold">
              {visitorStats.total}
            </span>
          </div>
          {/* 관리자 버튼 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdminClick}
              className={`p-1.5 rounded transition-all ${
                isAdminMode
                  ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
                  : "bg-white/20 text-gray-600 hover:bg-white/40 border border-gray-300"
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

        {/* 타이틀 바 */}
        <div className="bg-linear-to-r from-blog-primary to-blog-primary-hover border border-blog-primary-hover rounded-t-md px-4 py-2 flex items-center justify-between">
          <Link to="/" className="text-white font-bold text-sm tracking-wide">
            Beomsic 미니홈피
          </Link>
          <MiniPlayer />
        </div>

        {/* 메인 프레임 */}
        <div className="border-x border-b border-blog-border bg-white rounded-b-md flex min-h-150">
          <div
            className="w-57.5 border-r border-blog-border-light p-3 shrink-0 hidden lg:block bg-blog-lightest"
            style={{ position: "relative", zIndex: 10, overflow: "visible" }}
          >
            <ProfileCard
              isAdminMode={isAdminMode}
              visitorStats={visitorStats}
            />
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <div className="p-5 min-h-125">{children}</div>
          </div>

          {/* 오른쪽 세로 탭 네비게이션 */}
          <div className="w-18 mt-1 shrink-0 hidden md:flex flex-col border-l border-blog-border-light">
            <div className="bg-blog-primary text-white text-[9px] text-center py-1.5 font-bold border-b border-blog-primary-hover">
              MENU
            </div>
            {NAVIGATION_TABS.map((tab) => {
              const currentPath = decodeURIComponent(location.pathname);
              const isActive =
                tab.path === "/"
                  ? currentPath === "/"
                  : tab.path.startsWith("/#")
                    ? false
                    : currentPath.startsWith(tab.path);

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative py-3 px-1 text-[11px] text-center font-bold transition-all border-b border-blog-border-light ${
                    isActive
                      ? "bg-blog-primary text-white"
                      : "bg-blog-lightest text-blog-primary hover:bg-blog-light"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blog-primary-hover" />
                  )}
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-gray-500">
          <p>© Beomsic's Mini Hompy</p>
        </div>

        {/* 모바일 하단 네비게이션 */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-blog-border-light flex z-50">
          {NAVIGATION_TABS.filter((t) => !t.path.includes("#")).map((tab) => {
            const Icon = tab.icon;
            const currentPath = decodeURIComponent(location.pathname);
            const isActive =
              tab.path === "/"
                ? currentPath === "/"
                : currentPath.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] ${
                  isActive ? "text-blog-primary font-bold" : "text-gray-500"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <PasswordModal
        show={showPasswordModal}
        passwordInput={passwordInput}
        passwordError={passwordError}
        onPasswordChange={(value) => {
          setPasswordInput(value);
          setPasswordError("");
        }}
        onSubmit={handlePasswordSubmit}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordInput("");
          setPasswordError("");
        }}
      />
    </div>
  );
};
