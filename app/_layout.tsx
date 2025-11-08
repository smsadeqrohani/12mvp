import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
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
import { ErrorBoundary } from "../src/components/ui";
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
  style: [{ fontFamily: 'Vazirmatn-Regular' }, defaultTextProps.style],
};

const defaultTextInputProps = TextInput.defaultProps || {};
TextInput.defaultProps = {
  ...defaultTextInputProps,
  style: [{ fontFamily: 'Vazirmatn-Regular' }, defaultTextInputProps.style],
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

    if (loggedInUser === null && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (loggedInUser !== null && inAuthGroup) {
      // Check if user needs profile setup
      if (userProfile === null && segments[1] !== "profile-setup") {
        // User is logged in but no profile exists, redirect to profile setup
        router.replace("/(auth)/profile-setup");
      } else if (userProfile && segments[1] === "profile-setup") {
        // User has profile but is on profile setup page, redirect to main app
        router.replace("/(tabs)");
      } else if (userProfile && segments[1] === "login") {
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
    "Vazirmatn-Regular": require("../assets/fonts/Vazirmatn-Regular.ttf"),
    "Vazirmatn-Medium": require("../assets/fonts/Vazirmatn-Medium.ttf"),
    "Vazirmatn-SemiBold": require("../assets/fonts/Vazirmatn-SemiBold.ttf"),
    "Vazirmatn-Bold": require("../assets/fonts/Vazirmatn-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppThemeProvider>
      <ConvexProvider client={convex}>
        <ConvexAuthProvider client={convex} storage={AsyncStorage}>
          <SafeAreaProvider>
            <View 
              className="flex-1 bg-background" 
              style={Platform.OS !== 'web' ? { direction: 'rtl' } : undefined}
            >
              <RootLayoutNav />
              <Toast config={toastConfig} />
            </View>
          </SafeAreaProvider>
        </ConvexAuthProvider>
      </ConvexProvider>
    </AppThemeProvider>
  );
}

