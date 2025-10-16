import { SafeAreaView, View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MatchResults } from "../../../src/features/game";
import { Id } from "../../../convex/_generated/dataModel";

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Authentication guard
  if (loggedInUser === null) {
    router.replace("/(auth)/login");
    return null;
  }

  // Show loading while checking authentication
  if (loggedInUser === undefined || !id) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlayAgain = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MatchResults
        matchId={id as Id<"matches">}
        onPlayAgain={handlePlayAgain}
      />
    </SafeAreaView>
  );
}
