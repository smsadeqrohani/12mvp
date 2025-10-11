import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "../../../lib/toast";
import { Ionicons } from "@expo/vector-icons";

interface MatchLobbyProps {
  onMatchStart: (matchId: Id<"matches">) => void;
  onMatchFound: (matchId: Id<"matches">) => void;
  isResetting?: boolean;
}

export function MatchLobby({ onMatchStart, onMatchFound, isResetting }: MatchLobbyProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [currentMatchId, setCurrentMatchId] = useState<Id<"matches"> | null>(null);
  
  const userProfile = useQuery(api.auth.getUserProfile);
  const userMatchStatus = useQuery(api.matches.getUserActiveMatchStatus);
  const createMatch = useMutation(api.matches.createMatch);
  const leaveMatch = useMutation(api.matches.leaveMatch);

  // Monitor match status in real-time
  useEffect(() => {
    if (!userMatchStatus || !isSearching) return;
    
    console.log("MatchLobby: Match status changed:", userMatchStatus.status);
    
    if (userMatchStatus.status === "active") {
      console.log("MatchLobby: Match is now active, calling onMatchStart");
      setIsSearching(false);
      onMatchStart(userMatchStatus.matchId);
    } else if (userMatchStatus.status === "waiting") {
      console.log("MatchLobby: Match is waiting for opponent");
      // Keep showing searching state
    } else if (userMatchStatus.status === "cancelled") {
      console.log("MatchLobby: Match was cancelled");
      setIsSearching(false);
      setCurrentMatchId(null);
      toast.info("مسابقه لغو شد");
    }
  }, [userMatchStatus?.status, userMatchStatus?.matchId, isSearching, onMatchStart]);

  // Reset searching state when component is resetting
  useEffect(() => {
    if (isResetting) {
      setIsSearching(false);
      setCurrentMatchId(null);
    }
  }, [isResetting]);

  const handleCreateMatch = async () => {
    try {
      setIsSearching(true);
      toast.success("در حال جستجو برای حریف...");
      
      console.log("MatchLobby: Creating match...");
      const matchId = await createMatch();
      console.log("MatchLobby: Match created/joined with ID:", matchId);
      
      setCurrentMatchId(matchId);
      
      // Check if match is immediately active (found opponent)
      if (userMatchStatus?.status === "active") {
        console.log("MatchLobby: Match is immediately active");
        setIsSearching(false);
        onMatchStart(matchId);
      }
      
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("خطا در ایجاد مسابقه: " + (error as Error).message);
      setIsSearching(false);
    }
  };

  // handleJoinMatch removed - createMatch now handles both creation and joining automatically

  const handleLeaveMatch = async (matchId: Id<"matches">) => {
    try {
      await leaveMatch({ matchId });
      toast.success("از مسابقه خارج شدید");
      setIsSearching(false);
    } catch (error) {
      toast.error("خطا در خروج از مسابقه: " + (error as Error).message);
    }
  };

  const handleCancelSearch = async () => {
    try {
      // Cancel search and leave the match if one exists
      if (currentMatchId) {
        await leaveMatch({ matchId: currentMatchId });
      }
      setIsSearching(false);
      setCurrentMatchId(null);
      toast.success("جستجو لغو شد");
    } catch (error) {
      toast.error("خطا در لغو جستجو: " + (error as Error).message);
      setIsSearching(false);
      setCurrentMatchId(null);
    }
  };

  if (!userProfile) {
    return (
      <View className="flex justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  return (
    <View className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <View className="items-center">
        <Text className="text-3xl font-bold text-accent mb-2">
          مسابقه کویز دو نفره
        </Text>
        <Text className="text-gray-300">
          با حریفان مختلف مسابقه دهید و مهارت‌های خود را محک بزنید
        </Text>
      </View>

      {/* Main Content */}
      <View className="space-y-4">
        {/* Match Info */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            اطلاعات مسابقه
          </Text>
          
          <View className="space-y-2">
            <Text className="text-gray-300">• با کلیک روی "شروع مسابقه" مسابقه ایجاد می‌شود</Text>
            <Text className="text-gray-300">• اگر مسابقه‌ای در انتظار باشد، به آن می‌پیوندید</Text>
            <Text className="text-gray-300">• هر سؤال زمان مخصوص خودش را دارد</Text>
            <Text className="text-gray-300">• زمان هر سؤال در پایین سؤال نمایش داده می‌شود</Text>
            <Text className="text-gray-300">• 5 سؤال تصادفی از بانک سؤالات انتخاب می‌شود</Text>
          </View>
        </View>

        {/* Match Actions */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            شروع مسابقه
          </Text>
          
          <TouchableOpacity
            onPress={handleCreateMatch}
            disabled={isSearching}
            className="flex-row items-center justify-center gap-3 px-6 py-4 bg-accent rounded-xl disabled:opacity-50"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text className="text-white font-semibold">شروع مسابقه</Text>
          </TouchableOpacity>
        </View>

        {/* Match Stats */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            آمار مسابقه
          </Text>
          
          <View className="flex-row gap-4">
            <View className="flex-1 bg-gray-800/50 rounded-lg p-4 items-center">
              <Text className="text-2xl font-bold text-accent mb-1">5</Text>
              <Text className="text-gray-300 text-sm">تعداد سؤالات</Text>
            </View>
            
            <View className="flex-1 bg-gray-800/50 rounded-lg p-4 items-center">
              <Text className="text-2xl font-bold text-accent mb-1">2</Text>
              <Text className="text-gray-300 text-sm">تعداد بازیکنان</Text>
            </View>
          </View>
        </View>

        {/* How to Play */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-4">
            نحوه بازی
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                <Text className="text-white text-sm font-bold">1</Text>
              </View>
              <Text className="text-gray-300 flex-1">روی "شروع مسابقه" کلیک کنید</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                <Text className="text-white text-sm font-bold">2</Text>
              </View>
              <Text className="text-gray-300 flex-1">اگر مسابقه‌ای در انتظار باشد، به آن می‌پیوندید</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                <Text className="text-white text-sm font-bold">3</Text>
              </View>
              <Text className="text-gray-300 flex-1">به 5 سؤال تصادفی پاسخ دهید</Text>
            </View>
            
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                <Text className="text-white text-sm font-bold">4</Text>
              </View>
              <Text className="text-gray-300 flex-1">نتایج را با حریف خود مقایسه کنید</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Loading State */}
      <Modal
        visible={isSearching}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-background-light rounded-2xl p-8 items-center max-w-md mx-4">
            <ActivityIndicator size="large" color="#ff701a" className="mb-4" />
            <Text className="text-xl font-semibold text-white mb-2">
              در حال جستجو...
            </Text>
            <Text className="text-gray-300 mb-4 text-center">
              منتظر حریف باشید یا در حال پیوستن به مسابقه...
            </Text>
            <TouchableOpacity
              onPress={handleCancelSearch}
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              <Text className="text-white">لغو</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
