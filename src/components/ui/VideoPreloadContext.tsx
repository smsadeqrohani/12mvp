import { createContext, useContext, ReactNode } from "react";
import { useVideoPlayer } from "expo-video";
import type { VideoPlayer } from "expo-video";

const VIDEO_SOURCE = require("../../../bgmv.mp4");

const VideoPreloadContext = createContext<VideoPlayer | null>(null);

/**
 * Preloads bgmv.mp4 during splash. Creates player on mount, buffers in background.
 * When user reaches login/onboarding, VideoBackground uses this preloaded player.
 */
export function VideoPreloadProvider({ children }: { children: ReactNode }) {
  const player = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play(); // Start buffering immediately
  });

  return (
    <VideoPreloadContext.Provider value={player}>
      {children}
    </VideoPreloadContext.Provider>
  );
}

export function useVideoPreload() {
  return useContext(VideoPreloadContext);
}
