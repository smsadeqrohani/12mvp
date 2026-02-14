import { useEffect, useState } from "react";
import { SafeAreaView, View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useQuery } from "convex/react";
import { MatchHistory } from "../../src/features/game";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"matches" | "tournaments">("matches");
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Authentication guard
  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/onboarding");
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
      {/* Tab Header */}
      <View className="flex-row border-b border-gray-700 bg-background">
        <TouchableOpacity
          onPress={() => setActiveTab("matches")}
          className={`flex-1 py-4 items-center ${activeTab === "matches" ? "border-b-2 border-accent" : ""}`}
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-semibold ${activeTab === "matches" ? "text-accent" : "text-gray-400"}`}>
            مسابقات
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab("tournaments")}
          className={`flex-1 py-4 items-center ${activeTab === "tournaments" ? "border-b-2 border-accent" : ""}`}
          activeOpacity={0.7}
        >
          <Text className={`text-lg font-semibold ${activeTab === "tournaments" ? "text-accent" : "text-gray-400"}`}>
            تورنومنت‌ها
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "matches" ? (
          <MatchHistory onViewMatch={() => {}} />
        ) : (
          <TournamentHistory />
        )}
      </View>
    </SafeAreaView>
  );
}

// Tournament History Component
function TournamentHistory() {
  const router = useRouter();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const tournamentHistory = useQuery(
    api.tournaments.getUserTournamentHistory,
    loggedInUser ? {} : "skip"
  );

  if (!tournamentHistory) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  if (tournamentHistory.length === 0) {
    return (
      <View className="max-w-2xl mx-auto items-center py-16 px-6">
        <View className="w-24 h-24 bg-gray-700/50 rounded-full items-center justify-center mb-6">
          <Ionicons name="trophy-outline" size={48} color="#6b7280" />
        </View>
        <Text className="text-2xl font-bold text-white mb-4">
          تاریخچه تورنومنت‌ها خالی است
        </Text>
        <Text className="text-gray-400 mb-6 text-center">
          هنوز در هیچ تورنومنتی شرکت نکرده‌اید. اولین تورنومنت خود را شروع کنید!
        </Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-600/20 border-green-500/30 text-green-400";
      case "cancelled": return "bg-red-600/20 border-red-500/30 text-red-400";
      default: return "bg-gray-600/20 border-gray-500/30 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "پایان یافته";
      case "cancelled": return "لغو شده";
      default: return "در حال انجام";
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="text-3xl font-bold text-accent mb-2">
          تاریخچه تورنومنت‌ها
        </Text>
        <Text className="text-gray-300">
          {tournamentHistory.length} تورنومنت
        </Text>
      </View>

      {/* Tournament List */}
      {tournamentHistory.map((tournament, index) => {
        const isWinner = tournament.winnerId === loggedInUser?._id;
        
        return (
          <TouchableOpacity
            key={tournament._id}
            onPress={() => router.push(`/tournament/${tournament.tournamentId}`)}
            className="bg-background-light/60 rounded-xl border border-gray-700/30 p-6 mb-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between mb-4">
              {/* Tournament Number */}
              <View className="w-12 h-12 bg-gray-700/50 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">
                  {index + 1}
                </Text>
              </View>

              {/* Winner Badge */}
              {tournament.status === "completed" && isWinner && (
                <View className="flex-row items-center gap-2 bg-yellow-600/20 px-3 py-1 rounded-full border border-yellow-500/30">
                  <Ionicons name="trophy" size={16} color="#fbbf24" />
                  <Text className="text-yellow-400 text-xs font-semibold">برنده</Text>
                </View>
              )}
            </View>

            {/* Tournament Info */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-white mb-2">
                تورنومنت #{tournament.tournamentId.slice(-8)}
              </Text>
              
              {/* Status Badge */}
              <View className={`inline-flex items-center self-start px-3 py-1 rounded-full border ${getStatusColor(tournament.status)}`}>
                <Text className="text-sm font-semibold">
                  {getStatusText(tournament.status)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row gap-4 mb-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-accent">
                  {tournament.totalMatches || 0}
                </Text>
                <Text className="text-xs text-gray-400">بازی‌ها</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-400">
                  {tournament.totalPlayers || 4}
                </Text>
                <Text className="text-xs text-gray-400">بازیکن</Text>
              </View>
              
              {tournament.category && (
                <View className="items-center">
                  <Text className="text-sm font-bold text-gray-300">
                    {tournament.category.persianName}
                  </Text>
                  <Text className="text-xs text-gray-400">دسته‌بندی</Text>
                </View>
              )}
            </View>

            {/* Date */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-400">
                {tournament.completedAt 
                  ? new Date(tournament.completedAt).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : tournament.createdAt
                  ? new Date(tournament.createdAt).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'نامشخص'
                }
              </Text>
              
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

