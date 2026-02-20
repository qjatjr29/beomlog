import { useRef, useState } from "react";
import { PickerType, TextStyle } from "../types";
import { useMiniRoomStickers } from "../hooks/useMiniRoomStickers";
import { useMiniRoomTheme } from "../hooks/useMiniRoomTheme";
import { AdminControls } from "./AdminControls";
import { StickerItem } from "./StickerItem";
import { Trash2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export const MiniRoom = () => {
  const { isAdminMode } = useAdmin();
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    stickers,
    draggingId,
    selectedId,
    isOverTrash,
    addEmoji,
    addMinime,
    addText,
    addBadge,
    setSelectedId,
    startDragging,
    startResizing,
    startRotating,
    onMouseMove,
    onMouseUp,
  } = useMiniRoomStickers(canvasRef as React.RefObject<HTMLDivElement>);

  const { currentTheme, changeTheme } = useMiniRoomTheme();
  const [textInput, setTextInput] = useState("");
  const [openPicker, setOpenPicker] = useState<PickerType>(null);

  const togglePicker = (picker: Exclude<PickerType, null>) => {
    setOpenPicker((prev) => (prev === picker ? null : picker));
  };

  const handleAddText = (textStyle: TextStyle) => {
    addText(textInput, textStyle);
    setTextInput("");
  };

  // 터치 좌표 보정 유틸리티
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isAdminMode || !draggingId) return;
    if (e.cancelable) e.preventDefault(); // 스크롤 방지

    const touch = e.touches[0];
    const syntheticEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as React.MouseEvent;
    onMouseMove(syntheticEvent);
  };

  if (!currentTheme) {
    return (
      <div className="mb-6">
        <div className="w-full rounded-lg bg-gray-100 animate-pulse aspect-video" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      {isAdminMode && (
        <AdminControls
          showEmojiPicker={openPicker === "emoji"}
          showMinimiPicker={openPicker === "minime"}
          showTextInput={openPicker === "text"}
          showThemePicker={openPicker === "theme"}
          showBadgePicker={openPicker === "badge"}
          textInput={textInput}
          onToggleEmojiPicker={() => togglePicker("emoji")}
          onToggleMinimiPicker={() => togglePicker("minime")}
          onToggleTextInput={() => togglePicker("text")}
          onToggleThemePicker={() => togglePicker("theme")}
          onToggleBadgePicker={() => togglePicker("badge")}
          onTextInputChange={setTextInput}
          onAddEmoji={addEmoji}
          onAddMinime={addMinime}
          onAddText={handleAddText}
          onAddBadge={addBadge}
          onChangeTheme={changeTheme}
          currentTheme={currentTheme}
        />
      )}

      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className="relative w-full max-w-[800px] overflow-hidden rounded-lg border-2 border-blog-border shadow-inner aspect-video touch-none bg-gray-50"
          onMouseMove={isAdminMode ? onMouseMove : undefined}
          onMouseUp={isAdminMode ? onMouseUp : undefined}
          onMouseLeave={isAdminMode ? onMouseUp : undefined}
          onTouchMove={handleTouchMove}
          onTouchEnd={onMouseUp}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          {/* 배경 로직 */}
          {currentTheme.bgImage ? (
            <img
              src={currentTheme.bgImage}
              alt="배경"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-linear-to-br ${currentTheme.gradient}`}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: currentTheme.pattern,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          )}

          {stickers.map((sticker) => (
            <StickerItem
              key={sticker.id}
              sticker={sticker}
              isAdminMode={isAdminMode}
              isDragging={draggingId === sticker.id}
              isSelected={selectedId === sticker.id}
              onMouseDown={(e) => {
                setSelectedId(sticker.id);
                startDragging(e, sticker);
              }}
              onResizeStart={(e) => startResizing(e, sticker)}
              onRotateStart={(e) => startRotating(e, sticker)}
            />
          ))}

          {/* 휴지통 */}
          {isAdminMode && draggingId && (
            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isOverTrash
                  ? "bg-red-500 scale-125"
                  : "bg-black/40 backdrop-blur-md border border-white/20"
              }`}
            >
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
