import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useVideoPreload } from "./VideoPreloadContext";

const VIDEO_SOURCE = require("../../../bgmv.mp4");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

/**
 * Full-screen looping video background for auth screens.
 * On web: uses preloaded player (loaded during splash).
 * On native: creates own player - preloaded player doesn't play when attached later on iOS/Android.
 */
export function VideoBackground() {
  const preloadedPlayer = useVideoPreload();

  const fallbackPlayer = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // On native, always use fallback - preload causes video not to play on mobile
  const player =
    Platform.OS === "web" && preloadedPlayer ? preloadedPlayer : fallbackPlayer;
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

    // Initial play - on native use longer delay so VideoView is ready
    const delay = Platform.OS === "web" ? 100 : 300;
    const t = setTimeout(tryPlay, delay);

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
        onFirstFrameRender={() => {
          try {
            player.play();
          } catch (_e) {}
        }}
        {...(Platform.OS === "android" && {
          surfaceType: "textureView" as const,
        })}
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
