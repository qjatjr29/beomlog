import { useState, useEffect } from "react";
import { Link } from "react-router";
import { LayoutProps } from "../types";
import { incrementVisitor } from "@/data/storage";
import { VisitorStats } from "@/shared/types";
import { useAdmin } from "@/contexts/AdminContext";
import { PasswordModal } from "@/features/mini-room/components";
import { ProfileCard } from "./ProfileCard";
import { MiniPlayer } from "@/features/bgm/components/MiniBGMPlayer";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { NavigationTabs } from "./NavigationTabs";
import { MobileNav } from "./MobileNav";
import { VisitorBar } from "./VisitorBar";

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
  const { isDark, toggle: toggleDark } = useDarkMode();

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
        className="absolute inset-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative container mx-auto px-4 py-4 max-w-6xl">
        <VisitorBar
          visitorStats={visitorStats}
          isDark={isDark}
          isAdminMode={isAdminMode}
          onToggleDark={toggleDark}
          onAdminClick={handleAdminClick}
        />

        {/* 타이틀 바 */}
        <div className="bg-linear-to-r from-blog-primary to-blog-primary-hover dark:from-blog-primary/70 dark:to-blog-primary-hover/70 border border-blog-primary-hover dark:border-blog-primary/40 rounded-t-md px-4 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="text-white dark:text-white/90 font-bold text-sm tracking-wide"
          >
            Beomsic 미니홈피
          </Link>
          <MiniPlayer />
        </div>

        {/* 메인 프레임 */}
        <div className="border-x border-b border-blog-border bg-white dark:bg-gray-900 rounded-b-md flex min-h-150">
          {/* 왼쪽 사이드바 */}
          <div
            className="w-57.5 border-r border-blog-border-light dark:border-gray-700 p-3 shrink-0 hidden lg:block bg-blog-lightest dark:bg-gray-800"
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

          {/* 오른쪽 세로 탭 */}
          <NavigationTabs />
        </div>

        <div className="mt-3 text-center text-[10px] text-gray-500 dark:text-gray-400">
          <p>© Beomsic's Mini Hompy</p>
        </div>

        <MobileNav />
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
