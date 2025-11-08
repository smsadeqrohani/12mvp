import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, Avatar } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";

interface TournamentDetailsAdminProps {
  tournamentId: string;
  onBack: () => void;
}

export function TournamentDetailsAdmin({ tournamentId, onBack }: TournamentDetailsAdminProps) {
  const tournamentDetails = useQuery(api.tournamentAdmin.getTournamentDetailsAdmin, { tournamentId });

  if (!tournamentDetails) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff701a" />
        <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
      </View>
    );
  }

  const { tournament, creator, participants, matches } = tournamentDetails;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-600/20 border border-yellow-500/30";
      case "active":
        return "bg-green-600/20 border border-green-500/30";
      case "completed":
        return "bg-blue-600/20 border border-blue-500/30";
      case "cancelled":
        return "bg-red-600/20 border border-red-500/30";
      default:
        return "bg-gray-600/20 border border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "در انتظار";
      case "active":
        return "فعال";
      case "completed":
        return "تمام شده";
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
        return "نامشخص";
    }
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-purple-600/20 rounded-full items-center justify-center">
              <Ionicons name="trophy" size={24} color="#a78bfa" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-white" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                جزئیات تورنومنت
              </Text>
              <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                {tournamentId.slice(-12)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tournament Info */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 mb-4">
          <Text className="text-xl font-bold text-white mb-4 text-right" style={{ fontFamily: 'Vazirmatn-Bold' }}>
            اطلاعات تورنومنت
          </Text>

          {/* Status */}
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-700/30">
            <Text className="text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              وضعیت
            </Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(tournament.status)}`}>
              <Text className={`text-sm font-semibold`} style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                {getStatusText(tournament.status)}
              </Text>
            </View>
          </View>

          {/* Creator */}
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-700/30">
            <Text className="text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              سازنده
            </Text>
            <View className="flex-row items-center gap-2">
              <Avatar avatarId={creator?.avatarId} size="sm" highlighted />
              <Text className="text-white" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                {creator?.name || "ناشناس"}
              </Text>
            </View>
          </View>

          {/* Participants Count */}
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-700/30">
            <Text className="text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              شرکت‌کنندگان
            </Text>
            <Text className="text-white font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
              {participants.length} / 4
            </Text>
          </View>

          {/* Created Date */}
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              تاریخ ایجاد
            </Text>
            <Text className="text-white" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              {new Date(tournament.createdAt).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Participants */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 mb-4">
          <Text className="text-xl font-bold text-white mb-4 text-right" style={{ fontFamily: 'Vazirmatn-Bold' }}>
            شرکت‌کنندگان
          </Text>
          <View className="space-y-3">
            {participants.map((p, index) => (
              <View
                key={p.userId}
                className="flex-row items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center">
                    <Text className="text-accent font-bold text-sm" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Avatar avatarId={p.profile?.avatarId} size="sm" />
                  <Text className="text-white font-medium" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                    {p.profile?.name || "ناشناس"}
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                  {new Date(p.joinedAt).toLocaleDateString('fa-IR')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Matches */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 mb-4">
          <Text className="text-xl font-bold text-white mb-4 text-right" style={{ fontFamily: 'Vazirmatn-Bold' }}>
            مسابقات ({matches.length})
          </Text>
          {matches.length > 0 ? (
            <View className="space-y-4">
              {matches.map((tm: any) => (
                <View key={tm.matchId} className="bg-gray-800/50 rounded-lg p-4">
                  {/* Round */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="w-8 h-8 bg-purple-600/20 rounded-lg items-center justify-center">
                        <Ionicons name="trophy" size={16} color="#a78bfa" />
                      </View>
                      <Text className="text-purple-400 font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                        {getRoundText(tm.round)}
                      </Text>
                    </View>
                    {tm.match && (
                      <View className={`px-2 py-1 rounded-full ${
                        tm.match.status === "completed" 
                          ? "bg-green-600/20 border border-green-500/30"
                          : tm.match.status === "active"
                          ? "bg-blue-600/20 border border-blue-500/30"
                          : "bg-yellow-600/20 border border-yellow-500/30"
                      }`}>
                        <Text className="text-xs" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                          {tm.match.status === "completed" ? "تکمیل شده" : tm.match.status === "active" ? "فعال" : "منتظر"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Players */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                    <Avatar avatarId={tm.player1Profile?.avatarId} size="sm" />
                        <Text className="text-white text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                          {tm.player1Profile?.name || "ناشناس"}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-400 text-sm">VS</Text>
                    <View className="flex-1 flex-row-reverse">
                      <View className="flex-row items-center gap-2">
                    <Avatar avatarId={tm.player2Profile?.avatarId} size="sm" />
                        <Text className="text-white text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                          {tm.player2Profile?.name || "ناشناس"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Result */}
                  {tm.result && (
                    <View className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
                      {tm.result.isDraw ? (
                        <Text className="text-yellow-400 text-center font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                          مساوی {tm.result.player1Score} - {tm.result.player2Score}
                        </Text>
                      ) : (
                        <Text className="text-green-400 text-center font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
                          برنده: {tm.result.winnerId === tm.player1Id ? tm.player1Profile?.name : tm.player2Profile?.name}
                          {" "}
                          ({tm.result.player1Score} - {tm.result.player2Score})
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="trophy-outline" size={48} color="#6b7280" />
              <Text className="text-gray-500 mt-4" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                هنوز مسابقه‌ای شروع نشده است
              </Text>
            </View>
          )}
        </View>

        {/* Back Button */}
        <View className="mt-4">
          <Button onPress={onBack} variant="secondary" size="lg">
            بازگشت
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

