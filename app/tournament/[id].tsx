import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../convex/_generated/api";
import { Trophy, Users, Clock, CheckCircle } from "lucide-react-native";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  const tournamentDetails = useQuery(api.tournaments.getTournamentDetails, {
    tournamentId: id || "",
  });

  // Authentication guard
  useEffect(() => {
    if (loggedInUser === null) {
      router.replace("/(auth)/login");
    }
  }, [loggedInUser, router]);

  // Show loading while checking authentication
  if (loggedInUser === undefined || tournamentDetails === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff701a" />
          <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournamentDetails || loggedInUser === null) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-400 text-lg">تورنومنت یافت نشد</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold">بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { tournament, participants, matches } = tournamentDetails;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-gray-500";
      case "active":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "منتظر بازیکنان";
      case "active":
        return "در حال بازی";
      case "completed":
        return "پایان یافته";
      case "cancelled":
        return "لغو شده";
      default:
        return "نامشخص";
    }
  };

  const getRoundText = (round: string) => {
    switch (round) {
      case "semi1":
        return "نیمه‌نهایی ۱";
      case "semi2":
        return "نیمه‌نهایی ۲";
      case "final":
        return "فینال";
      default:
        return round;
    }
  };

  const handleJoinMatch = (matchId: string) => {
    router.push(`/(tabs)/play?matchId=${matchId}`);
  };

  // Get player names or winner from completed matches
  const getPlayerName = (matchData: any, userId: string) => {
    const isFinal = matchData.round === "final";
    
    // For final match without actual match data (placeholder), show semi-final winners
    if (isFinal && !matchData.match) {
      const semi1 = matches.find((m: any) => m.round === "semi1");
      const semi2 = matches.find((m: any) => m.round === "semi2");
      
      // Check if semifinals are completed and we have winners
      if (semi1?.match?.status === "completed" && semi1.winnerId) {
        if (matchData.player1Id === semi1.player1Id || matchData.player1Id === semi1.player2Id) {
          const winner = participants.find((p) => p.userId === semi1.winnerId);
          if (winner) return winner.profile?.name || "برنده نیمه‌نهایی ۱";
        }
      }
      
      if (semi2?.match?.status === "completed" && semi2.winnerId) {
        if (matchData.player2Id === semi2.player1Id || matchData.player2Id === semi2.player2Id) {
          const winner = participants.find((p) => p.userId === semi2.winnerId);
          if (winner) return winner.profile?.name || "برنده نیمه‌نهایی ۲";
        }
      }
      
      // Fallback: show placeholder text
      if (matchData.player1Id === semi1?.player1Id || matchData.player1Id === semi1?.player2Id) {
        return "برنده نیمه‌نهایی ۱";
      }
      if (matchData.player2Id === semi2?.player1Id || matchData.player2Id === semi2?.player2Id) {
        return "برنده نیمه‌نهایی ۲";
      }
    }
    
    const participant = participants.find((p) => p.userId === userId);
    return participant?.profile?.name || "Unknown";
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-orange-500 text-lg">← بازگشت</Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center mb-4">
            <Trophy size={32} color="#ff701a" />
            <Text className="text-white text-2xl font-bold mr-3">
              جزئیات تورنومنت
            </Text>
          </View>

          {/* Tournament Status */}
          <View className="bg-card p-4 rounded-2xl mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Users size={20} color="#ff701a" />
                <Text className="text-white text-lg font-bold mr-2">
                  شرکت کنندگان
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">
                {participants.length} / 4
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={20} color="#ff701a" />
                <Text className="text-white text-lg font-bold mr-2">
                  وضعیت
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full ${getStatusColor(tournament.status)} mr-2`} />
                <Text className="text-gray-400 text-lg">
                  {getStatusText(tournament.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Participants List */}
          <View className="bg-card p-4 rounded-2xl mb-4">
            <Text className="text-white text-lg font-bold mb-3">
              فهرست شرکت کنندگان
            </Text>
            {participants.map((p, index) => (
              <View
                key={p._id}
                className="flex-row items-center justify-between py-2 border-b border-gray-700 last:border-0"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-gray-300">
                    {p.profile?.name || "Unknown"}
                  </Text>
                </View>
                {p.userId === loggedInUser?._id && (
                  <Text className="text-orange-500 text-xs">شما</Text>
                )}
              </View>
            ))}
          </View>

          {/* Matches */}
          <View className="bg-card p-4 rounded-2xl mb-4">
            <Text className="text-white text-lg font-bold mb-3">
              وضعیت بازی‌ها
            </Text>

            {matches.length === 0 ? (
              <Text className="text-gray-400 text-center py-4">
                هنوز بازی‌ای شروع نشده است
              </Text>
            ) : (
              matches.map((matchData) => {
                const match = matchData.match;
                const isUserInMatch = 
                  matchData.player1Id === loggedInUser?._id ||
                  matchData.player2Id === loggedInUser?._id;
                const isMatchCompleted = match?.status === "completed";
                const isMatchActive = match?.status === "active";
                const isFinal = matchData.round === "final";
                
                // For final match without actual match data, check if user is in semis
                let userCanPlayFinal = false;
                if (isFinal && !match) {
                  // Check if user won one of the semi-finals
                  const semi1 = matches.find((m: any) => m.round === "semi1" && m.winnerId === loggedInUser?._id);
                  const semi2 = matches.find((m: any) => m.round === "semi2" && m.winnerId === loggedInUser?._id);
                  userCanPlayFinal = !!semi1 || !!semi2;
                }
                
                // Show button only if user is in the match OR if it's final and user won semis
                const shouldShowJoinButton = isUserInMatch || (isFinal && userCanPlayFinal);

                return (
                  <View
                    key={matchData._id}
                    className="border border-gray-700 rounded-xl p-4 mb-3 last:mb-0"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-orange-500 font-bold">
                        {getRoundText(matchData.round)}
                      </Text>
                      <View className="flex-row items-center">
                        <View
                          className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                            matchData.status
                          )}`}
                        />
                        <Text className="text-gray-400 text-sm">
                          {getStatusText(matchData.status)}
                        </Text>
                      </View>
                    </View>

                    <View className="border-t border-gray-700 pt-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white font-bold">
                          {getPlayerName(matchData, matchData.player1Id)}
                        </Text>
                        {matchData.player1Id === loggedInUser?._id && (
                          <Text className="text-orange-500 text-xs mr-2">
                            شما
                          </Text>
                        )}
                        {isMatchCompleted && matchData.winnerId === matchData.player1Id && (
                          <CheckCircle size={20} color="#10b981" />
                        )}
                      </View>

                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white">vs</Text>
                      </View>

                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-white font-bold">
                          {getPlayerName(matchData, matchData.player2Id)}
                        </Text>
                        {matchData.player2Id === loggedInUser?._id && (
                          <Text className="text-orange-500 text-xs mr-2">
                            شما
                          </Text>
                        )}
                        {isMatchCompleted && matchData.winnerId === matchData.player2Id && (
                          <CheckCircle size={20} color="#10b981" />
                        )}
                      </View>
                    </View>

                    {shouldShowJoinButton && !isMatchCompleted && match && (
                      <TouchableOpacity
                        onPress={() => handleJoinMatch(matchData.matchId)}
                        className="bg-orange-500 py-3 rounded-xl mt-2"
                      >
                        <Text className="text-white text-center font-bold">
                          {isMatchActive ? "ورود به بازی" : "در انتظار شروع..."}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {!match && !shouldShowJoinButton && isFinal && (
                      <Text className="text-gray-400 text-center py-3">
                        در انتظار پایان نیمه‌نهایی‌ها...
                      </Text>
                    )}
                    
                    {!match && !shouldShowJoinButton && !isFinal && (
                      <Text className="text-gray-400 text-center py-3">
                        در انتظار بازیکنان...
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
