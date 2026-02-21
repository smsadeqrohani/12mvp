import { useRef, useState } from "react";
import {
  StyleSheet,
  Platform,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import LottieView from "lottie-react-native";

/**
 * Splash screen with Lottie animation.
 * Full height/width - no empty space. Plays once, then fades out.
 */
export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [size, setSize] = useState(500);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize(Math.max(width, height));
    }
  };

  const handleAnimationFinish = (isCancelled: boolean) => {
    if (isCancelled) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => onComplete?.());
  };

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      onLayout={onLayout}
    >
      <LottieView
        source={require("../../../assets/splash.lottie")}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
        style={[styles.animation, { width: size, height: size }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06202F",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS !== "web" && { direction: "rtl" }),
  },
  animation: {},
});
