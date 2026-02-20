// import { useState } from "react";
// import { useBGM } from "@/contexts/BGMContext";
// import { useAdmin } from "@/contexts/AdminContext";
// import {
//   addBGMTrack,
//   deleteBGMTrack,
//   updateBGMTrack,
//   updateBGMOrder,
// } from "@/data/storage/setting.storage";

// export const useBGMManagement = (showError: (msg: string) => void) => {
//   const { adminPassword } = useAdmin();
//   const { playlist, setPlaylist, currentIndex, setCurrentIndex, setIsPlaying } =
//     useBGM();
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleAddTrack = async (videoId: string, title: string) => {
//     const track = { id: Date.now().toString(), videoId, title: title.trim() };
//     const success = await addBGMTrack(track, adminPassword);
//     if (success) {
//       setPlaylist((prev) => [...prev, { ...track, orderIndex: prev.length }]);
//       return true;
//     }
//     showError("추가에 실패했습니다.");
//     return false;
//   };

//   const handleSaveEdit = async (id: string, videoId: string, title: string) => {
//     const success = await updateBGMTrack(id, videoId, title.trim());
//     if (success) {
//       setPlaylist((prev) =>
//         prev.map((t) =>
//           t.id === id ? { ...t, videoId, title: title.trim() } : t,
//         ),
//       );
//       return true;
//     }
//     showError("수정에 실패했습니다.");
//     return false;
//   };

//   const handleConfirmDelete = async (id: string, index: number) => {
//     setIsDeleting(true);
//     const success = await deleteBGMTrack(id, adminPassword);
//     if (success) {
//       const next = playlist.filter((t) => t.id !== id);
//       setPlaylist(next);
//       if (next.length === 0) {
//         setCurrentIndex(0);
//         setIsPlaying(false);
//       } else if (currentIndex >= index && currentIndex > 0) {
//         setCurrentIndex((p) => p - 1);
//       }
//       setIsDeleting(false);
//       return true;
//     }
//     showError("삭제에 실패했습니다.");
//     setIsDeleting(false);
//     return false;
//   };

//   const handleReorder = async (
//     fromIndex: number,
//     toIndex: number,
//     currentTrackId?: string,
//   ) => {
//     if (fromIndex === toIndex) return;
//     const next = [...playlist];
//     const [moved] = next.splice(fromIndex, 1);
//     next.splice(toIndex, 0, moved);
//     const reindexed = next.map((t, i) => ({ ...t, orderIndex: i }));
//     setPlaylist(reindexed);
//     if (currentTrackId) {
//       setCurrentIndex(reindexed.findIndex((t) => t.id === currentTrackId));
//     }
//     await Promise.all(
//       reindexed.map((t) => updateBGMOrder(t.id, t.orderIndex, adminPassword)),
//     );
//   };

//   return {
//     handleAddTrack,
//     handleSaveEdit,
//     handleConfirmDelete,
//     handleReorder,
//     isDeleting,
//   };
// };

import { useState } from "react";
import { useBGM } from "@/contexts/BGMContext";
import { useAdmin } from "@/contexts/AdminContext";
import {
  addBGMTrack,
  deleteBGMTrack,
  updateBGMTrack,
  updateBGMOrder,
} from "@/data/storage/setting.storage";

export const useBGMManagement = (showError: (msg: string) => void) => {
  const { adminPassword } = useAdmin();
  const { playlist, setPlaylist, currentIndex, setCurrentIndex, setIsPlaying } =
    useBGM();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async (videoId: string, title: string) => {
    const track = { id: Date.now().toString(), videoId, title: title.trim() };
    const success = await addBGMTrack(track, adminPassword);
    if (success) {
      setPlaylist((prev) => [...prev, { ...track, orderIndex: prev.length }]);
      return true;
    }
    showError("추가에 실패했습니다.");
    return false;
  };

  const handleUpdate = async (id: string, videoId: string, title: string) => {
    const success = await updateBGMTrack(id, videoId, title.trim());
    if (success) {
      setPlaylist((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, videoId, title: title.trim() } : t,
        ),
      );
      return true;
    }
    showError("수정에 실패했습니다.");
    return false;
  };

  const handleDelete = async (id: string, index: number) => {
    setIsDeleting(true);
    const success = await deleteBGMTrack(id, adminPassword);
    if (success) {
      const next = playlist.filter((t) => t.id !== id);
      setPlaylist(next);
      if (next.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(false);
      } else if (currentIndex >= index && currentIndex > 0) {
        setCurrentIndex((p) => p - 1);
      }
      setIsDeleting(false);
      return true;
    }
    showError("삭제에 실패했습니다.");
    setIsDeleting(false);
    return false;
  };

  const handleReorder = async (
    fromIndex: number,
    toIndex: number,
    currentTrackId?: string,
  ) => {
    if (fromIndex === toIndex) return;
    const next = [...playlist];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    const reindexed = next.map((t, i) => ({ ...t, orderIndex: i }));
    setPlaylist(reindexed);
    if (currentTrackId) {
      setCurrentIndex(reindexed.findIndex((t) => t.id === currentTrackId));
    }
    await Promise.all(
      reindexed.map((t) => updateBGMOrder(t.id, t.orderIndex, adminPassword)),
    );
  };

  return { handleAdd, handleUpdate, handleDelete, handleReorder, isDeleting };
};
