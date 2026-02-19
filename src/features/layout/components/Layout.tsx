import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Unlock, Lock } from "lucide-react";
import { LayoutProps } from "../types";
import { NAVIGATION_TABS } from "../constants/navigation";
import { incrementVisitor } from "@/data/storage";
import { VisitorStats } from "@/shared/types";
import { useAdmin } from "@/contexts/AdminContext";
import { PasswordModal } from "@/features/mini-room/components";
import { IntroduceCard } from "./IntroduceCard";
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
    if (isAdminMode) {
      logout();
    } else {
      setShowPasswordModal(true);
    }
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
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative container mx-auto px-4 py-6 max-w-350">
        {/* 헤더 */}
        <div className="bg-linear-to-r from-blog-primary to-blog-primary-hover border rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center text-blog-primary text-xs">
                B
              </div>
              <span className="text-white text-sm">Beomsic 미니홈피</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MiniPlayer />
              {/* 방문자 통계 */}
              <div className="text-white text-xs whitespace-nowrap">
                TODAY <span className="font-bold">{visitorStats.today}</span> |
                TOTAL <span className="font-bold">{visitorStats.total}</span>
              </div>
            </div>

            {/* 관리자 버튼 */}
            <button
              onClick={handleAdminClick}
              className={`p-1.5 rounded transition-all ${
                isAdminMode
                  ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
                  : "bg-white/20 text-white hover:bg-white/30"
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

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-2">
          <aside className="space-y-2 hidden lg:block">
            <ProfileCard
              isAdminMode={isAdminMode}
              visitorStats={visitorStats}
            />
            <IntroduceCard isAdminMode={isAdminMode} />
          </aside>
          <main className="space-y-2">
            <div className="bg-white border-2 border-blog-border rounded-lg shadow-md overflow-hidden">
              <div className="flex border-b border-gray-200">
                {NAVIGATION_TABS.map((tab) => {
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
                      className={`flex-1 px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors relative ${
                        isActive
                          ? "bg-white text-blog-primary-hover border-b-2 border-blog-primary-hover -mb-0.5"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="p-8 min-h-150 bg-white">{children}</div>
            </div>
          </main>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
          <p>© Beomsic's Blog</p>
        </div>
      </div>
    </div>
  );
};
