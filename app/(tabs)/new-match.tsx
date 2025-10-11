import { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { MatchLobby, QuizGame, MatchResults } from "../../src/features/game";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";

export default function NewMatchScreen() {
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [currentMatchId, setCurrentMatchId] = useState<Id<"matches"> | null>(null);

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

  const handleMatchStart = (matchId: Id<"matches">) => {
    console.log("NewMatchScreen: Match started with ID:", matchId);
    setCurrentMatchId(matchId);
    setGameState('playing');
  };

  const handleGameComplete = () => {
    setGameState('results');
  };

  const handlePlayAgain = () => {
    setGameState('lobby');
    setCurrentMatchId(null);
  };

  if (gameState === 'playing' && currentMatchId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <QuizGame 
          matchId={currentMatchId} 
          onGameComplete={handleGameComplete}
          onLeaveMatch={handlePlayAgain}
        />
      </SafeAreaView>
    );
  }

  if (gameState === 'results' && currentMatchId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <MatchResults 
          matchId={currentMatchId} 
          onPlayAgain={handlePlayAgain}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <MatchLobby 
          onMatchStart={handleMatchStart}
          onMatchFound={handleMatchStart}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

