import { Link, useLocation } from "react-router";
import { NAVIGATION_TABS } from "../constants/navigation";

export const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-t border-blog-border-light dark:border-gray-700 flex z-50">
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
            className={`flex-1 py-2 flex flex-col items-center justify-center transition-colors ${
              isActive
                ? "text-blog-primary font-bold"
                : "text-gray-500 dark:text-gray-400"
            }`}
            title={tab.name}
          >
            {Icon && <Icon className="w-5 h-5" />}
          </Link>
        );
      })}
    </div>
  );
};
