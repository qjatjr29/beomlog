import { Link } from "react-router";
import { motion } from "framer-motion";
import { GroupMeta } from "@/features/posts/types";
import { BookOpen, FolderKanban } from "lucide-react";
import { loadGroupsByCategory } from "../utils/group-loader";

interface GalleryListProps {
  category: string;
}

export const GalleryList = ({ category }: GalleryListProps) => {
  const groups = loadGroupsByCategory(category);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-blog-lighter dark:bg-gray-700 flex items-center justify-center">
          <FolderKanban className="w-7 h-7 text-blog-primary opacity-50" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          아직 등록된 항목이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      {groups.map((group, i) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
        >
          <GalleryCard group={group} />
        </motion.div>
      ))}
    </div>
  );
};

const GalleryCard = ({ group }: { group: GroupMeta }) => (
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
