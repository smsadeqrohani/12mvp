import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Dimensions, Platform } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useVideoPreload } from "./VideoPreloadContext";

const VIDEO_SOURCE = require("../../../bgmv.mp4");
const GIF_FALLBACK = require("../../../alter.gif");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;
const GIF_LOOP_INTERVAL_MS = 4000;

/**
 * GIF background that forces loop by remounting + cache-bust every N seconds.
 * resolveAssetSource exists on native only; on web we rely on key remount.
 */
function GifLoopBackground() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((k) => k + 1), GIF_LOOP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  let source: (typeof GIF_FALLBACK) | { uri: string } = GIF_FALLBACK;
  if (typeof Image.resolveAssetSource === "function") {
    const resolved = Image.resolveAssetSource(GIF_FALLBACK);
    if (resolved?.uri) {
      const sep = resolved.uri.includes("?") ? "&" : "?";
      source = { uri: `${resolved.uri}${sep}t=${tick}` };
    }
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Image key={tick} source={source} style={styles.gif} resizeMode="cover" />
    </View>
  );
}

/**
 * Returns true when video autoplay is unlikely to work (mobile web, etc.)
 */
function shouldUseGifProactively(): boolean {
  if (Platform.OS !== "web") return false;
  const { width } = Dimensions.get("window");
  return width < 768;
}

/**
 * Full-screen looping video background for auth screens.
 * Uses preloaded player from context (loaded during splash) when available.
 * Fallback: on mobile web or when video fails, shows alter.gif instead.
 */
export function VideoBackground() {
  const [useGifFallback, setUseGifFallback] = useState(shouldUseGifProactively());
  const preloadedPlayer = useVideoPreload();

  // Fallback: create own player if preload not available (e.g. direct nav to login)
  const fallbackPlayer = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const player = preloadedPlayer ?? fallbackPlayer;
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (useGifFallback) return;

    const tryPlay = () => {
      try {
        player.play();
      } catch (e) {
        console.warn("[VideoBackground] play() failed:", e);
      }
    };

    const handleStatusChange = ({ status }: { status: string; error?: { message: string } }) => {
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
        } else {
          setUseGifFallback(true);
        }
      }
    };

    const sub = player.addListener("statusChange", handleStatusChange);
    const t = setTimeout(tryPlay, 100);

    return () => {
      sub.remove();
      clearTimeout(t);
    };
  }, [player, useGifFallback]);

  if (useGifFallback) {
    return <GifLoopBackground />;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        playsInline
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
  gif: {
    width: "100%",
    height: "100%",
  },
});
