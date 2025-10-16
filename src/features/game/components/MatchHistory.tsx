import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PaginationControls } from "../../../components/ui";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface MatchHistoryProps {
  onViewMatch: (matchId: string) => void;
}

export function MatchHistory({ onViewMatch }: MatchHistoryProps) {
  // Pagination state - track cursor history for back navigation
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyCursorHistory, setHistoryCursorHistory] = useState<(string | null)[]>([null]);
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 10;

  // Check authentication first
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  // Query match history (will return null if user not authenticated)
  const matchHistoryResult = useQuery(
    api.matches.getUserMatchHistory, 
    loggedInUser ? {
      paginationOpts: { numItems: PAGE_SIZE, cursor: historyCursor },
    } : "skip"
  );

  const matchHistory = matchHistoryResult?.page || [];

  // Show loading while checking authentication or loading data
  if (loggedInUser === undefined || (loggedInUser && !matchHistoryResult)) {
    return (
      <View className="flex justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  // Show error if not authenticated
  if (loggedInUser === null) {
    return (
      <View className="max-w-2xl mx-auto items-center py-16">
        <View className="w-24 h-24 bg-red-600/20 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        </View>
        <Text className="text-2xl font-bold text-red-400 mb-4">
          خطا در احراز هویت
        </Text>
        <Text className="text-gray-400 mb-6 text-center">
          لطفاً دوباره وارد شوید
        </Text>
      </View>
    );
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracy = (participant: any) => {
    if (!participant.answers) return 0;
    const correct = participant.answers.filter((a: any) => a.isCorrect).length;
    return Math.round((correct / participant.answers.length) * 100);
  };

  // Pagination handlers
  const handleNextHistory = () => {
    if (matchHistoryResult && !matchHistoryResult.isDone) {
      const newCursor = matchHistoryResult.continueCursor;
      setHistoryCursorHistory(prev => [...prev, newCursor]);
      setHistoryCursor(newCursor);
      setHistoryPage(prev => prev + 1);
    }
  };

  const handlePrevHistory = () => {
    if (historyPage > 1) {
      const newHistory = historyCursorHistory.slice(0, -1);
      setHistoryCursorHistory(newHistory);
      setHistoryCursor(newHistory[newHistory.length - 1]);
      setHistoryPage(prev => prev - 1);
    }
  };

  if (!matchHistoryResult) {
    return (
      <View className="flex justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  if (matchHistory.length === 0) {
    return (
      <View className="max-w-2xl mx-auto items-center py-16">
        <View className="w-24 h-24 bg-gray-700/50 rounded-full items-center justify-center mb-6">
          <Ionicons name="clipboard-outline" size={48} color="#6b7280" />
        </View>
        <Text className="text-2xl font-bold text-white mb-4">
          تاریخچه مسابقات خالی است
        </Text>
        <Text className="text-gray-400 mb-6 text-center">
          هنوز هیچ مسابقه‌ای انجام نداده‌اید. اولین مسابقه خود را شروع کنید!
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full px-6 py-8 space-y-6">
      {/* Header */}
      <View className="items-center">
        <Text className="text-3xl font-bold text-accent mb-2">
          تاریخچه مسابقات
        </Text>
        <Text className="text-gray-300">
          {matchHistory.length} مسابقه انجام شده
        </Text>
      </View>

      {/* Statistics - Current Page Only */}
      <View className="flex-row flex-wrap gap-4">
        <View className="flex-1 min-w-[120px] bg-background-light/60 rounded-xl border border-gray-700/30 p-4 items-center">
          <Text className="text-2xl font-bold text-accent mb-1">
            {matchHistory.filter(m => m.isWinner).length}
          </Text>
          <Text className="text-gray-300 text-sm">برد (این صفحه)</Text>
        </View>
        
        <View className="flex-1 min-w-[120px] bg-background-light/60 rounded-xl border border-gray-700/30 p-4 items-center">
          <Text className="text-2xl font-bold text-red-400 mb-1">
            {matchHistory.filter(m => !m.isWinner && !m.isDraw).length}
          </Text>
          <Text className="text-gray-300 text-sm">باخت (این صفحه)</Text>
        </View>
        
        <View className="flex-1 min-w-[120px] bg-background-light/60 rounded-xl border border-gray-700/30 p-4 items-center">
          <Text className="text-2xl font-bold text-yellow-400 mb-1">
            {matchHistory.filter(m => m.isDraw).length}
          </Text>
          <Text className="text-gray-300 text-sm">مساوی (این صفحه)</Text>
        </View>
        
        <View className="flex-1 min-w-[120px] bg-background-light/60 rounded-xl border border-gray-700/30 p-4 items-center">
          <Text className="text-2xl font-bold text-gray-400 mb-1">
            {historyPage}
          </Text>
          <Text className="text-gray-300 text-sm">صفحه فعلی</Text>
        </View>
      </View>

      {/* Match List */}
      <View className="bg-background-light/80 rounded-2xl border border-gray-700/30">
        <View className="p-6">
          <FlatList
            data={matchHistory}
            keyExtractor={(item) => item.match._id}
            renderItem={({ item: matchData, index }) => {
              const { match, result, participant, opponent, isWinner, isDraw } = matchData;
              
              return (
                <TouchableOpacity 
                  onPress={() => onViewMatch(match._id)}
                  className="bg-background-light/60 rounded-xl border border-gray-700/30 p-6 mb-4 active:bg-background-light/80"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                      {/* Match Number */}
                      <View className="w-12 h-12 bg-gray-700/50 rounded-full items-center justify-center">
                        <Text className="text-white font-bold text-lg">
                          {(historyPage - 1) * PAGE_SIZE + index + 1}
                        </Text>
                      </View>
                    
                      {/* Match Info */}
                      <View className="flex-1">
                        <View className="flex-row items-center gap-3 mb-2">
                          <Text className="text-lg font-semibold text-white">
                            مسابقه با {opponent?.name || "بازیکن ناشناس"}
                          </Text>
                          
                          {/* Result Badge */}
                          <View className={`px-3 py-1 rounded-full border ${
                            isDraw
                              ? "bg-yellow-600/20 border-yellow-500/30"
                              : isWinner
                              ? "bg-green-600/20 border-green-500/30"
                              : "bg-red-600/20 border-red-500/30"
                          }`}>
                            <Text className={`text-sm font-semibold ${
                              isDraw ? "text-yellow-400" : isWinner ? "text-green-400" : "text-red-400"
                            }`}>
                              {isDraw ? "مساوی" : isWinner ? "برد" : "باخت"}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="flex-row items-center gap-4">
                          <Text className="text-sm text-gray-400">
                            {new Date(match.completedAt!).toLocaleDateString('fa-IR')}
                          </Text>
                          <Text className="text-sm text-gray-400">
                            {new Date(match.completedAt!).toLocaleTimeString('fa-IR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* View Button */}
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </View>
                  
                  {/* Score Comparison */}
                  <View className="mt-4">
                    <View className="flex-row items-center gap-4 mb-2">
                      <View className="items-center">
                        <Text className="text-xl font-bold text-accent">
                          {participant.totalScore}
                        </Text>
                        <Text className="text-xs text-gray-400">شما</Text>
                      </View>
                      
                      <Text className="text-gray-500 text-lg">-</Text>
                      
                      <View className="items-center">
                        <Text className="text-xl font-bold text-gray-400">
                          {result.player1Id === participant.userId ? result.player2Score : result.player1Score}
                        </Text>
                        <Text className="text-xs text-gray-400">حریف</Text>
                      </View>
                    </View>
                    
                    <Text className="text-xs text-gray-500">
                      دقت: {getAccuracy(participant)}% | 
                      زمان: {formatTime(participant.totalTime || 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Pagination Controls */}
        <PaginationControls 
          currentPage={historyPage}
          isDone={matchHistoryResult?.isDone ?? true}
          onNext={handleNextHistory}
          onPrev={handlePrevHistory}
        />
      </View>
    </View>
  );
}
