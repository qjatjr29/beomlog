import { MoveDiagonal2, RotateCw } from "lucide-react";
import { MINIME_OPTIONS } from "../constants";
import { StickerItemProps } from "../types";

export const StickerItem = ({
  sticker,
  isAdminMode,
  isDragging,
  isSelected,
  onMouseDown,
  onResizeStart,
  onRotateStart,
}: StickerItemProps) => {
  const scale = sticker.scale ?? 1;
  const rotation = sticker.rotation ?? 0;

  // 터치 이벤트를 마우스 핸들러에 연결
  const handleTouchStart =
    (handler: (e: React.MouseEvent) => void) => (e: React.TouchEvent) => {
      if (!isAdminMode) return;
      const touch = e.touches[0];
      const syntheticEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        stopPropagation: () => e.stopPropagation(),
        preventDefault: () => e.preventDefault(),
      } as unknown as React.MouseEvent;
      handler(syntheticEvent);
    };

  return (
    <div
      className="absolute"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center center",
        zIndex: isDragging ? 20 : isSelected ? 15 : 10,
        userSelect: "none",
      }}
    >
      <div
        className="relative group"
        onMouseDown={isAdminMode ? onMouseDown : undefined}
        onTouchStart={isAdminMode ? handleTouchStart(onMouseDown) : undefined}
      >
        {sticker.type === "emoji" ? (
          <div
            className={`text-2xl sm:text-4xl select-none drop-shadow-md transition-opacity whitespace-nowrap ${isDragging ? "opacity-60" : ""}`}
          >
            {sticker.content}
          </div>
        ) : sticker.type === "minime" ? (
          <img
            src={
              MINIME_OPTIONS.find((m) => m.id === sticker.content)?.url ??
              sticker.content
            }
            alt="미니미"
            className="w-14 h-18 sm:w-24 sm:h-28 min-w-[3.5rem] sm:min-w-24 object-contain object-bottom drop-shadow-lg"
            draggable={false}
          />
        ) : sticker.type === "badge" ? (
          (() => {
            const badge = JSON.parse(sticker.content);
            return (
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold shadow-lg select-none whitespace-nowrap ${isDragging ? "opacity-60" : ""}`}
                style={{ backgroundColor: badge.color, color: "#fff" }}
              >
                <img
                  src={badge.icon}
                  className="w-3 h-3 sm:w-4 sm:h-4 shrink-0"
                  draggable={false}
                />
                {badge.label}
              </div>
            );
          })()
        ) : sticker.type === "text" ? (
          <div
            className={`
            text-[10px] sm:text-sm px-2 py-1 sm:px-3 sm:py-2 bg-white/90 backdrop-blur-sm border border-blog-border shadow-md rounded-sm whitespace-nowrap
            ${sticker.textStyle === "talk" ? "rounded-bl-none" : sticker.textStyle === "cloud" ? "rounded-[50%]" : ""}
            ${isDragging ? "opacity-60" : ""}
          `}
          >
            {sticker.content}
          </div>
        ) : null}

        {/* 관리자 핸들 */}
        {isAdminMode && isSelected && (
          <>
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                onRotateStart(e);
              }}
              onTouchStart={handleTouchStart(onRotateStart)}
              className="absolute -top-4 -right-4 w-6 h-6 sm:w-5 sm:h-5 bg-blue-500 rounded-full cursor-crosshair z-30 shadow-md flex items-center justify-center border-1 border-white hover:bg-blue-600 transition-colors"
            >
              <RotateCw className="w-3 h-3 text-white" />
            </div>
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(e);
              }}
              onTouchStart={handleTouchStart(onResizeStart)}
              className="absolute -bottom-4 -right-4 w-6 h-6 sm:w-5 sm:h-5 bg-green-500 rounded-full cursor-se-resize z-30 shadow-md flex items-center justify-center border-1 border-white"
              title="드래그해서 크기 조절"
            >
              <MoveDiagonal2 className="w-3 h-3 text-white" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
