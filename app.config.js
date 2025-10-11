export default {
  expo: {
    name: "12 MVP",
    slug: "12mvp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#06202F"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.12mvp.app",
      infoPlist: {
        UIViewControllerBasedStatusBarAppearance: true,
        UIStatusBarStyle: "UIStatusBarStyleLightContent"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#06202F"
      },
      package: "com.mvp12.app",
      permissions: []
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-font"
    ],
    scheme: "12mvp",
    experiments: {
      typedRoutes: true
    },
    extra: {
      convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL
    }
  }
};

