import { useEffect } from "react";
import { SafeAreaView, ScrollView, View, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { Leaderboard } from "../../src/features/game";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";

export default function LeaderboardScreen() {
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/onboarding");
    }
  }, [loggedInUser, router]);

  if (loggedInUser === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF7B14" />
        </View>
      </SafeAreaView>
    );
  }

  if (loggedInUser === null) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Leaderboard />
      </ScrollView>
    </SafeAreaView>
  );
}
