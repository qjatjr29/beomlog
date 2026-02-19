import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { BGMTrack } from "../types";
import { useBGM } from "@/contexts/BGMContext";

interface PlaylistItemProps {
  track: BGMTrack;
  index: number;
  isCurrent: boolean;
  isAdminMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  dragOverIndex: number | null;
  setDragOverIndex: (index: number | null) => void;
}

const Equalizer = () => (
  <span className="flex items-end gap-0.5 w-3 h-3 shrink-0">
    <span className="w-0.5 bg-blog-primary rounded-sm animate-eq1" />
    <span className="w-0.5 bg-blog-primary rounded-sm animate-eq2" />
    <span className="w-0.5 bg-blog-primary rounded-sm animate-eq3" />
  </span>
);

export const PlaylistItem = ({
  track,
  index,
  isCurrent,
  isAdminMode,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop,
  dragOverIndex,
  setDragOverIndex,
}: PlaylistItemProps) => {
  const { isPlaying } = useBGM();
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverIndex(index);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOverIndex(null);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
      className={`transition-all ${dragOverIndex === index ? "border-t-2 border-blog-primary" : ""}`}
    >
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
          isCurrent
            ? "bg-blog-light text-blog-primary"
            : "hover:bg-gray-50 text-gray-700"
        }`}
        onClick={onSelect}
      >
        {isAdminMode && (
          <div
            draggable
            onDragStart={() => onDragStart(index)}
            onDragEnd={onDragEnd}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </div>
        )}
        <div className="w-4 flex items-center justify-center shrink-0">
          {isCurrent && isPlaying ? (
            <Equalizer />
          ) : !isAdminMode ? (
            <GripVertical className="w-3 h-3 text-gray-300" />
          ) : null}
        </div>
        <span className="flex-1 truncate">{track.title}</span>
        {isAdminMode && (
          <div
            className="flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="p-1 hover:bg-blog-light rounded text-gray-400 hover:text-blog-primary"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
