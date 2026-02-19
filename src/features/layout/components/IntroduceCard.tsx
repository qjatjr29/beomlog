import { BGMPlayer } from "@/features/bgm/components/BGMPlayer";
import { SOCIAL_LINKS } from "../constants/social";

export const IntroduceCard = ({ isAdminMode }: { isAdminMode: boolean }) => {
  return (
    <div className="bg-white border-2 border-blog-border rounded-lg shadow-md overflow-visible">
      <div className="bg-linear-to-r from-blog-primary to-blog-primary-hover px-3 py-2">
        <span className="text-white text-sm">Introduce</span>
      </div>
      <div className="p-4 bg-linear-to-b from-white to-gray-50 text-xs space-y-3 text-gray-700 relative">
        <div className="flex items-center gap-2 text-blue-500 font-bold">
          <span>범석</span>
        </div>
        <div className="flex items-center gap-2 font-bold">
          <span>🧑🏻‍💻 Backend Developer</span>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-around">
            {SOCIAL_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.id !== "email" ? "_blank" : undefined}
                  rel={link.id !== "email" ? "noopener noreferrer" : undefined}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                  title={link.label}
                >
                  <Icon
                    className={`w-4 h-4 text-gray-600 transition-colors ${link.hoverColor}`}
                  />
                </a>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <BGMPlayer isAdminMode={isAdminMode} />
        </div>
      </div>
    </div>
  );
};
