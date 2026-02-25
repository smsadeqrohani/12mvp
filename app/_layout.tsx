import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments, usePathname } from "expo-router";
import { View, I18nManager, Text, TextInput, Platform } from "react-native";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../convex/_generated/api";
import { toastConfig } from "../src/lib/toast";
import { ErrorBoundary, SplashScreen as AppSplashScreen } from "../src/components/ui";
import "../global.css";

// Initialize Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || "");

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

// Enable RTL for all platforms
I18nManager.allowRTL(true);

// Force RTL layout if not already set
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  // Note: On native platforms, this requires an app restart to take effect
  // The user may need to close and reopen the app the first time
}

// Configure NativeWind dark mode
import { useColorScheme } from 'nativewind';

// Set default font for all Text and TextInput components
const defaultTextProps = Text.defaultProps || {};
Text.defaultProps = {
  ...defaultTextProps,
  style: [{ fontFamily: 'Meem-Regular' }, defaultTextProps.style],
};

const defaultTextInputProps = TextInput.defaultProps || {};
TextInput.defaultProps = {
  ...defaultTextInputProps,
  style: [{ fontFamily: 'Meem-Regular' }, defaultTextInputProps.style],
};

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { setColorScheme } = useColorScheme();
  
  useEffect(() => {
    setColorScheme('dark');
  }, []);
  
  return <>{children}</>;
}

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);

  useEffect(() => {
    if (loggedInUser === undefined) return; // Still loading

    const inAuthGroup = segments[0] === "(auth)";

    if (loggedInUser === null) {
      // Logged-out users: redirect to onboarding only if outside auth (e.g. tabs)
      // Allow staying on login/signup when coming from onboarding button
      if (!inAuthGroup) {
        router.replace("/(auth)/onboarding");
      }
    } else if (loggedInUser !== null && inAuthGroup) {
      // Check if user needs profile setup
      if (userProfile === null && segments[1] !== "profile-setup") {
        // User is logged in but no profile exists, redirect to profile setup
        router.replace("/(auth)/profile-setup");
      } else if (userProfile && segments[1] === "profile-setup") {
        // User has profile but is on profile setup page, redirect to main app
        router.replace("/(tabs)");
      } else if (userProfile && (segments[1] === "login" || segments[1] === "onboarding")) {
        // User has profile but is on login page, redirect to main app
        router.replace("/(tabs)");
      }
    }
  }, [loggedInUser, userProfile, segments]);

  return (
    <ErrorBoundary>
      <Slot />
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Meem-Regular": require("../Fonts-ttf/meem-ttf/ttf/Meem-Regular.ttf"),
    "Meem-Medium": require("../Fonts-ttf/meem-ttf/ttf/Meem-Medium.ttf"),
    "Meem-SemiBold": require("../Fonts-ttf/meem-ttf/ttf/Meem-SemiBold.ttf"),
    "Meem-Bold": require("../Fonts-ttf/meem-ttf/ttf/Meem-Bold.ttf"),
  });

  const [appReady, setAppReady] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  // Hide native splash when showing custom splash
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  // Show app when fonts ready (loaded or failed) AND splash animation finished + faded out
  useEffect(() => {
    if ((fontsLoaded || fontError) && splashComplete) {
      setAppReady(true);
    }
  }, [fontsLoaded, fontError, splashComplete]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    let cancelled = false;
    import("@vercel/speed-insights")
      .then(({ injectSpeedInsights }) => {
        if (!cancelled) {
          injectSpeedInsights();
        }
      })
      .catch((error) => {
        console.warn("Failed to initialize Vercel Speed Insights:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Mobile viewport width for web (shared by splash and app)
  // Admin is full screen on desktop; app/tabs stay in mobile viewport
  const pathname = usePathname();
  const isAdminRoute = typeof pathname === "string" && pathname.startsWith("/admin");

  const mobileViewportWrapper = (child: React.ReactNode) =>
    Platform.OS === "web" && !isAdminRoute ? (
      <View
        style={{
          flex: 1,
          minHeight: "100vh",
          backgroundColor: "#e5e7eb",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <View
          style={{
            width: 430,
            maxWidth: "100%",
            minHeight: "100vh",
            flex: 1,
            backgroundColor: "#06202F",
            direction: "rtl",
          }}
        >
          {child}
        </View>
      </View>
    ) : Platform.OS === "web" && isAdminRoute ? (
      <View style={{ flex: 1, minHeight: "100vh", width: "100%", direction: "rtl" }}>
        {child}
      </View>
    ) : (
      child
    );

  if (!appReady) {
    return mobileViewportWrapper(
      <AppSplashScreen onComplete={() => setSplashComplete(true)} />
    );
  }

  const appContent = (
    <View 
      className="flex-1 bg-background" 
      style={Platform.OS !== 'web' ? { direction: 'rtl' } : undefined}
    >
      <RootLayoutNav />
      <Toast config={toastConfig} />
    </View>
  );

  const content = mobileViewportWrapper(appContent);

  return (
    <AppThemeProvider>
      <ConvexProvider client={convex}>
        <ConvexAuthProvider client={convex} storage={AsyncStorage}>
          <SafeAreaProvider>{content}</SafeAreaProvider>
        </ConvexAuthProvider>
      </ConvexProvider>
    </AppThemeProvider>
  );
}

