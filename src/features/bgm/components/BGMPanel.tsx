import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { VolumeController } from "./VolumeController";
import { PlaylistItem } from "./PlaylistItem";
import { BgmForm } from "./BGMForm";
import { BGMTrack } from "../types";

interface BGMPanelProps {
  panelRef: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  playlist: BGMTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isAdminMode: boolean;
  editingId: string | null;
  showAddForm: boolean;
  alertMessage: string;
  volume: number;
  setVolume: (v: number) => void;
  onSelect: (idx: number) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, url: string, title: string) => void;
  onDeleteRequest: (id: string, index: number) => void;
  onAddTrack: (url: string, title: string) => void;
  onShowAddForm: (show: boolean) => void;
  onReorder: (from: number, to: number) => void;
  dragOverIndex: number | null;
  setDragOverIndex: (idx: number | null) => void;
  dragIndexRef: React.MutableRefObject<number | null>;
}

export const BGMPanel = (props: BGMPanelProps) => {
  return createPortal(
    <div
      ref={props.panelRef}
      style={props.style}
      className="p-3 bg-white border-2 border-blog-border rounded shadow-xl max-h-[60vh] overflow-y-auto custom-scrollbar"
    >
      <VolumeController volume={props.volume} setVolume={props.setVolume} />

      <div className="mb-3 border-t border-gray-100 pt-3">
        {/* Playlist Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-3 bg-blog-primary rounded-full" />
            <span className="text-[11px] font-bold text-blog-primary tracking-wider">
              PLAYLIST
            </span>
            <span className="text-[10px] bg-blog-light text-blog-primary px-1.5 py-0.5 rounded-full font-bold">
              {props.playlist.length}
            </span>
          </div>
        </div>

        {/* Playlist Items */}
        <div className="space-y-1">
          {props.playlist.map((track, index) =>
            props.editingId === track.id ? (
              <BgmForm
                key={track.id}
                initialUrl={track.videoId}
                initialTitle={track.title}
                submitLabel="저장"
                onCancel={props.onCancelEdit}
                onSubmit={(url, title) =>
                  props.onSaveEdit(track.id, url, title)
                }
              />
            ) : (
              <PlaylistItem
                key={track.id}
                track={track}
                index={index}
                isCurrent={index === props.currentIndex}
                isAdminMode={props.isAdminMode}
                onSelect={() => props.onSelect(index)}
                onEdit={() => props.onEdit(track.id)}
                onDelete={() => props.onDeleteRequest(track.id, index)}
                onDragStart={(idx) => {
                  props.dragIndexRef.current = idx;
                }}
                onDragEnd={() => {
                  props.dragIndexRef.current = null;
                  props.setDragOverIndex(null);
                }}
                onDrop={(idx) => {
                  if (props.dragIndexRef.current !== null)
                    props.onReorder(props.dragIndexRef.current, idx);
                }}
                dragOverIndex={props.dragOverIndex}
                setDragOverIndex={props.setDragOverIndex}
              />
            ),
          )}
        </div>
      </div>

      {props.isAdminMode && (
        <div className="border-t border-gray-100 pt-2">
          {props.showAddForm ? (
            <BgmForm
              submitLabel="추가"
              onCancel={() => props.onShowAddForm(false)}
              onSubmit={props.onAddTrack}
            />
          ) : (
            <button
              onClick={() => props.onShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blog-primary transition-colors py-1 px-1"
            >
              <Plus className="w-3 h-3" /> BGM 추가
            </button>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
};
