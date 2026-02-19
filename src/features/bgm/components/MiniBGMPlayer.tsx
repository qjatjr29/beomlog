import { Pause, Play, SkipForward, SkipBack } from "lucide-react";
import { useBGM } from "@/contexts/BGMContext";
import { MarqueeText } from "../../bgm/components/MarqueeText";

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

  if (!currentTrack) return null;

  return (
    <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mr-2">
      <button
        onClick={goToPrev}
        disabled={playlist.length <= 1}
        className="text-white/70 hover:text-white transition-colors disabled:opacity-30"
        title="이전 곡"
      >
        <SkipBack className="w-3 h-3" />
      </button>

      <button
        onClick={togglePlay}
        disabled={!isReady}
        className="text-white hover:text-white/80 transition-colors disabled:opacity-50"
        title={isPlaying ? "일시정지" : "재생"}
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
        className="text-white/70 hover:text-white transition-colors disabled:opacity-30"
        title="다음 곡"
      >
        <SkipForward className="w-3 h-3" />
      </button>

      <div className="w-20 hidden sm:block ml-1 border-l border-white/20 pl-2">
        <MarqueeText
          text={currentTrack.title}
          animate={isPlaying}
          className="text-white/80 text-[10px] font-medium"
        />
      </div>
    </div>
  );
};
