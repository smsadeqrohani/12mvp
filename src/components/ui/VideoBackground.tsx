import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useVideoPreload } from "./VideoPreloadContext";

const VIDEO_SOURCE = require("../../../bgmv.mp4");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

/**
 * Full-screen looping video background for auth screens.
 * Uses preloaded player from context (loaded during splash) when available.
 * Loop + retry on error. Ensures autoplay.
 */
export function VideoBackground() {
  const preloadedPlayer = useVideoPreload();

  // Fallback: create own player if preload not available (e.g. direct nav to login)
  const fallbackPlayer = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const player = preloadedPlayer ?? fallbackPlayer;
  const retryCountRef = useRef(0);

  useEffect(() => {
    const tryPlay = () => {
      try {
        player.play();
      } catch (e) {
        console.warn("[VideoBackground] play() failed:", e);
      }
    };

    const handleStatusChange = ({
      status,
      error,
    }: {
      status: string;
      error?: { message: string };
    }) => {
      if (status === "readyToPlay") {
        retryCountRef.current = 0;
        tryPlay();
      } else if (status === "error") {
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          const delay = RETRY_DELAY_MS * retryCountRef.current;
          setTimeout(() => {
            player.currentTime = 0;
            tryPlay();
          }, delay);
        }
      }
    };

    const sub = player.addListener("statusChange", handleStatusChange);

    // Initial play attempt (helps web autoplay after mount)
    const t = setTimeout(tryPlay, 100);

    return () => {
      sub.remove();
      clearTimeout(t);
    };
  }, [player]);

  return (
    <View style={styles.container} pointerEvents="none">
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
