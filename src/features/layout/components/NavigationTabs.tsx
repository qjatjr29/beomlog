
import { Link, useLocation } from "react-router";
import { NAVIGATION_TABS } from "../constants/navigation";

export const NavigationTabs = () => {
  const location = useLocation();

  return (
    <div className="w-18 mt-1 shrink-0 hidden md:flex flex-col border-l border-blog-border-light dark:border-gray-700/50">
      <div className="bg-blog-primary dark:bg-blog-primary/60 text-white text-[9px] text-center py-1.5 font-bold border-b border-blog-primary-hover dark:border-blog-primary/30">
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
            className={`relative py-3 px-1 text-[11px] text-center font-bold transition-all border-b border-blog-border-light dark:border-gray-700 ${
              isActive
                ? "bg-blog-primary dark:bg-blog-primary/60 text-white"
                : "bg-blog-lightest dark:bg-gray-800 text-blog-primary hover:bg-blog-light dark:hover:bg-gray-700"
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
  );
};