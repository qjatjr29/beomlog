import { Volume2, VolumeX } from "lucide-react";

export const VolumeController = ({
  volume,
  setVolume,
}: {
  volume: number;
  setVolume: (v: number) => void;
}) => (
  <div className="flex items-center gap-2 mb-3">
    {volume === 0 ? (
      <VolumeX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    ) : (
      <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    )}
    <input
      type="range"
      min="0"
      max="100"
      value={volume}
      onChange={(e) => setVolume(parseInt(e.target.value))}
      className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blog-primary"
    />
    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
      {volume}
    </span>
  </div>
);
