import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Music,
  Play,
  Pause,
  Plus,
  SkipBack,
  SkipForward,
  BookAudio,
} from "lucide-react";
import { useBGM } from "@/contexts/BGMContext";
import { useBGMManagement } from "../hooks/useBGMManagement";
import { extractVideoId } from "../utils";
import { MarqueeText } from "./MarqueeText";
import { PlaylistItem } from "./PlaylistItem";
import { VolumeController } from "./VolumeController";
import { BgmForm } from "./BGMForm";
import { Equalizer } from "./Equalizer";
import { AlertModal } from "@/shared/components/AlertModal";
import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import { BGMPlayerProps } from "../types";

export const BGMPlayer = ({ isAdminMode = false }: BGMPlayerProps) => {
  const {
    playlist,
    currentIndex,
    isPlaying,
    isReady,
    volume,
    setVolume,
    togglePlay,
    goToPrev,
    goToNext,
    isLoading,
    setCurrentIndex,
    shouldAutoPlayRef,
  } = useBGM();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "" });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: "",
    index: -1,
  });
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  const { handleAdd, handleUpdate, handleDelete, handleReorder, isDeleting } =
    useBGMManagement((msg) => setAlertModal({ isOpen: true, message: msg }));

  const calcPanelStyle = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const PANEL_H = 320;
    const isBottom = window.innerHeight - rect.bottom >= PANEL_H;
    setPanelStyle({
      position: "fixed",
      top: isBottom ? rect.bottom + 6 : Math.max(4, rect.top - PANEL_H - 6),
      left: Math.max(4, rect.left),
      width: 280,
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    };
    const update = () => calcPanelStyle();
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  const handleTogglePanel = () => {
    if (!isOpen) calcPanelStyle();
    setIsOpen(!isOpen);
  };

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <Music className="w-3 h-3 animate-pulse" />
        <span>Loading...</span>
      </div>
    );

  return (
    <div className="relative">
      {/* 트리거 바 */}
      <div ref={triggerRef} className="flex items-center gap-1 w-full">
        <button onClick={handleTogglePanel} className="shrink-0 w-3 h-3">
          {isPlaying ? (
            <Equalizer />
          ) : (
            <BookAudio className="w-3 h-3 text-blog-primary" />
          )}
        </button>
        <button
          onClick={handleTogglePanel}
          className="flex-1 min-w-0 overflow-hidden"
        >
          <MarqueeText
            text={playlist[currentIndex]?.title ?? "BGM 없음"}
            animate={isPlaying}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-blog-primary transition-colors w-full"
          />
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={goToPrev}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blog-primary disabled:opacity-30"
            disabled={playlist.length <= 1}
          >
            <SkipBack className="w-3 h-3" />
          </button>
          <button
            onClick={togglePlay}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-blog-primary"
            disabled={!isReady || !playlist[currentIndex]}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={goToNext}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blog-primary"
            disabled={playlist.length <= 1}
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 플레이리스트 패널 (portal) */}
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="p-3 bg-white dark:bg-gray-800 border-2 border-blog-border dark:border-gray-600 rounded shadow-xl max-h-[60vh] overflow-y-auto custom-scrollbar"
          >
            <VolumeController volume={volume} setVolume={setVolume} />
            <div className="mb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-3 bg-blog-primary rounded-full" />
                  <span className="text-[11px] font-bold text-blog-primary">
                    PLAYLIST
                  </span>
                  <span className="text-[10px] bg-blog-light dark:bg-gray-700 text-blog-primary px-1.5 py-0.5 rounded-full font-bold">
                    {playlist.length}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {playlist.map((track, index) =>
                  editingId === track.id ? (
                    <BgmForm
                      key={track.id}
                      initialUrl={track.videoId}
                      initialTitle={track.title}
                      submitLabel="저장"
                      onCancel={() => setEditingId(null)}
                      onSubmit={async (u, t) => {
                        const vid = extractVideoId(u);
                        if (vid && (await handleUpdate(track.id, vid, t)))
                          setEditingId(null);
                      }}
                    />
                  ) : (
                    <PlaylistItem
                      key={track.id}
                      track={track}
                      index={index}
                      isCurrent={index === currentIndex}
                      isAdminMode={isAdminMode}
                      onSelect={() => {
                        shouldAutoPlayRef.current = true;
                        setCurrentIndex(index);
                      }}
                      onEdit={() => setEditingId(track.id)}
                      onDelete={() =>
                        setDeleteModal({ isOpen: true, id: track.id, index })
                      }
                      onDragStart={(idx) => {
                        dragIndexRef.current = idx;
                      }}
                      onDragEnd={() => {
                        dragIndexRef.current = null;
                        setDragOverIndex(null);
                      }}
                      onDrop={(idx) => {
                        if (dragIndexRef.current !== null)
                          handleReorder(
                            dragIndexRef.current,
                            idx,
                            playlist[currentIndex]?.id,
                          );
                      }}
                      dragOverIndex={dragOverIndex}
                      setDragOverIndex={setDragOverIndex}
                    />
                  ),
                )}
              </div>
            </div>
            {isAdminMode && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                {showAddForm ? (
                  <BgmForm
                    submitLabel="추가"
                    onCancel={() => setShowAddForm(false)}
                    onSubmit={async (u, t) => {
                      const vid = extractVideoId(u);
                      if (vid && (await handleAdd(vid, t)))
                        setShowAddForm(false);
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blog-primary py-1 px-1"
                  >
                    <Plus className="w-3 h-3" /> BGM 추가
                  </button>
                )}
              </div>
            )}
          </div>,
          document.body,
        )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        isAdminMode={true}
        isDeleting={isDeleting}
        passwordValue=""
        onPasswordChange={() => {}}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() =>
          handleDelete(deleteModal.id, deleteModal.index).then(
            (success) =>
              success && setDeleteModal({ ...deleteModal, isOpen: false }),
          )
        }
      />
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};
