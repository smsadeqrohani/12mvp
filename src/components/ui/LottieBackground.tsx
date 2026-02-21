import { useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import LottieView from "lottie-react-native";

/**
 * Full-screen looping Lottie animation used as background for auth screens.
 * Covers full height/width - no empty space at top or bottom.
 */
export function LottieBackground() {
  const [size, setSize] = useState(500);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize(Math.max(width, height));
    }
  };

  return (
    <View style={styles.container} pointerEvents="none" onLayout={onLayout}>
      <LottieView
        source={require("../../../assets/animation.json")}
        autoPlay
        loop
        style={[styles.animation, { width: size, height: size }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  animation: {},
});
