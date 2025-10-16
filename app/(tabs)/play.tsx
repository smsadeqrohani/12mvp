import { SafeAreaView, View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { QuizGame } from "../../src/features/game";
import { Id } from "../../convex/_generated/dataModel";

export default function PlayScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Authentication guard
  if (loggedInUser === null) {
    router.replace("/(auth)/login");
    return null;
  }

  // Show loading while checking authentication
  if (loggedInUser === undefined || !matchId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGameComplete = () => {
    router.replace(`/(tabs)/results/${matchId}`);
  };

  const handleLeaveMatch = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <QuizGame
        matchId={matchId as Id<"matches">}
        onGameComplete={handleGameComplete}
        onLeaveMatch={handleLeaveMatch}
      />
    </SafeAreaView>
  );
}
