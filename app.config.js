// Check if building on Vercel (web-only build)
const isVercelBuild = process.env.VERCEL === "1";

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
    // Only include iOS config for local builds, exclude on Vercel
    ...(!isVercelBuild && {
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.12mvp.app",
        infoPlist: {
          UIViewControllerBasedStatusBarAppearance: true,
          UIStatusBarStyle: "UIStatusBarStyleLightContent",
          // Enable RTL layout
          CFBundleDevelopmentRegion: "fa",
          CFBundleAllowMixedLocalizations: true
        }
      }
    }),
    // Only include Android config for local builds, exclude on Vercel
    ...(!isVercelBuild && {
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#06202F"
        },
        package: "com.mvp12.app",
        permissions: [],
        // Enable RTL support for Android
        supportsRtl: true
      }
    }),
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

