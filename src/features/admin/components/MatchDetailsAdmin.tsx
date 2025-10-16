import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { MatchResults } from "../../game";
import { Button } from "../../../components/ui";
import { Ionicons } from "@expo/vector-icons";

interface MatchDetailsAdminProps {
  matchId: Id<"matches">;
  onBack: () => void;
}

export function MatchDetailsAdmin({ matchId, onBack }: MatchDetailsAdminProps) {
  const matchDetails = useQuery(api.matches.getMatchResultsPartial, { matchId });

  if (!matchDetails) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff701a" />
        <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
      </View>
    );
  }

  const { match, result, participants, isCompleted } = matchDetails;

  // If match is cancelled, show cancelled message
  if (match.status === "cancelled") {
    return (
      <View className="flex-1 bg-background">
        <View className="p-4">
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <View className="items-center">
              <View className="w-16 h-16 bg-red-600/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="close-circle-outline" size={32} color="#ef4444" />
              </View>
              <Text className="text-2xl font-bold text-white mb-4 text-center">
                مسابقه لغو شده
              </Text>
              <Text className="text-gray-300 mb-6 text-center">
                این مسابقه توسط مدیر یا یکی از بازیکنان لغو شده است
              </Text>
              
              <View className="bg-red-600/20 rounded-lg p-4 border border-red-500/30 mb-6 w-full">
                <Text className="text-red-400 text-center">
                  وضعیت: لغو شده در تاریخ {new Date(match.completedAt || match.createdAt).toLocaleDateString('fa-IR')}
                </Text>
              </View>
              
              <View className="bg-gray-800/50 rounded-lg p-4 w-full">
                <Text className="text-white font-semibold mb-3 text-right">شرکت‌کنندگان:</Text>
                <View className="space-y-2">
                  {participants.map((p) => (
                    <View key={p.userId} className="flex-row items-center justify-between">
                      <Text className="text-gray-300">{p.userName}</Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(p.joinedAt).toLocaleDateString('fa-IR')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View className="mt-6 w-full">
                <Button onPress={onBack} variant="secondary" size="lg">
                  بازگشت
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // If match is not completed yet, show waiting message
  if (!isCompleted) {
    return (
      <View className="flex-1 bg-background">
        <View className="p-4">
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
            <View className="items-center">
              <View className="w-16 h-16 bg-yellow-600/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="time-outline" size={32} color="#eab308" />
              </View>
              <Text className="text-2xl font-bold text-white mb-4 text-center">
                مسابقه در حال انجام
              </Text>
              <Text className="text-gray-300 mb-6 text-center">
                این مسابقه هنوز تکمیل نشده است
              </Text>
              
              <View className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/30 mb-6 w-full">
                <Text className="text-yellow-400 text-center">
                  وضعیت: {match.status === "waiting" ? "در انتظار بازیکن" : "در حال انجام"}
                </Text>
              </View>
              
              <View className="bg-gray-800/50 rounded-lg p-4 w-full">
                <Text className="text-white font-semibold mb-3 text-right">شرکت‌کنندگان:</Text>
                <View className="space-y-2">
                  {participants.map((p) => (
                    <View key={p.userId} className="flex-row items-center justify-between">
                      <Text className="text-gray-300">{p.userName}</Text>
                      <Text className="text-gray-400 text-sm">
                        {new Date(p.joinedAt).toLocaleDateString('fa-IR')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View className="mt-6 w-full">
                <Button onPress={onBack} variant="secondary" size="lg">
                  بازگشت
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // If match is completed, show results
  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-600/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle-outline" size={32} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-white mb-2 text-center">
              مسابقه تکمیل شده
            </Text>
            <Text className="text-gray-300 text-center">
              تاریخ: {new Date(match.completedAt || match.createdAt).toLocaleDateString('fa-IR')}
            </Text>
          </View>
          
          <View className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <Text className="text-white font-semibold mb-3 text-right">نتایج:</Text>
            <View className="space-y-3">
              {result && (
                <>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-300">امتیاز بازیکن ۱:</Text>
                    <Text className="text-white font-medium">{result.player1Score}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-300">امتیاز بازیکن ۲:</Text>
                    <Text className="text-white font-medium">{result.player2Score}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-300">زمان بازیکن ۱:</Text>
                    <Text className="text-white font-medium">{Math.floor(result.player1Time / 60)}:{(result.player1Time % 60).toString().padStart(2, '0')}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-300">زمان بازیکن ۲:</Text>
                    <Text className="text-white font-medium">{Math.floor(result.player2Time / 60)}:{(result.player2Time % 60).toString().padStart(2, '0')}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-300">نتیجه:</Text>
                    <Text className={`font-medium ${result.isDraw ? 'text-yellow-400' : 'text-green-400'}`}>
                      {result.isDraw ? 'مساوی' : 'برنده مشخص شد'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
          
          <View className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <Text className="text-white font-semibold mb-3 text-right">شرکت‌کنندگان:</Text>
            <View className="space-y-2">
              {participants.map((p) => (
                <View key={p.userId} className="flex-row items-center justify-between">
                  <Text className="text-gray-300">{p.userName}</Text>
                  <Text className="text-gray-400 text-sm">
                    {new Date(p.joinedAt).toLocaleDateString('fa-IR')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View className="flex-row gap-3">
            <Button onPress={onBack} variant="secondary" size="lg" className="flex-1">
              بازگشت
            </Button>
            <Button 
              onPress={() => {
                // You could add a detailed view here
                console.log("View detailed results");
              }} 
              variant="primary" 
              size="lg" 
              className="flex-1"
            >
              جزئیات بیشتر
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}