import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { api } from "../../../../convex/_generated/api";
import { toast } from "../../../lib/toast";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../components/ui";

interface TournamentLobbyProps {
  onTournamentStart?: (tournamentId: string) => void;
  onTournamentFound?: (tournamentId: string) => void;
}

export function TournamentLobby({ onTournamentStart, onTournamentFound }: TournamentLobbyProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const router = useRouter();
  
  const userProfile = useQuery(api.auth.getUserProfile);
  const waitingTournaments = useQuery(api.tournaments.getWaitingTournaments);
  const myWaitingTournaments = useQuery(api.tournaments.getMyWaitingTournaments);
  const activeTournaments = useQuery(api.tournaments.getUserActiveTournaments);
  const categories = useQuery(api.questionCategories.getCategoriesWithCounts);
  
  const createTournament = useMutation(api.tournaments.createTournament);
  const joinTournament = useMutation(api.tournaments.joinTournament);
  const cancelTournament = useMutation(api.tournaments.cancelTournament);

  // Update current time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateTournament = async () => {
    try {
      setIsCreating(true);
      // Only pass categoryId if selected, otherwise omit it (don't pass null)
      const args: any = {
        isRandom: !selectedCategory,
      };
      if (selectedCategory) {
        args.categoryId = selectedCategory;
      }
      const tournamentId = await createTournament(args);
      toast.success("تورنومنت ایجاد شد! منتظر بازیکنان دیگر باشید");
      setIsCreating(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error creating tournament:", error);
      toast.error("خطا در ایجاد تورنومنت: " + (error as Error).message);
      setIsCreating(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      await joinTournament({ tournamentId });
      toast.success("به تورنومنت پیوستید!");
    } catch (error) {
      console.error("Error joining tournament:", error);
      toast.error("خطا در پیوستن به تورنومنت: " + (error as Error).message);
    }
  };

  const handleCancelTournament = async (tournamentId: string) => {
    try {
      await cancelTournament({ tournamentId });
      toast.success("تورنومنت لغو شد");
    } catch (error) {
      console.error("Error canceling tournament:", error);
      toast.error("خطا در لغو تورنومنت: " + (error as Error).message);
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

  const otherWaitingTournaments = waitingTournaments?.filter(t => !t.isUserCreator) || [];

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
          تورنومنت کویز ۴ نفره
        </Text>
          <Text className="text-gray-300 text-center" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            تورنومنت جدید بساز یا به تورنومنت‌های دیگران بپیوند
          </Text>
        </View>

        {/* Create New Tournament */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            ایجاد تورنومنت جدید
          </Text>
          
          {/* Category Selector */}
          <TouchableOpacity
            onPress={() => setShowCategorySelector(!showCategorySelector)}
            className="bg-gray-800/50 rounded-xl p-4 mb-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">
              {selectedCategory 
                ? categories?.find((c: any) => c._id === selectedCategory)?.persianName 
                : "انتخاب دسته‌بندی (تصادفی)"}
            </Text>
            <Ionicons 
              name={showCategorySelector ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>

          {showCategorySelector && (
            <View className="bg-gray-900/80 rounded-xl p-2 mb-4 max-h-48">
              <ScrollView className="flex-1">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null);
                    setShowCategorySelector(false);
                  }}
                  className={`p-3 rounded-lg mb-2 ${!selectedCategory ? 'bg-accent' : 'bg-gray-800'}`}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold">سوالات تصادفی</Text>
                </TouchableOpacity>
                {categories?.map((category: any) => (
                  <TouchableOpacity
                    key={category._id}
                    onPress={() => {
                      setSelectedCategory(category._id);
                      setShowCategorySelector(false);
                    }}
                    className={`p-3 rounded-lg mb-2 ${selectedCategory === category._id ? 'bg-accent' : 'bg-gray-800'}`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold">{category.persianName}</Text>
                    <Text className="text-gray-400 text-xs">{category.questionCount} سوال</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <TouchableOpacity
            onPress={handleCreateTournament}
            disabled={isCreating}
            className="flex-row items-center justify-center gap-3 px-6 py-4 bg-accent rounded-xl disabled:opacity-50"
            activeOpacity={0.7}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
            <Ionicons name="trophy-outline" size={24} color="#fff" />
            )}
            <Text className="text-white font-semibold">ساخت تورنومنت جدید</Text>
          </TouchableOpacity>
          
          <Text className="text-gray-400 text-sm mt-3 text-center">
            تورنومنت ایجاد می‌شود و 24 ساعت منتظر 3 بازیکن دیگر می‌ماند
          </Text>
        </View>

        {/* Active Tournaments - User is in */}
        {activeTournaments && activeTournaments.length > 0 && (
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <Text className="text-xl font-semibold text-white mb-4">
              تورنومنت‌های فعال ({activeTournaments.length})
            </Text>
            
            {activeTournaments.map((tournament) => (
              <TouchableOpacity
                key={tournament.tournamentId}
                onPress={() => router.push(`/tournament/${tournament.tournamentId}`)}
                activeOpacity={0.7}
                className="bg-gray-800/50 rounded-lg p-4 mb-3"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-semibold">تورنومنت شما</Text>
                  <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                    <Text className="text-blue-500 text-xs">در حال انجام</Text>
                  </View>
                </View>
                
                <Text className="text-gray-400 text-sm mb-2">
                  شرکت‌کنندگان: {tournament.participantsCount} / {tournament.maxParticipants}
                </Text>
                
                <Text className="text-gray-400 text-sm mb-3">
                  وضعیت: {tournament.status === "waiting" ? "منتظر بازیکنان" : "در حال بازی"}
                </Text>
                
                <TouchableOpacity
                  onPress={() => router.push(`/tournament/${tournament.tournamentId}`)}
                  className="flex-row items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg mt-2"
                >
                  <Ionicons name="eye-outline" size={18} color="#fff" />
                  <Text className="text-white font-semibold text-sm">مشاهده جزئیات</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Waiting Tournaments */}
        {myWaitingTournaments && myWaitingTournaments.length > 0 && (
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <Text className="text-xl font-semibold text-white mb-4">
              تورنومنت‌های من ({myWaitingTournaments.length})
            </Text>
            
            {myWaitingTournaments.map((tournament) => (
              <View key={tournament.tournamentId} className="bg-gray-800/50 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-semibold">تورنومنت شما</Text>
                  <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Text className="text-yellow-500 text-xs">در انتظار</Text>
                  </View>
                </View>
                
                <Text className="text-gray-400 text-sm mb-3">
                  شرکت‌کنندگان: {tournament.participantCount} / 4
                </Text>
                
                <TouchableOpacity
                  onPress={() => handleCancelTournament(tournament.tournamentId)}
                  className="flex-row items-center justify-center gap-2 px-4 py-2 bg-red-600 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#fff" />
                  <Text className="text-white font-semibold text-sm">لغو تورنومنت</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Available Tournaments to Join */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            تورنومنت‌های در انتظار ({otherWaitingTournaments.length})
          </Text>
          
          {otherWaitingTournaments.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="trophy-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 mt-4 text-center">
                فعلاً تورنومنت در انتظاری وجود ندارد{'\n'}اولین نفری باش که تورنومنت می‌سازه!
              </Text>
            </View>
          ) : (
            otherWaitingTournaments.map((tournament) => (
              <View key={tournament.tournamentId} className="bg-gray-800/50 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-3">
                    <Avatar avatarId={tournament.creatorAvatarId} size="sm" />
                    <Text className="text-white font-semibold">تورنومنت {tournament.creatorName}</Text>
                  </View>
                  <View className="bg-green-500/20 px-3 py-1 rounded-full">
                    <Text className="text-green-500 text-xs">آماده پیوستن</Text>
            </View>
          </View>
                
                <Text className="text-gray-400 text-sm mb-2">
                  شرکت‌کنندگان: {tournament.participantCount} / 4
                </Text>
                
                <Text className="text-gray-400 text-sm mb-3">
                  زمان باقی‌مانده: {formatTimeRemaining(tournament.expiresAt)}
                </Text>
                
                <TouchableOpacity
                  onPress={() => handleJoinTournament(tournament.tournamentId)}
                  className="flex-row items-center justify-center gap-2 px-4 py-2 bg-accent rounded-lg"
                  activeOpacity={0.7}
                >
                  <Ionicons name="trophy-outline" size={20} color="#fff" />
                  <Text className="text-white font-semibold text-sm">پیوستن به تورنومنت</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Tournament Info */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            راهنمای تورنومنت
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <Text className="text-gray-300 flex-1">تورنومنت جدید بساز یا به تورنومنت موجود بپیوند</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
              <Text className="text-gray-300 flex-1">وقتی 4 بازیکن پیوستند، تورنومنت شروع میشه</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <Text className="text-gray-300 flex-1">دو بازی نیمه‌نهایی همزمان برگزار میشه</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mt-1">
                <Text className="text-white text-xs font-bold">4</Text>
              </View>
              <Text className="text-gray-300 flex-1">برندگان به فینال میرن و قهرمان مشخص میشه</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
