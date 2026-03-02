import { Pause, Play, SkipForward, SkipBack } from "lucide-react";
import { motion } from "framer-motion";
import { useBGM } from "@/contexts/BGMContext";
import { MarqueeText } from "./MarqueeText";

export const MiniPlayer = () => {
  const {
    playlist,
    currentIndex,
    isPlaying,
    isReady,
    togglePlay,
    goToPrev,
    goToNext,
  } = useBGM();

  const currentTrack = playlist[currentIndex] ?? null;

  const eqBars = [
    { heights: [3, 10, 3], duration: 0.5 },
    { heights: [6, 3, 8], duration: 0.7 },
    { heights: [4, 9, 2], duration: 0.6 },
  ];

  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      {/* 이퀄라이저 */}
      <div className="flex gap-0.5 items-end h-3 shrink-0">
        {eqBars.map((bar, i) => (
          <motion.div
            key={i}
            className="w-0.5 bg-white rounded-sm"
            style={{ height: 3 }}
            animate={isPlaying ? { height: bar.heights } : { height: 3 }}
            transition={
              isPlaying
                ? {
                    repeat: Infinity,
                    duration: bar.duration,
                    ease: "easeInOut",
                  }
                : { duration: 0.2 }
            }
          />
        ))}
      </div>

      {/* 노래 제목 마퀴 */}
      {currentTrack && (
        <div className="w-20 hidden sm:block overflow-hidden">
          <MarqueeText
            text={currentTrack.title}
            animate={isPlaying}
            className="text-white/80 text-[10px]"
          />
        </div>
      )}

      <button
        onClick={goToPrev}
        disabled={playlist.length <= 1}
        className="text-white/70 hover:text-white transition-colors disabled:opacity-30"
        title="이전 곡"
      >
        <SkipBack className="w-2.5 h-2.5" />
      </button>
      <button
        onClick={togglePlay}
        disabled={!isReady || !currentTrack}
        className="text-white hover:text-white/80 transition-colors disabled:opacity-50"
        title={isPlaying ? "일시정지" : "재생"}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </button>
      <button
        onClick={goToNext}
        disabled={playlist.length <= 1}
        className="text-white/70 hover:text-white transition-colors disabled:opacity-30"
        title="다음 곡"
      >
        <SkipForward className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};
