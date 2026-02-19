import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Plus, SkipBack, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import {
  addBGMTrack,
  deleteBGMTrack,
  updateBGMTrack,
  updateBGMOrder,
} from "@/data/storage/setting.storage";
import { useBGM } from "@/contexts/BGMContext";
import { useAdmin } from "@/contexts/AdminContext";
import { MarqueeText } from "./MarqueeText";
import { PlaylistItem } from "./PlaylistItem";
import { VolumeController } from "./VolumeController";
import { BgmForm } from "./BgmForm";
import { BGMPlayerProps } from "../types";
import { AlertModal } from "@/shared/components/AlertModal";
import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";

const extractVideoId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  );
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
};

export const BGMPlayer = ({ isAdminMode = false }: BGMPlayerProps) => {
  const { adminPassword } = useAdmin();
  const {
    playlist,
    setPlaylist,
    currentIndex,
    shouldAutoPlayRef,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    isReady,
    volume,
    setVolume,
    togglePlay,
    goToPrev,
    goToNext,
    isLoading,
  } = useBGM();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelPosition, setPanelPosition] = useState<"bottom" | "top">(
    "bottom",
  );

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "" });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: "",
    index: -1,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentTrack = playlist[currentIndex] ?? null;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleTogglePanel = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPosition(
        window.innerHeight - rect.bottom < 300 ? "top" : "bottom",
      );
    }
    setIsOpen(!isOpen);
    setAlertModal({ isOpen: false, message: "" });
  };

  const showError = (message: string) =>
    setAlertModal({ isOpen: true, message });

  const handleAddTrack = async (url: string, title: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) return showError("올바른 YouTube URL을 입력해주세요.");
    if (!title.trim()) return showError("제목을 입력해주세요.");

    const track = { id: Date.now().toString(), videoId, title: title.trim() };
    const success = await addBGMTrack(track, adminPassword);

    if (success) {
      setPlaylist((prev) => [...prev, { ...track, orderIndex: prev.length }]);
      setShowAddForm(false);
    } else {
      showError("추가에 실패했습니다.");
    }
  };

  const handleSaveEdit = async (id: string, url: string, title: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) return showError("올바른 YouTube URL을 입력해주세요.");
    if (!title.trim()) return showError("제목을 입력해주세요.");

    const success = await updateBGMTrack(id, videoId, title.trim());
    if (success) {
      setPlaylist((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, videoId, title: title.trim() } : t,
        ),
      );
      setEditingId(null);
    } else {
      showError("수정에 실패했습니다.");
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const success = await deleteBGMTrack(deleteModal.id, adminPassword);
    if (success) {
      const next = playlist.filter((t) => t.id !== deleteModal.id);
      setPlaylist(next);
      if (next.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(false);
      } else if (currentIndex >= deleteModal.index && currentIndex > 0) {
        setCurrentIndex((p) => p - 1);
      }
      setDeleteModal({ isOpen: false, id: "", index: -1 });
    } else {
      showError("삭제에 실패했습니다.");
    }
    setIsDeleting(false);
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...playlist];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    const reindexed = next.map((t, i) => ({ ...t, orderIndex: i }));
    setPlaylist(reindexed);
    setCurrentIndex(reindexed.findIndex((t) => t.id === currentTrack?.id));
    await Promise.all(
      reindexed.map((t) => updateBGMOrder(t.id, t.orderIndex, adminPassword)),
    );
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Music className="w-3 h-3 animate-pulse" />
        <span>BGM 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 트리거 바 */}
      <div ref={triggerRef} className="flex items-center gap-1 w-full">
        <Music className="w-3 h-3 text-gray-600 shrink-0" />
        <button
          onClick={handleTogglePanel}
          className="flex-1 min-w-0 flex items-center justify-center overflow-hidden"
        >
          <MarqueeText
            text={currentTrack?.title ?? "BGM 없음"}
            animate={isPlaying}
            className="text-xs text-gray-600 hover:text-blog-primary transition-colors w-full"
          />
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={goToPrev}
            disabled={playlist.length <= 1}
            className="p-1 text-gray-400 hover:text-blog-primary disabled:opacity-30"
          >
            <SkipBack className="w-3 h-3" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!isReady || !currentTrack}
            className="p-1 text-gray-500 hover:text-blog-primary disabled:opacity-30"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={goToNext}
            disabled={playlist.length <= 1}
            className="p-1 text-gray-400 hover:text-blog-primary disabled:opacity-30"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 패널 영역 */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`absolute left-0 right-0 ${
            panelPosition === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          } p-3 bg-white border-2 border-blog-border rounded shadow-lg z-50 max-h-[60vh] overflow-y-auto custom-scrollbar`}
        >
          <VolumeController volume={volume} setVolume={setVolume} />

          <div className="mb-3 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-3 bg-blog-primary rounded-full" />
                <span className="text-[11px] font-bold text-blog-primary tracking-wider">
                  PLAYLIST
                </span>
                <span className="text-[10px] bg-blog-light text-blog-primary px-1.5 py-0.5 rounded-full font-bold">
                  {playlist.length}
                </span>
              </div>
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 8, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.2,
                      }}
                      className="w-0.5 bg-blog-primary"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              {playlist.map((track, index) =>
                editingId === track.id ? (
                  <BgmForm
                    key={track.id}
                    initialUrl={track.videoId}
                    initialTitle={track.title}
                    error={alertModal.message}
                    submitLabel="저장"
                    onCancel={() => setEditingId(null)}
                    onSubmit={(url, title) =>
                      handleSaveEdit(track.id, url, title)
                    }
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
                    onDragEnd={handleDragEnd}
                    onDrop={(idx) => {
                      if (dragIndexRef.current !== null) {
                        handleReorder(dragIndexRef.current, idx);
                      }
                      handleDragEnd();
                    }}
                    dragOverIndex={dragOverIndex}
                    setDragOverIndex={setDragOverIndex}
                  />
                ),
              )}
            </div>
          </div>

          {isAdminMode && (
            <div className="border-t border-gray-100 pt-2">
              {showAddForm ? (
                <BgmForm
                  error={alertModal.message}
                  submitLabel="추가"
                  onCancel={() => setShowAddForm(false)}
                  onSubmit={handleAddTrack}
                />
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blog-primary transition-colors py-1 px-1"
                >
                  <Plus className="w-3 h-3" /> BGM 추가
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        isAdminMode={true}
        isDeleting={isDeleting}
        passwordValue=""
        onPasswordChange={() => {}}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};
