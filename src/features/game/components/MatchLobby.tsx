import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "../../../lib/toast";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../components/ui";

interface MatchLobbyProps {
  onMatchStart?: (matchId: Id<"matches">) => void;
  onMatchFound?: (matchId: Id<"matches">) => void;
}

export function MatchLobby({ onMatchStart, onMatchFound }: MatchLobbyProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const router = useRouter();
  
  const userProfile = useQuery(api.auth.getUserProfile);
  const waitingMatches = useQuery(api.matches.getWaitingMatches);
  const myWaitingMatches = useQuery(api.matches.getMyWaitingMatches);
  const activeMatches = useQuery(api.matches.getUserActiveMatches);
  const pendingResultsMatches = useQuery(api.matches.getUserPendingResultsMatches);
  
  const createMatch = useMutation(api.matches.createMatch);
  const joinMatch = useMutation(api.matches.joinMatch);
  const cancelMatch = useMutation(api.matches.cancelMatch);

  // Update current time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateMatch = async () => {
    try {
      setIsCreating(true);
      const matchId = await createMatch();
      toast.success("بازی ایجاد شد! منتظر نفر دوم باشید");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("خطا در ایجاد بازی: " + (error as Error).message);
      setIsCreating(false);
    }
  };

  const handleJoinMatch = async (matchId: Id<"matches">) => {
    try {
      await joinMatch({ matchId });
      toast.success("به بازی پیوستید!");
      router.push(`/(tabs)/play?matchId=${matchId}`);
    } catch (error) {
      console.error("Error joining match:", error);
      toast.error("خطا در پیوستن به بازی: " + (error as Error).message);
    }
  };

  const handleCancelMatch = async (matchId: Id<"matches">) => {
    try {
      await cancelMatch({ matchId });
      toast.success("بازی لغو شد");
    } catch (error) {
      console.error("Error canceling match:", error);
      toast.error("خطا در لغو بازی: " + (error as Error).message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Wait a bit for queries to refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - currentTime;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (remaining <= 0) {
      return "منقضی شده";
    }
    
    if (hours > 0) {
      return `${hours} ساعت و ${minutes} دقیقه`;
    }
    return `${minutes} دقیقه`;
  };

  if (!userProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  const otherWaitingMatches = waitingMatches?.filter(m => !m.isUserCreator) || [];

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#ff701a" />
      }
    >
      <View className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <View className="items-center">
        <Text className="text-3xl font-bold text-accent mb-2" style={{ fontFamily: 'Vazirmatn-Bold' }}>
          مسابقه کویز دو نفره
        </Text>
          <Text className="text-gray-300 text-center" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            بازی جدید بساز یا به بازی‌های دیگران بپیوند
          </Text>
        </View>

        {/* Create New Match */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            ایجاد بازی جدید
          </Text>
          
          <TouchableOpacity
            onPress={handleCreateMatch}
            disabled={isCreating}
            className="flex-row items-center justify-center gap-3 px-6 py-4 bg-accent rounded-xl disabled:opacity-50"
            activeOpacity={0.7}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            )}
            <Text className="text-white font-semibold">ساخت بازی جدید</Text>
          </TouchableOpacity>
          
          <Text className="text-gray-400 text-sm mt-3 text-center">
            بازی ایجاد می‌شود و 24 ساعت منتظر نفر دوم می‌ماند
          </Text>
        </View>

        {/* Active Matches - User needs to complete */}
        {activeMatches && activeMatches.length > 0 && (
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <Text className="text-xl font-semibold text-white mb-4">
              بازی‌های فعال ({activeMatches.length})
            </Text>
            
            {activeMatches.map((match) => (
              <View key={match.matchId} className="bg-gray-800/50 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-3">
                    <Avatar avatarId={match.opponentAvatarId} size="sm" />
                    <Text className="text-white font-semibold">بازی با {match.opponentName}</Text>
                  </View>
                  <View className={`${match.status === "waiting" ? "bg-yellow-500/20" : "bg-blue-500/20"} px-3 py-1 rounded-full`}>
                    <Text className={`${match.status === "waiting" ? "text-yellow-500" : "text-blue-500"} text-xs`}>
                      {match.status === "waiting" ? "منتظر حریف" : "در حال بازی"}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-400 text-sm mb-2">
                  پیشرفت: {match.questionsAnswered} از {match.totalQuestions} سؤال
                </Text>
                
                <Text className="text-gray-400 text-sm mb-3">
                  زمان باقی‌مانده: {formatTimeRemaining(match.expiresAt)}
                </Text>
                
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => router.push(`/(tabs)/play?matchId=${match.matchId}`)}
                    className="flex-1 flex-row items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="play-circle-outline" size={20} color="#fff" />
                    <Text className="text-white font-semibold text-sm">ادامه بازی</Text>
                  </TouchableOpacity>

                  {match.canCancel && (
                    <TouchableOpacity
                      onPress={() => handleCancelMatch(match.matchId)}
                      className="flex-row items-center justify-center gap-2 px-4 py-2 bg-red-600 rounded-lg"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#fff" />
                      <Text className="text-white font-semibold text-sm">لغو بازی</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* My Waiting Matches */}
        {myWaitingMatches && myWaitingMatches.length > 0 && (
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <Text className="text-xl font-semibold text-white mb-4">
              بازی‌های من ({myWaitingMatches.length})
            </Text>
            
            {myWaitingMatches.map((match) => (
              <View key={match._id} className="bg-gray-800/50 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-semibold">بازی شما</Text>
                  <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Text className="text-yellow-500 text-xs">در انتظار</Text>
                  </View>
                </View>
                
                <Text className="text-gray-400 text-sm mb-3">
                  زمان باقی‌مانده: {formatTimeRemaining(match.expiresAt)}
                </Text>
                
                <TouchableOpacity
                  onPress={() => handleCancelMatch(match._id)}
                  className="flex-row items-center justify-center gap-2 px-4 py-2 bg-red-600 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#fff" />
                  <Text className="text-white font-semibold text-sm">لغو بازی</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Available Matches to Join */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            بازی‌های در انتظار ({otherWaitingMatches.length})
          </Text>
          
          {otherWaitingMatches.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="game-controller-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 mt-4 text-center">
                فعلاً بازی در انتظاری وجود ندارد{'\n'}اولین نفری باش که بازی می‌سازه!
              </Text>
            </View>
          ) : (
            otherWaitingMatches.map((match) => (
              <View key={match._id} className="bg-gray-800/50 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-3">
                    <Avatar avatarId={match.creatorAvatarId} size="sm" />
                    <Text className="text-white font-semibold">{match.creatorName}</Text>
                  </View>
                  <View className="bg-green-500/20 px-3 py-1 rounded-full">
                    <Text className="text-green-500 text-xs">آماده بازی</Text>
            </View>
          </View>
                
                <Text className="text-gray-400 text-sm mb-3">
                  زمان باقی‌مانده: {formatTimeRemaining(match.expiresAt)}
                </Text>
                
                <TouchableOpacity
                  onPress={() => handleJoinMatch(match._id)}
                  className="flex-row items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="play-circle-outline" size={20} color="#fff" />
                  <Text className="text-white font-semibold text-sm">پیوستن به بازی</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Pending Results - User completed, waiting for opponent OR completed */}
        {pendingResultsMatches && pendingResultsMatches.length > 0 && (
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <Text className="text-xl font-semibold text-white mb-4">
              بازی‌های اخیر ({pendingResultsMatches.length})
            </Text>
            
            {pendingResultsMatches.map((match) => (
              <View key={match.matchId} className="bg-gray-800/50 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-3">
                    <Avatar avatarId={match.opponentAvatarId} size="sm" />
                    <Text className="text-white font-semibold">بازی با {match.opponentName}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    match.isCompleted 
                      ? "bg-green-500/20" 
                      : "bg-purple-500/20"
                  }`}>
                    <Text className={`text-xs ${
                      match.isCompleted 
                        ? "text-green-500" 
                        : "text-purple-500"
                    }`}>
                      {match.isCompleted ? "تمام شد" : "منتظر حریف"}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-400 text-sm mb-2">
                  شما: {match.myScore} امتیاز | زمان: {Math.round(match.myTime / 1000)} ثانیه
                </Text>
                
                {!match.isCompleted && (
                  <Text className="text-gray-400 text-sm mb-2">
                    حریف: {match.opponentAnswered} از {match.totalQuestions} سؤال پاسخ داده
                  </Text>
                )}
                
                <Text className="text-gray-400 text-sm mb-3">
                  {match.isCompleted 
                    ? `منقضی می‌شود: ${formatTimeRemaining(match.expiresAt)}`
                    : `زمان باقی‌مانده: ${formatTimeRemaining(match.expiresAt)}`
                  }
                </Text>
                
                {match.isCompleted ? (
                  <TouchableOpacity
                    onPress={() => router.push(`/(tabs)/results/${match.matchId}`)}
                    className="flex-row items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trophy-outline" size={20} color="#fff" />
                    <Text className="text-white font-semibold text-sm">مشاهده نتایج</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="time-outline" size={16} color="#a78bfa" />
                      <Text className="text-purple-400 text-sm flex-1">
                        منتظر باشید تا حریف بازی را تمام کند
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Game Info */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            راهنمای بازی
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <Text className="text-gray-300 flex-1">بازی جدید بساز یا به بازی موجود بپیوند</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
              <Text className="text-gray-300 flex-1">وقتی نفر دوم پیوست، بازی شروع میشه</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <Text className="text-gray-300 flex-1">هر کس به 5 سؤال جواب میده (زمان‌دار)</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">4</Text>
              </View>
              <Text className="text-gray-300 flex-1">بعد از تموم شدن، نتیجه رو ببین (تا 24 ساعت فرصت دارید)</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
