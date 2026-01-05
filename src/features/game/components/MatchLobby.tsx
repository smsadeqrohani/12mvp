import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Share } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "../../../lib/toast";
import { getCleanErrorMessage, copyToClipboard } from "../../../lib/helpers";
import { generateMatchJoinLink } from "../../../lib/referral";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Modal, TextInput } from "../../../components/ui";

interface MatchLobbyProps {
  onMatchStart?: (matchId: Id<"matches">) => void;
  onMatchFound?: (matchId: Id<"matches">) => void;
}

export function MatchLobby({ onMatchStart, onMatchFound }: MatchLobbyProps) {
  const { joinCode: urlJoinCode } = useLocalSearchParams<{ joinCode?: string }>();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPrivate, setIsCreatingPrivate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [privateMatchJoinCode, setPrivateMatchJoinCode] = useState<string | null>(null);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [debouncedJoinCode, setDebouncedJoinCode] = useState("");
  const [isJoiningByCode, setIsJoiningByCode] = useState(false);
  const router = useRouter();
  
  // Handle URL join code - open join dialog if code is in URL
  useEffect(() => {
    if (urlJoinCode && urlJoinCode.length === 6) {
      setJoinCodeInput(urlJoinCode.toUpperCase());
      setShowJoinByCodeModal(true);
    }
  }, [urlJoinCode]);
  
  const userProfile = useQuery(api.auth.getUserProfile);
  const waitingMatches = useQuery(api.matches.getWaitingMatches);
  const myWaitingMatches = useQuery(api.matches.getMyWaitingMatches);
  const activeMatches = useQuery(api.matches.getUserActiveMatches);
  const pendingResultsMatches = useQuery(api.matches.getUserPendingResultsMatches);
  
  // Debounce join code input - only query when user stops typing for 500ms
  useEffect(() => {
    if (joinCodeInput.length !== 6) {
      setDebouncedJoinCode("");
      return;
    }
    
    const timer = setTimeout(() => {
      setDebouncedJoinCode(joinCodeInput.toUpperCase());
    }, 500);
    
    return () => clearTimeout(timer);
  }, [joinCodeInput]);
  
  // Only query when we have a valid 6-character debounced code
  const matchByJoinCode = useQuery(
    api.matches.getMatchByJoinCode,
    debouncedJoinCode.length === 6 ? { joinCode: debouncedJoinCode } : "skip"
  );
  
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
      const result = await createMatch({ isPrivate: false });
      toast.success("بازی ایجاد شد! منتظر نفر دوم باشید");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error(getCleanErrorMessage(error));
      setIsCreating(false);
    }
  };

  const handleCreatePrivateMatch = async () => {
    try {
      setIsCreatingPrivate(true);
      const result = await createMatch({ isPrivate: true });
      setPrivateMatchJoinCode(result.joinCode || null);
      setShowJoinCodeModal(true);
      setIsCreatingPrivate(false);
    } catch (error) {
      console.error("Error creating private match:", error);
      toast.error(getCleanErrorMessage(error));
      setIsCreatingPrivate(false);
    }
  };

  const handleCopyJoinCode = async () => {
    if (privateMatchJoinCode) {
      const copied = await copyToClipboard(privateMatchJoinCode);
      if (copied) {
        toast.success("کد کپی شد!");
      } else {
        toast.error("خطا در کپی کردن کد");
      }
    }
  };

  const handleShareMatchCode = async (joinCode: string) => {
    try {
      const joinLink = generateMatchJoinLink(joinCode);
      await Share.share({
        message: `کد بازی: ${joinCode}\n\nلینک پیوستن: ${joinLink}\n\nبرای پیوستن به بازی این کد را در اپلیکیشن وارد کنید یا روی لینک کلیک کنید.`,
        title: "کد بازی",
        url: joinLink, // For platforms that support URL sharing
      });
    } catch (error) {
      console.error("Error sharing match code:", error);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCodeInput || joinCodeInput.length !== 6) {
      toast.error("لطفاً کد 6 رقمی را وارد کنید");
      return;
    }

    const code = joinCodeInput.toUpperCase();
    
    try {
      setIsJoiningByCode(true);
      const matchId = await joinMatch({ joinCode: code });
      toast.success("به بازی پیوستید!");
      setShowJoinByCodeModal(false);
      setJoinCodeInput("");
      router.push(`/(tabs)/play?matchId=${matchId}`);
    } catch (error) {
      console.error("Error joining match by code:", error);
      toast.error(getCleanErrorMessage(error));
      setIsJoiningByCode(false);
    }
  };

  const handleJoinMatch = async (matchId: Id<"matches">) => {
    try {
      await joinMatch({ matchId });
      toast.success("به بازی پیوستید!");
      router.push(`/(tabs)/play?matchId=${matchId}`);
    } catch (error) {
      console.error("Error joining match:", error);
      toast.error(getCleanErrorMessage(error));
    }
  };

  const handleCancelMatch = async (matchId: Id<"matches">) => {
    try {
      await cancelMatch({ matchId });
      toast.success("بازی لغو شد");
    } catch (error) {
      console.error("Error canceling match:", error);
      toast.error(getCleanErrorMessage(error));
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
          
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              onPress={handleCreateMatch}
              disabled={isCreating || isCreatingPrivate}
              className="flex-1 flex-row items-center justify-center gap-2 px-4 py-4 bg-accent rounded-xl disabled:opacity-50"
              activeOpacity={0.7}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="globe-outline" size={20} color="#fff" />
              )}
              <Text className="text-white font-semibold text-sm">عمومی</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCreatePrivateMatch}
              disabled={isCreating || isCreatingPrivate}
              className="flex-1 flex-row items-center justify-center gap-2 px-4 py-4 bg-purple-600 rounded-xl disabled:opacity-50"
              activeOpacity={0.7}
            >
              {isCreatingPrivate ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              )}
              <Text className="text-white font-semibold text-sm">خصوصی</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-400 text-sm mb-3 text-center">
            بازی عمومی: برای همه قابل مشاهده است
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            بازی خصوصی: فقط با کد قابل پیوستن است
          </Text>

          {/* Join by Code Button */}
          <TouchableOpacity
            onPress={() => setShowJoinByCodeModal(true)}
            className="mt-4 flex-row items-center justify-center gap-2 px-4 py-3 bg-blue-600 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="key-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold text-sm">پیوستن با کد</Text>
          </TouchableOpacity>
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
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white font-semibold">بازی شما</Text>
                    {match.isPrivate ? (
                      <View className="bg-purple-500/20 px-2 py-1 rounded-full">
                        <Text className="text-purple-400 text-xs">خصوصی</Text>
                      </View>
                    ) : (
                      <View className="bg-blue-500/20 px-2 py-1 rounded-full">
                        <Text className="text-blue-400 text-xs">عمومی</Text>
                      </View>
                    )}
                  </View>
                  <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Text className="text-yellow-500 text-xs">در انتظار</Text>
                  </View>
                </View>
                
                {match.isPrivate && match.joinCode && (
                  <View className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 mb-3">
                    <Text className="text-gray-400 text-xs mb-1">کد بازی:</Text>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white text-lg font-bold tracking-widest" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                        {match.joinCode}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={async () => {
                          const copied = await copyToClipboard(match.joinCode!);
                          if (copied) {
                            toast.success("کد کپی شد!");
                          } else {
                            toast.error("خطا در کپی کردن کد");
                          }
                        }}
                        className="flex-1 bg-purple-600 px-3 py-2 rounded-lg"
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center justify-center gap-1">
                          <Ionicons name="copy-outline" size={16} color="#fff" />
                          <Text className="text-white text-xs font-semibold">کپی</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleShareMatchCode(match.joinCode!)}
                        className="flex-1 bg-blue-600 px-3 py-2 rounded-lg"
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center justify-center gap-1">
                          <Ionicons name="share-outline" size={16} color="#fff" />
                          <Text className="text-white text-xs font-semibold">اشتراک</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
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

      {/* Join Code Modal */}
      <Modal
        isOpen={showJoinCodeModal}
        onClose={() => {
          setShowJoinCodeModal(false);
          setPrivateMatchJoinCode(null);
        }}
        title="بازی خصوصی ایجاد شد"
        description="کد زیر را با دوست خود به اشتراک بگذارید"
        icon={<Ionicons name="lock-closed-outline" size={24} color="#ff701a" />}
      >
        <View className="space-y-4">
          <View className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <Text className="text-gray-400 text-sm mb-2 text-center">کد بازی</Text>
            <Text className="text-white text-3xl font-bold text-center tracking-widest" style={{ fontFamily: 'Vazirmatn-Bold' }}>
              {privateMatchJoinCode}
            </Text>
          </View>
          
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleCopyJoinCode}
              className="flex-1 flex-row items-center justify-center gap-2 px-4 py-3 bg-accent rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold">کپی</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => privateMatchJoinCode && handleShareMatchCode(privateMatchJoinCode)}
              className="flex-1 flex-row items-center justify-center gap-2 px-4 py-3 bg-blue-600 rounded-lg"
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold">اشتراک</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-400 text-sm text-center">
            این کد را به دوست خود بدهید تا به بازی بپیوندد
          </Text>
        </View>
      </Modal>

      {/* Join By Code Modal */}
      <Modal
        isOpen={showJoinByCodeModal}
        onClose={() => {
          setShowJoinByCodeModal(false);
          setJoinCodeInput("");
        }}
        title="پیوستن با کد"
        description="کد 6 رقمی بازی را وارد کنید"
        icon={<Ionicons name="key-outline" size={24} color="#ff701a" />}
      >
        <View className="space-y-4">
          <View>
            <Text className="text-gray-300 mb-2 font-medium">کد بازی</Text>
            <TextInput
              placeholder="کد 6 رقمی"
              placeholderTextColor="#6b7280"
              value={joinCodeInput}
              onChangeText={(text) => {
                // Only allow alphanumeric, uppercase, max 6 characters
                const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
                setJoinCodeInput(cleaned);
              }}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-bold"
              style={{ fontFamily: 'Vazirmatn-Bold' }}
            />
          </View>

          {joinCodeInput.length === 6 && debouncedJoinCode.length === 6 && matchByJoinCode && (
            <View className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="information-circle-outline" size={20} color="#60a5fa" />
                <Text className="text-blue-400 font-semibold">بازی پیدا شد</Text>
              </View>
              <Text className="text-blue-300 text-sm">
                سازنده: {matchByJoinCode.creatorName}
              </Text>
              {matchByJoinCode.isAlreadyParticipant && (
                <Text className="text-yellow-400 text-sm mt-1">
                  شما قبلاً در این بازی عضو هستید
                </Text>
              )}
            </View>
          )}

          {joinCodeInput.length === 6 && debouncedJoinCode.length === 6 && matchByJoinCode === null && (
            <View className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle-outline" size={20} color="#f87171" />
                <Text className="text-red-400 text-sm">
                  بازی با این کد یافت نشد
                </Text>
              </View>
            </View>
          )}

          {joinCodeInput.length === 6 && debouncedJoinCode.length === 0 && (
            <View className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-3">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#9ca3af" />
                <Text className="text-gray-400 text-sm">
                  در حال جستجو...
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleJoinByCode}
            disabled={isJoiningByCode || joinCodeInput.length !== 6 || debouncedJoinCode.length !== 6 || !matchByJoinCode || (matchByJoinCode?.isAlreadyParticipant ?? false)}
            className="flex-row items-center justify-center gap-2 px-4 py-3 bg-accent rounded-lg disabled:opacity-50"
            activeOpacity={0.7}
          >
            {isJoiningByCode ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={20} color="#fff" />
                <Text className="text-white font-semibold">پیوستن به بازی</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
