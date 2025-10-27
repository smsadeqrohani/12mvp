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
  
  // Get match completion status
  const matchCompletion = useQuery(
    api.matches.checkMatchCompletion,
    matchId ? { matchId: matchId as Id<"matches"> } : "skip"
  );
  
  // Check if this is a tournament match
  const tournamentMatch = useQuery(
    api.tournaments.checkTournamentMatch,
    matchId ? { matchId: matchId as Id<"matches"> } : "skip"
  );

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
    // Check if this is a tournament match
    if (tournamentMatch) {
      // If match is fully completed, go to tournament detail page
      if (matchCompletion?.isCompleted) {
        console.log("Tournament match completed, redirecting to tournament detail page");
        router.replace(`/tournament/${tournamentMatch.tournamentId}`);
      } else {
        // User finished first - still go to tournament detail page
        console.log("User finished tournament match, showing tournament details");
        router.replace(`/tournament/${tournamentMatch.tournamentId}`);
      }
      return;
    }
    
    // Regular match (not part of tournament)
    if (matchCompletion?.isCompleted) {
      // Match is fully completed - show results
      console.log("Match completed, showing results");
      router.replace(`/(tabs)/results/${matchId}`);
    } else {
      // User finished first - go to new-match tab to see pending results
      console.log("User finished first, showing pending results in lobby");
      router.replace("/(tabs)/new-match");
    }
  };

  const handleLeaveMatch = () => {
    console.log("handleLeaveMatch called, navigating to new-match");
    router.replace("/(tabs)/new-match");
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
