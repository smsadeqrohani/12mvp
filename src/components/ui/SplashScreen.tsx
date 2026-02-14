import { View, Text, StyleSheet, Platform } from "react-native";

/**
 * Custom splash screen matching the app design system.
 * Implements the Figma design (YekDo) - centered logo, brand name, dark background.
 */
export function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Logo area - matches login screen branding */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🏆</Text>
      </View>
      <Text style={styles.brandName}>۱۲ MVP</Text>
      <Text style={styles.tagline}>به برنامه تست هوش خوش آمدید</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06202F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    ...(Platform.OS !== "web" && { direction: "rtl" }),
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255, 112, 26, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 48,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#9ca3af",
  },
});
