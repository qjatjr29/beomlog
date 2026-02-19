import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { getBGMPlaylist } from "@/data/storage/setting.storage";
import { BGMTrack } from "@/features/bgm/types";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface BGMContextType {
  playlist: BGMTrack[];
  setPlaylist: React.Dispatch<React.SetStateAction<BGMTrack[]>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isReady: boolean;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  shouldAutoPlayRef: React.MutableRefObject<boolean>;
  playlistRef: React.MutableRefObject<BGMTrack[]>;
  togglePlay: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  isLoading: boolean;
}

const BGMContext = createContext<BGMContextType | null>(null);

export const BGMProvider = ({ children }: { children: ReactNode }) => {
  const [playlist, setPlaylist] = useState<BGMTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  const shouldAutoPlayRef = useRef(false);
  const playlistRef = useRef<BGMTrack[]>([]);
  const playerRef = useRef<any>(null);
  const playerElementId = "global-yt-player";

  const currentTrack = playlist[currentIndex] ?? null;

  useEffect(() => {
    getBGMPlaylist().then((tracks) => {
      setPlaylist(tracks);
      playlistRef.current = tracks;
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    if (!currentTrack) return;

    const initPlayer = () => {
      if (!window.YT?.Player) return;
      setTimeout(() => {
        const el = document.getElementById(playerElementId);
        if (!el) return;
        if (playerRef.current?.destroy) {
          try {
            playerRef.current.destroy();
          } catch {}
          playerRef.current = null;
        }
        setIsReady(false);
        playerRef.current = new window.YT.Player(playerElementId, {
          height: "0",
          width: "0",
          videoId: currentTrack.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
            iv_load_policy: 3,
            fs: 0,
          },
          events: {
            onReady: (e: any) => {
              e.target.setVolume(volume);
              setIsReady(true);
              if (shouldAutoPlayRef.current) e.target.playVideo();
            },
            onStateChange: (e: any) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (e.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (e.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                const list = playlistRef.current;
                if (!shouldAutoPlayRef.current) return;
                if (list.length > 1) {
                  setCurrentIndex((p) => (p + 1) % list.length);
                } else {
                  e.target.seekTo(0);
                  e.target.playVideo();
                }
              }
            },
            onError: (e: any) => console.error("YouTube error:", e.data),
          },
        });
      }, 100);
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document
          .getElementsByTagName("script")[0]
          .parentNode?.insertBefore(
            tag,
            document.getElementsByTagName("script")[0],
          );
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [currentTrack?.videoId]);

  useEffect(() => {
    if (playerRef.current?.setVolume && isReady) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, isReady]);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        shouldAutoPlayRef.current = false;
      } else {
        playerRef.current.playVideo();
        shouldAutoPlayRef.current = true;
      }
    } catch {}
  };

  const goToPrev = () => {
    const wasPlaying = shouldAutoPlayRef.current;
    shouldAutoPlayRef.current = wasPlaying;
    setCurrentIndex((p) => (p - 1 + playlist.length) % playlist.length);
  };

  const goToNext = () => {
    const wasPlaying = shouldAutoPlayRef.current;
    shouldAutoPlayRef.current = wasPlaying;
    setCurrentIndex((p) => (p + 1) % playlist.length);
  };

  return (
    <BGMContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentIndex,
        setCurrentIndex,
        isPlaying,
        setIsPlaying,
        isReady,
        volume,
        setVolume,
        shouldAutoPlayRef,
        playlistRef,
        togglePlay,
        goToPrev,
        goToNext,
        isLoading,
      }}
    >
      <div id={playerElementId} style={{ display: "none" }} />
      {children}
    </BGMContext.Provider>
  );
};

export const useBGM = () => {
  const ctx = useContext(BGMContext);
  if (!ctx) throw new Error("useBGM must be used within BGMProvider");
  return ctx;
};
