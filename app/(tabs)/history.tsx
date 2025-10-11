import { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { MatchHistory, MatchResults } from "../../src/features/game";
import { Id } from "../../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";

export default function HistoryScreen() {
  const [viewingMatchId, setViewingMatchId] = useState<string | null>(null);
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Authentication guard
  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/login");
    }
  }, [loggedInUser, router]);

  const handleViewMatch = (matchId: string) => {
    setViewingMatchId(matchId);
  };

  const handleBackToHistory = () => {
    setViewingMatchId(null);
  };

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

  if (viewingMatchId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1">
          <View className="p-6">
            <TouchableOpacity
              onPress={handleBackToHistory}
              className="flex-row items-center gap-2 px-4 py-3 bg-background-light rounded-lg mb-6 w-fit"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#ff701a" />
              <Text className="text-accent font-semibold">بازگشت به تاریخچه</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-1">
            <MatchResults 
              matchId={viewingMatchId as Id<"matches">} 
              onPlayAgain={handleBackToHistory}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MatchHistory onViewMatch={handleViewMatch} />
    </SafeAreaView>
  );
}

