import { SafeAreaView, View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { DashboardScreen } from "../../src/features/dashboard";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function DashboardTabScreen() {
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Authentication guard
  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/login");
    }
  }, [loggedInUser, router]);

  // Show loading while checking authentication
  if (loggedInUser === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (loggedInUser === null) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال انتقال به صفحه ورود...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <DashboardScreen />
    </SafeAreaView>
  );
}

