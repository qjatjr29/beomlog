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

  return (
    <div
      className="absolute"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "center center",
        cursor: isAdminMode ? (isDragging ? "grabbing" : "grab") : "default",
        zIndex: isDragging ? 50 : isSelected ? 40 : 10,
        userSelect: "none",
        display: "inline-block",
      }}
    >
      <div className="relative">
        {sticker.type === "emoji" ? (
          <div
            onMouseDown={isAdminMode ? onMouseDown : undefined}
            className={`text-4xl select-none drop-shadow-md transition-opacity whitespace-nowrap ${isDragging ? "opacity-60" : ""}`}
          >
            {sticker.content}
          </div>
        ) : sticker.type === "minime" ? (
          <div
            onMouseDown={isAdminMode ? onMouseDown : undefined}
            className={`select-none transition-opacity ${isDragging ? "opacity-60" : ""}`}
          >
            <img
              src={
                MINIME_OPTIONS.find((m) => m.id === sticker.content)?.url ??
                sticker.content
              }
              alt="미니미"
              className="w-24 h-28 min-w-24 object-contain object-bottom drop-shadow-lg"
              draggable={false}
            />
          </div>
        ) : sticker.type === "badge" ? (
          (() => {
            const badge = JSON.parse(sticker.content) as {
              label: string;
              color: string;
              icon: string;
            };
            return (
              <div
                onMouseDown={isAdminMode ? onMouseDown : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg select-none whitespace-nowrap flex-nowrap ${isDragging ? "opacity-60" : ""}`}
                style={{ backgroundColor: badge.color, color: "#fff" }}
              >
                <img
                  src={badge.icon}
                  alt={badge.label}
                  className="w-4 h-4 shrink-0"
                  draggable={false}
                />
                {badge.label}
              </div>
            );
          })()
        ) : sticker.type === "text" ? (
          <div onMouseDown={isAdminMode ? onMouseDown : undefined}>
            {sticker.textStyle === "cloud" ? (
              <div
                className={`relative px-4 py-2 bg-white/90 rounded-[50%] border-2 border-gray-300 shadow-md select-none whitespace-nowrap text-sm ${isDragging ? "opacity-60" : ""}`}
                style={{ borderRadius: "50% / 40%" }}
              >
                {sticker.content}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-gray-300 rounded-full" />
                <div className="absolute -bottom-4 left-[45%] w-2 h-2 bg-white border-r-2 border-b-2 border-gray-300 rounded-full" />
              </div>
            ) : sticker.textStyle === "talk" ? (
              <div
                className={`relative select-none whitespace-nowrap ${isDragging ? "opacity-60" : ""}`}
              >
                <div className="px-3 py-2 bg-white/90 backdrop-blur-sm border-2 border-blog-border rounded-2xl rounded-bl-none shadow-md text-sm text-gray-800">
                  {sticker.content}
                </div>
              </div>
            ) : (
              <div
                className={`text-sm px-3 py-2 bg-white/80 backdrop-blur-sm border border-blog-border/50 rounded shadow-md select-none transition-opacity whitespace-nowrap ${isDragging ? "opacity-60" : ""}`}
              >
                {sticker.content}
              </div>
            )}
          </div>
        ) : (
          <div
            onMouseDown={isAdminMode ? onMouseDown : undefined}
            className="invisible"
          >
            {sticker.content}
          </div>
        )}

        {/* 관리자 핸들 */}
        {isAdminMode && isSelected && (
          <>
            <div
              onMouseDown={onRotateStart}
              className="absolute -top-3 -right-3 w-5 h-5 bg-blue-500 rounded-full cursor-crosshair z-20 shadow-sm flex items-center justify-center hover:bg-blue-600 select-none"
              title="드래그해서 회전"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
            </div>
            <div
              onMouseDown={onResizeStart}
              className="absolute -bottom-3 -right-3 w-5 h-5 bg-green-500 rounded-full cursor-se-resize z-20 shadow-sm flex items-center justify-center hover:bg-green-600 select-none"
              title="드래그해서 크기 조절"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                <path d="M22 22H16v-2h4v-4h2v6zM2 2h6v2H4v4H2V2z" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
