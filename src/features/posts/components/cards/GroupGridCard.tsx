import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import { GroupMeta } from "@/features/posts/types";

interface GroupGridCardProps {
  group: GroupMeta;
}

export const GroupGridCard = ({ group }: GroupGridCardProps) => (
  <Link
    to={`/group/${group.id}`}
    className="block rounded-lg overflow-hidden border border-blog-border dark:border-gray-700 hover:shadow-lg transition-all group h-full"
  >
    {/* 커버 이미지 */}
    <div className="aspect-4/3 bg-blog-lighter dark:bg-gray-800 overflow-hidden relative">
      {group.coverImage ? (
        <img
          src={group.coverImage}
          alt={group.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-blog-primary opacity-20" />
        </div>
      )}
      {group.postCount > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          {group.postCount}편
        </div>
      )}
    </div>
    {/* 카드 정보 */}
    <div className="p-3 bg-white dark:bg-gray-800">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate mb-1 group-hover:text-blog-primary transition-colors">
        {group.title}
      </h3>
      {group.description && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
          {group.description}
        </p>
      )}
    </div>
  </Link>
);
