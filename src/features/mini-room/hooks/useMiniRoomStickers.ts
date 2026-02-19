import { useState, useCallback, useRef, useEffect } from "react";
import { Sticker, MinimeOption, TechBadge, TextStyle } from "../types";
import { DEFAULT_SCALE, MAX_SCALE, MIN_SCALE } from "../constants";
import {
  getMiniRoomStickers,
  addMiniRoomSticker,
  updateMiniRoomSticker,
  deleteMiniRoomSticker,
} from "@/data/storage/miniroom.storage";
import { useAdmin } from "@/contexts/AdminContext";

export const useMiniRoomStickers = (
  canvasRef: React.RefObject<HTMLDivElement>,
) => {
  const { adminPassword } = useAdmin();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, scale: 1 });
  const rotateStart = useRef({
    mouseX: 0,
    mouseY: 0,
    rotation: 0,
    centerX: 0,
    centerY: 0,
  });

  const stickersRef = useRef<Sticker[]>([]);
  useEffect(() => {
    stickersRef.current = stickers;
  }, [stickers]);

  useEffect(() => {
    getMiniRoomStickers().then(setStickers);
  }, []);

  const getCanvasRect = () => canvasRef.current?.getBoundingClientRect();

  const makeSticker = (type: Sticker["type"], content: string): Sticker => ({
    id: Date.now().toString(),
    type,
    content,
    x: 50,
    y: 50,
    scale: DEFAULT_SCALE,
    rotation: 0,
  });

  const addEmoji = useCallback(async (emoji: string) => {
    const sticker = makeSticker("emoji", emoji);
    setStickers((prev) => [...prev, sticker]);

    const success = await addMiniRoomSticker(sticker, adminPassword);
    if (!success) {
      setStickers((prev) => prev.filter((s) => s.id !== sticker.id));
    }
  }, []);

  const addMinime = useCallback(async (minime: MinimeOption) => {
    const sticker = makeSticker("minime", minime.url);
    setStickers((prev) => [...prev, sticker]);

    const success = await addMiniRoomSticker(sticker, adminPassword);
    if (!success) {
      setStickers((prev) => prev.filter((s) => s.id !== sticker.id));
    }
  }, []);

  const addBadge = useCallback(async (badge: TechBadge) => {
    const sticker = makeSticker("badge", JSON.stringify(badge));
    setStickers((prev) => [...prev, sticker]);

    const success = await addMiniRoomSticker(sticker, adminPassword);
    if (!success) {
      setStickers((prev) => prev.filter((s) => s.id !== sticker.id));
    }
  }, []);

  const addText = useCallback(
    async (text: string, textStyle: TextStyle = "default") => {
      if (!text.trim()) return;
      const sticker: Sticker = { ...makeSticker("text", text), textStyle };
      setStickers((prev) => [...prev, sticker]);

      const success = await addMiniRoomSticker(sticker, adminPassword);
      if (!success) {
        setStickers((prev) => prev.filter((s) => s.id !== sticker.id));
      }
    },
    [],
  );

  const removeSticker = useCallback(async (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    await deleteMiniRoomSticker(id, adminPassword);
  }, []);

  const startDragging = useCallback(
    (e: React.MouseEvent, sticker: Sticker) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = getCanvasRect();
      if (!rect) return;
      dragOffset.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100 - sticker.x,
        y: ((e.clientY - rect.top) / rect.height) * 100 - sticker.y,
      };
      setDraggingId(sticker.id);
      setSelectedId(sticker.id);
    },
    [canvasRef],
  );

  const startResizing = useCallback((e: React.MouseEvent, sticker: Sticker) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      scale: sticker.scale ?? 1,
    };
    setResizingId(sticker.id);
  }, []);

  const startRotating = useCallback(
    (e: React.MouseEvent, sticker: Sticker) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = getCanvasRect();
      if (!rect) return;
      const centerX = rect.left + (sticker.x / 100) * rect.width;
      const centerY = rect.top + (sticker.y / 100) * rect.height;
      rotateStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        rotation: sticker.rotation ?? 0,
        centerX,
        centerY,
      };
      setRotatingId(sticker.id);
    },
    [canvasRef],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = getCanvasRect();
      if (!rect) return;

      if (draggingId) {
        const trashCenterX = rect.left + rect.width / 2;
        const trashCenterY = rect.bottom - 20 - 28;
        const dist = Math.sqrt(
          Math.pow(e.clientX - trashCenterX, 2) +
            Math.pow(e.clientY - trashCenterY, 2),
        );
        setIsOverTrash(dist <= 28);

        const x = Math.min(
          95,
          Math.max(
            5,
            ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.current.x,
          ),
        );
        const y = Math.min(
          95,
          Math.max(
            5,
            ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.current.y,
          ),
        );
        setStickers((prev) =>
          prev.map((s) => (s.id === draggingId ? { ...s, x, y } : s)),
        );
        return;
      }

      if (resizingId) {
        const dx = e.clientX - resizeStart.current.mouseX;
        const dy = e.clientY - resizeStart.current.mouseY;
        const delta = (dx + dy) / 150;
        const newScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, resizeStart.current.scale + delta),
        );
        setStickers((prev) =>
          prev.map((s) =>
            s.id === resizingId ? { ...s, scale: newScale } : s,
          ),
        );
        return;
      }

      if (rotatingId) {
        const {
          centerX,
          centerY,
          rotation: startRotation,
          mouseX: startX,
          mouseY: startY,
        } = rotateStart.current;
        const startAngle =
          Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
        const currentAngle =
          Math.atan2(e.clientY - centerY, e.clientX - centerX) *
          (180 / Math.PI);
        setStickers((prev) =>
          prev.map((s) =>
            s.id === rotatingId
              ? { ...s, rotation: startRotation + (currentAngle - startAngle) }
              : s,
          ),
        );
      }
    },
    [draggingId, resizingId, rotatingId, canvasRef],
  );

  const onMouseUp = useCallback(() => {
    if (draggingId && isOverTrash) {
      deleteMiniRoomSticker(draggingId, adminPassword);
      setStickers((prev) => prev.filter((s) => s.id !== draggingId));
    } else if (draggingId || resizingId || rotatingId) {
      const id = draggingId ?? resizingId ?? rotatingId;
      const sticker = stickersRef.current.find((s) => s.id === id);
      if (sticker) {
        updateMiniRoomSticker(sticker, adminPassword);
      }
    }

    setDraggingId(null);
    setResizingId(null);
    setRotatingId(null);
    setIsOverTrash(false);
  }, [draggingId, resizingId, rotatingId, isOverTrash]);

  return {
    stickers,
    draggingId,
    isOverTrash,
    selectedId,
    addEmoji,
    addMinime,
    addBadge,
    addText,
    removeSticker,
    startDragging,
    startResizing,
    startRotating,
    setSelectedId,
    onMouseMove,
    onMouseUp,
  };
};
