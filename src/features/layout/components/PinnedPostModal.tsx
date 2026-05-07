import { useEffect, useMemo, useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { usePosts } from "@/contexts/PostsContext";
import {
  getPinnedPostIds,
  setPinnedPostIds,
} from "@/data/storage/setting.storage";
import { useAdmin } from "@/contexts/AdminContext";

export const PinnedPostModal = ({
  show,
  onClose,
  onSaved,
}: {
  show: boolean;
  onClose: () => void;
  onSaved?: (pinnedIds: string[]) => void;
}) => {
  const { posts } = usePosts();
  const { adminPassword } = useAdmin();
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [selectedAvailableId, setSelectedAvailableId] = useState<string | null>(
    null,
  );
  const [selectedPinnedId, setSelectedPinnedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    getPinnedPostIds().then((ids) => {
      setPinnedIds(ids);
      setSelectedAvailableId(null);
      setSelectedPinnedId(ids[0] ?? null);
    });
  }, [show]);

  const unpinned = useMemo(
    () => posts.filter((p) => !pinnedIds.includes(p.id)),
    [posts, pinnedIds],
  );

  const pinned = useMemo(
    () => posts.filter((p) => pinnedIds.includes(p.id)),
    [posts, pinnedIds],
  );

  const handlePin = async (postId: string) => {
    setIsSaving(true);
    setSaveError(null);
    const nextPinnedIds = [...pinnedIds, postId];
    const result = await setPinnedPostIds(nextPinnedIds, adminPassword);
    if (result.ok) {
      setPinnedIds(nextPinnedIds);
      setSelectedAvailableId(null);
      setSelectedPinnedId(postId);
      onSaved?.(nextPinnedIds);
    } else {
      setSaveError(result.errorMessage ?? "고정 저장에 실패했습니다.");
    }
    setIsSaving(false);
  };

  const handleUnpin = async (postId: string) => {
    setIsSaving(true);
    setSaveError(null);
    const nextPinnedIds = pinnedIds.filter((id) => id !== postId);
    const result = await setPinnedPostIds(nextPinnedIds, adminPassword);
    if (result.ok) {
      setPinnedIds(nextPinnedIds);
      setSelectedPinnedId(nextPinnedIds[0] ?? null);
      if (selectedPinnedId === postId) {
        setSelectedPinnedId(nextPinnedIds[0] ?? null);
      }
      onSaved?.(nextPinnedIds);
    } else {
      setSaveError(result.errorMessage ?? "고정 해제에 실패했습니다.");
    }
    setIsSaving(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />

      <div className="relative w-[94%] max-w-3xl bg-white dark:bg-gray-900 rounded shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">고정 게시물 관리</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saveError && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="text-xs font-bold mb-2">
              추가 가능한 게시물 ({unpinned.length})
            </div>
            <div className="max-h-64 overflow-y-auto border border-blog-border rounded p-1">
              {unpinned.length === 0 ? (
                <div className="text-[11px] text-gray-400 p-2">
                  모든 게시물이 이미 고정되어 있습니다.
                </div>
              ) : (
                unpinned.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedAvailableId(p.id)}
                    className={`w-full text-left px-2 py-1 text-[11px] truncate ${
                      selectedAvailableId === p.id
                        ? "bg-blog-light dark:bg-gray-700 text-blog-primary font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {p.title}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center gap-2">
            <button
              disabled={
                !selectedAvailableId || pinnedIds.length >= 5 || isSaving
              }
              onClick={() =>
                selectedAvailableId && handlePin(selectedAvailableId)
              }
              className="p-2 bg-blog-primary text-white rounded disabled:opacity-50"
              title="고정"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              disabled={!selectedPinnedId || isSaving}
              onClick={() => selectedPinnedId && handleUnpin(selectedPinnedId)}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              title="고정 해제"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="col-span-1">
            <div className="text-xs font-bold mb-2">
              현재 고정된 게시물 ({pinned.length}/5)
            </div>
            <div className="max-h-64 overflow-y-auto border border-blog-border rounded p-1">
              {pinned.length > 0 ? (
                pinned.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPinnedId(post.id)}
                    className={`w-full text-left px-2 py-1 text-[11px] truncate ${
                      selectedPinnedId === post.id
                        ? "bg-blog-light dark:bg-gray-700 text-blog-primary font-semibold"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {post.title}
                  </button>
                ))
              ) : (
                <div className="text-[11px] text-gray-400 p-2">
                  현재 고정된 게시물이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-blog-light text-blog-primary rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
