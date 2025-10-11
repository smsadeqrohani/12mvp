import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";

interface MatchResultsProps {
  matchId: Id<"matches">;
  onPlayAgain: () => void;
}

export function MatchResults({ matchId, onPlayAgain }: MatchResultsProps) {
  const matchResults = useQuery(api.matches.getMatchResultsPartial, { matchId });
  const userProfile = useQuery(api.auth.getUserProfile);

  if (!matchResults || !userProfile) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
      </View>
    );
  }

  // Show waiting message if match is not completed yet or result is not available
  if (!matchResults.isCompleted || !matchResults.result) {
    return (
      <View className="w-full px-6 py-8">
        <View className="max-w-2xl mx-auto">
          <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-8 items-center">
            <ActivityIndicator size="large" color="#ff701a" className="mb-6" />
            <Text className="text-2xl font-bold text-white mb-4">
              منتظر سایر بازیکنان...
            </Text>
            <Text className="text-gray-300 mb-6 text-center">
              شما تمام سؤالات را پاسخ دادید. منتظر بمانید تا سایر بازیکنان نیز تکمیل کنند.
            </Text>
            <View className="bg-accent/20 rounded-lg p-4 border border-accent/30">
              <Text className="text-accent font-semibold text-center">
                نتایج به محض تکمیل همه بازیکنان نمایش داده خواهد شد
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const { match, result, participants, questions } = matchResults;
  
  // Find current user's data
  const currentUserParticipant = participants.find(p => p.userId === userProfile.userId);
  const opponentParticipant = participants.find(p => p.userId !== userProfile.userId);
  
  const isWinner = result?.winnerId === userProfile.userId;
  const isDraw = result?.isDraw;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracy = (participant: any) => {
    if (!participant.answers) return 0;
    const correct = participant.answers.filter((a: any) => a.isCorrect).length;
    return Math.round((correct / participant.answers.length) * 100);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="w-full px-6 py-8 space-y-6">
        {/* Header */}
        <View className="items-center">
          <View className={`flex-row items-center gap-3 px-6 py-3 rounded-full mb-4 border ${
            isDraw 
              ? "bg-yellow-600/20 border-yellow-500/30"
              : isWinner 
              ? "bg-green-600/20 border-green-500/30"
              : "bg-red-600/20 border-red-500/30"
          }`}>
            <Ionicons 
              name={isDraw ? "time-outline" : isWinner ? "trophy" : "close-circle"} 
              size={24} 
              color={isDraw ? "#facc15" : isWinner ? "#4ade80" : "#f87171"}
            />
            <Text className={`text-xl font-bold ${
              isDraw ? "text-yellow-400" : isWinner ? "text-green-400" : "text-red-400"
            }`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
              {isDraw ? "مساوی!" : isWinner ? "برنده شدید!" : "باختید"}
            </Text>
          </View>
          
          <Text className="text-3xl font-bold text-accent mb-2" style={{ fontFamily: 'Vazirmatn-Bold' }}>
            نتایج مسابقه
          </Text>
          <Text className="text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
            مسابقه در {new Date(match.completedAt!).toLocaleString('fa-IR')} به پایان رسید
          </Text>
        </View>

        {/* Score Comparison */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-6 text-center">
            مقایسه امتیازات
          </Text>
          
          <View className="space-y-6">
            {/* Current User */}
            <View className={`p-6 rounded-xl border-2 ${
              isWinner 
                ? "bg-green-600/10 border-green-500/30" 
                : isDraw 
                ? "bg-yellow-600/10 border-yellow-500/30"
                : "bg-red-600/10 border-red-500/30"
            }`}>
              <View className="items-center">
                <View className="w-16 h-16 bg-accent/20 rounded-full items-center justify-center mb-4">
                  <Text className="text-accent font-bold text-xl">
                    {currentUserParticipant?.profile?.name[0] || "?"}
                  </Text>
                </View>
                <Text className="text-xl font-semibold text-white mb-2">
                  {currentUserParticipant?.profile?.name || "شما"}
                </Text>
                <Text className="text-3xl font-bold text-accent mb-2">
                  {currentUserParticipant?.totalScore || 0}
                </Text>
                <Text className="text-gray-400 text-sm mb-4">امتیاز</Text>
                
                <View className="space-y-2 w-full">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">دقت:</Text>
                    <Text className="text-white font-semibold text-sm">
                      {getAccuracy(currentUserParticipant)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">زمان کل:</Text>
                    <Text className="text-white font-semibold text-sm">
                      {currentUserParticipant?.totalTime ? formatTime(currentUserParticipant.totalTime) : "محاسبه نشده"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">میانگین زمان:</Text>
                    <Text className="text-white font-semibold text-sm">
                      {currentUserParticipant?.totalTime ? formatTime(Math.round(currentUserParticipant.totalTime / 5)) : "محاسبه نشده"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Opponent */}
            <View className={`p-6 rounded-xl border-2 ${
              !isWinner && !isDraw
                ? "bg-green-600/10 border-green-500/30" 
                : isDraw
                ? "bg-yellow-600/10 border-yellow-500/30"
                : "bg-red-600/10 border-red-500/30"
            }`}>
              <View className="items-center">
                <View className="w-16 h-16 bg-gray-600/20 rounded-full items-center justify-center mb-4">
                  <Text className="text-gray-400 font-bold text-xl">
                    {opponentParticipant?.profile?.name[0] || "?"}
                  </Text>
                </View>
                <Text className="text-xl font-semibold text-white mb-2">
                  {opponentParticipant?.profile?.name || "حریف"}
                </Text>
                <Text className="text-3xl font-bold text-gray-400 mb-2">
                  {opponentParticipant?.totalScore || 0}
                </Text>
                <Text className="text-gray-400 text-sm mb-4">امتیاز</Text>
                
                <View className="space-y-2 w-full">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">دقت:</Text>
                    <Text className="text-white font-semibold text-sm">
                      {getAccuracy(opponentParticipant)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">زمان کل:</Text>
                    <Text className="text-white font-semibold text-sm">
                      {opponentParticipant?.totalTime ? formatTime(opponentParticipant.totalTime) : "محاسبه نشده"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300 text-sm">میانگین زمان:</Text>
                    <Text className="text-white font-semibold text-sm">
                      {opponentParticipant?.totalTime ? formatTime(Math.round(opponentParticipant.totalTime / 5)) : "محاسبه نشده"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Results */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6">
          <Text className="text-xl font-semibold text-white mb-6 text-center">
            جزئیات پاسخ‌ها
          </Text>
          
          <View className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = currentUserParticipant?.answers?.find(
                (a: any) => a.questionId === question._id
              );
              const opponentAnswer = opponentParticipant?.answers?.find(
                (a: any) => a.questionId === question._id
              );
              
              return (
                <View key={question._id} className="bg-gray-800/50 rounded-xl p-4">
                  <View className="flex-row items-start gap-4">
                    <View className="w-8 h-8 bg-accent rounded-full items-center justify-center">
                      <Text className="text-white font-bold">{index + 1}</Text>
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-white font-semibold mb-2">
                        {question.questionText}
                      </Text>
                      
                      <View className="space-y-4">
                        {/* User's Answer */}
                        <View>
                          <Text className="text-accent font-semibold text-sm mb-2">پاسخ شما:</Text>
                          <View className={`p-3 rounded-lg border ${
                            userAnswer?.isCorrect 
                              ? "bg-green-600/20 border-green-500/30" 
                              : "bg-red-600/20 border-red-500/30"
                          }`}>
                            <View className="flex-row items-center gap-2 mb-1">
                              <Ionicons 
                                name={userAnswer?.isCorrect ? "checkmark-circle" : "close-circle"}
                                size={16}
                                color={userAnswer?.isCorrect ? "#4ade80" : "#f87171"}
                              />
                              <Text className={`text-sm font-semibold ${
                                userAnswer?.isCorrect ? "text-green-400" : "text-red-400"
                              }`}>
                                گزینه {userAnswer?.selectedAnswer || "ندارد"}
                              </Text>
                            </View>
                            <Text className="text-gray-300 text-sm">
                              زمان: {userAnswer?.timeSpent ? formatTime(userAnswer.timeSpent) : "ثبت نشده"}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Opponent's Answer */}
                        <View>
                          <Text className="text-gray-400 font-semibold text-sm mb-2">پاسخ حریف:</Text>
                          <View className={`p-3 rounded-lg border ${
                            opponentAnswer?.isCorrect 
                              ? "bg-green-600/20 border-green-500/30" 
                              : "bg-red-600/20 border-red-500/30"
                          }`}>
                            <View className="flex-row items-center gap-2 mb-1">
                              <Ionicons 
                                name={opponentAnswer?.isCorrect ? "checkmark-circle" : "close-circle"}
                                size={16}
                                color={opponentAnswer?.isCorrect ? "#4ade80" : "#f87171"}
                              />
                              <Text className={`text-sm font-semibold ${
                                opponentAnswer?.isCorrect ? "text-green-400" : "text-red-400"
                              }`}>
                                گزینه {opponentAnswer?.selectedAnswer || "ندارد"}
                              </Text>
                            </View>
                            <Text className="text-gray-300 text-sm">
                              زمان: {opponentAnswer?.timeSpent ? formatTime(opponentAnswer.timeSpent) : "ثبت نشده"}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="mt-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                        <Text className="text-blue-400 text-sm">
                          <Text className="font-semibold">پاسخ صحیح:</Text> گزینه {question.rightAnswer}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <View className="items-center">
          <TouchableOpacity
            onPress={onPlayAgain}
            className="px-8 py-4 bg-accent rounded-xl"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold text-lg">بازگشت به خانه</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
