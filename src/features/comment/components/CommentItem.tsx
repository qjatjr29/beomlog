import { UserStar, Trash2, LucideIcon } from "lucide-react";
import { Comment } from "../types";

interface CommentItemProps {
  item: Comment;
  isAdminMode: boolean;
  Icon: LucideIcon;
  onDelete: (id: string) => void;
}

export const CommentItem = ({
  item,
  isAdminMode,
  Icon,
  onDelete,
}: CommentItemProps) => (
  <div
    className={`border p-4 rounded-xl shadow-sm transition-all ${
      item.isAdmin
        ? "bg-blog-light border-blog-border"
        : "bg-white border-gray-100 hover:border-blog-border/50"
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            item.isAdmin
              ? "bg-blog-primary text-white"
              : "bg-blog-light text-blog-primary"
          }`}
        >
          {item.isAdmin ? (
            <UserStar className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>
        <div>
          <span className="text-sm font-bold text-gray-800">{item.author}</span>
          {item.isAdmin && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blog-primary text-white rounded-full">
              블로그 주인
            </span>
          )}
          <span className="text-[10px] text-gray-400 ml-2">
            {new Date(item.createdAt).toLocaleString("ko-KR")}
          </span>
        </div>
      </div>
      {!(!isAdminMode && item.isAdmin) && (
        <button
          onClick={() => onDelete(item.id)}
          className={`p-1 transition-colors ${
            isAdminMode
              ? "text-red-400 hover:text-red-600"
              : "text-gray-300 hover:text-red-400"
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <p className="text-sm text-gray-700 whitespace-pre-wrap pl-10">
      {item.content}
    </p>
  </div>
);
