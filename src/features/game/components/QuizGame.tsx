import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useEffect, useState, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "../../../lib/toast";
import { getCleanErrorMessage } from "../../../lib/helpers";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../components/ui";

interface QuizGameProps {
  matchId: Id<"matches">;
  onGameComplete: () => void;
  onLeaveMatch: () => void;
}

export function QuizGame({ matchId, onGameComplete, onLeaveMatch }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<Record<string, number[]>>({}); // questionId -> disabled options
  const [correctOption, setCorrectOption] = useState<Record<string, number>>({}); // questionId -> correct option (if shown)
  const [usedHints, setUsedHints] = useState<Record<string, string[]>>({}); // questionId -> array of used hint types
  const [userPoints, setUserPoints] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const userProfile = useQuery(api.auth.getUserProfile);
  const isParticipant = useQuery(
    api.matches.checkMatchParticipation,
    userProfile ? { matchId } : "skip"
  );
  const matchDetails = useQuery(
    api.matches.getMatchDetails, 
    userProfile && isParticipant ? { matchId } : "skip"
  );
  const matchCompletion = useQuery(
    api.matches.checkMatchCompletion, 
    userProfile && isParticipant ? { matchId } : "skip"
  );
  const submitAnswer = useMutation(api.matches.submitAnswer);
  const leaveMatch = useMutation(api.matches.leaveMatch);
  const disableWrongOptions = useMutation(api.matches.disableWrongOptions);
  const showCorrectAnswer = useMutation(api.matches.showCorrectAnswer);
  
  // Update user points when profile changes
  useEffect(() => {
    if (userProfile?.points !== undefined) {
      setUserPoints(userProfile.points);
    }
  }, [userProfile?.points]);

  // Check localStorage for previous redirect when userProfile is available
  useEffect(() => {
    if (userProfile?.userId) {
      const key = `redirected_${matchId}_${userProfile.userId}`;
      const wasRedirected = localStorage?.getItem(key) === 'true';
      if (wasRedirected) {
        setHasRedirected(true);
      }
    }
  }, [userProfile?.userId, matchId]);
  const mediaUrl = useQuery(
    api.questions.getQuestionMediaUrl,
    matchDetails?.questions[currentQuestionIndex]?.mediaStorageId
      ? { storageId: matchDetails.questions[currentQuestionIndex].mediaStorageId! }
      : "skip"
  );

  const currentQuestion = matchDetails?.questions[currentQuestionIndex];
  const timePerQuestion = currentQuestion?.timeToRespond || 30;

  // Check if current user has completed all questions
  useEffect(() => {
    const currentParticipant = matchCompletion?.participants?.find(
      p => p.userId === userProfile?.userId
    );
    
    // If current user completed all questions and hasn't redirected yet
    if (currentParticipant?.completedAt && !hasRedirected) {
      // Mark as redirected in localStorage
      const key = `redirected_${matchId}_${userProfile?.userId}`;
      localStorage?.setItem(key, 'true');
      setHasRedirected(true); // Prevent multiple redirects
      
      if (matchCompletion?.isCompleted) {
        // Match is fully completed - this user was the last one to finish
        console.log("Match fully completed, this was the last player to finish");
        onGameComplete();
      } else {
        // User finished first - go to lobby to see pending results
        console.log("User finished first, going to lobby to see pending results");
        onGameComplete();
      }
    }
  }, [matchCompletion?.participants, matchCompletion?.isCompleted, userProfile?.userId, onGameComplete, hasRedirected]);

  // Initialize timer when question changes
  useEffect(() => {
    if (currentQuestion && !isAnswered) {
      setTimeLeft(timePerQuestion);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false); // Reset correct state
      
      // Clear removed options for previous question (if any)
      // Note: This will be cleared when moving to next question in handleAnswerSubmit,
      // but we also clear it here to be safe
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, currentQuestion, isAnswered]);

  const handleDisableOptions = async (numOptions: number) => {
    if (!currentQuestion || isAnswered) return;
    
    const questionId = currentQuestion._id;
    const usedHintsForQuestion = usedHints[questionId] || [];
    
    // Check if any hint has already been used for this question
    if (usedHintsForQuestion.length > 0) {
      toast.error("شما قبلاً از یک کمک برای این سؤال استفاده کرده‌اید");
      return;
    }
    
    const cost = numOptions === 1 ? 2 : 5;
    
    if (userPoints < cost) {
      toast.error(`امتیاز کافی ندارید. برای غیرفعال کردن ${numOptions} گزینه به ${cost} امتیاز نیاز دارید.`);
      return;
    }
    
    try {
      const result = await disableWrongOptions({
        matchId,
        questionId: currentQuestion._id,
        numOptionsToDisable: numOptions,
      });
      
      // Update disabled options for this question
      setDisabledOptions(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), ...result.disabledOptions],
      }));
      
      // Mark that a hint has been used (only one hint per question)
      setUsedHints(prev => ({
        ...prev,
        [questionId]: ['used'],
      }));
      
      // Update user points
      setUserPoints(result.remainingPoints);
      
      toast.success(`${numOptions} گزینه اشتباه غیرفعال شد. ${cost} امتیاز کسر شد.`);
    } catch (error) {
      toast.error(getCleanErrorMessage(error));
    }
  };

  const handleShowCorrectAnswer = async () => {
    if (!currentQuestion || isAnswered) return;
    
    const questionId = currentQuestion._id;
    const usedHintsForQuestion = usedHints[questionId] || [];
    
    // Check if any hint has already been used for this question
    if (usedHintsForQuestion.length > 0) {
      toast.error("شما قبلاً از یک کمک برای این سؤال استفاده کرده‌اید");
      return;
    }
    
    const cost = 7;
    
    if (userPoints < cost) {
      toast.error(`امتیاز کافی ندارید. برای نمایش پاسخ صحیح به ${cost} امتیاز نیاز دارید.`);
      return;
    }
    
    try {
      const result = await showCorrectAnswer({
        matchId,
        questionId: currentQuestion._id,
      });
      
      // Update disabled options (all wrong options)
      setDisabledOptions(prev => ({
        ...prev,
        [questionId]: result.disabledOptions,
      }));
      
      // Set correct option
      setCorrectOption(prev => ({
        ...prev,
        [questionId]: result.correctOption,
      }));
      
      // Mark that a hint has been used (only one hint per question)
      setUsedHints(prev => ({
        ...prev,
        [questionId]: ['used'],
      }));
      
      // Update user points
      setUserPoints(result.remainingPoints);
      
      toast.success(`پاسخ صحیح نمایش داده شد. ${cost} امتیاز کسر شد.`);
    } catch (error) {
      toast.error(getCleanErrorMessage(error));
    }
  };

  const handleTimeUp = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!isAnswered && currentQuestion) {
      // Auto-submit with no answer (answer 0 means no answer)
      // Use full time as time spent when time runs out
      const timeSpent = Date.now() - questionStartTime;
      const timeSpentSeconds = Math.round(timeSpent / 1000);
      
      console.log("Time up! Auto-submitting with time spent:", timeSpentSeconds);
      await handleAnswerSubmit(0);
    }
  };

  const handleAnswerSubmit = async (answer: number) => {
    if (isAnswered || !currentQuestion) return;
    
    // Get current participant to check if already answered
    const currentParticipant = matchCompletion?.participants?.find(
      p => p.userId === userProfile?.userId
    );
    
    // Check if user has already completed this match
    if (currentParticipant?.completedAt) {
      console.log("User has already completed this match, skipping answer submission");
      return;
    }
    
    // Check if user has already answered this question
    const existingAnswer = currentParticipant?.answers?.find(
      (a: any) => a.questionId === currentQuestion._id
    );
    
    if (existingAnswer) {
      console.log("User has already answered this question, skipping submission");
      return;
    }
    
    setIsAnswered(true);
    setSelectedAnswer(answer);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calculate actual time spent more accurately
    const timeSpent = Date.now() - questionStartTime;
    const timeSpentSeconds = Math.round(timeSpent / 1000);
    const actualAnswer = answer === 0 ? 0 : answer; // Keep 0 as "no answer"
    
    try {
      console.log("Submitting answer:", {
        matchId,
        questionId: currentQuestion._id,
        selectedAnswer: actualAnswer,
        timeSpent: timeSpentSeconds,
        timeSpentMs: timeSpent,
      });
      
      const result = await submitAnswer({
        matchId,
        questionId: currentQuestion._id,
        selectedAnswer: actualAnswer,
        timeSpent: timeSpentSeconds,
      });
      
      console.log("Answer submitted successfully:", result);
      
      // Show result immediately - backend determines correctness securely
      setIsCorrect(result.isCorrect);
      setShowResult(true);
      
      // Show result for 2 seconds before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < matchDetails!.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setIsAnswered(false);
          setShowResult(false);
          // Clear disabled options and correct option for the next question
          setDisabledOptions(prev => {
            const next = { ...prev };
            delete next[currentQuestion._id];
            return next;
          });
          setCorrectOption(prev => {
            const next = { ...prev };
            delete next[currentQuestion._id];
            return next;
          });
          setUsedHints(prev => {
            const next = { ...prev };
            delete next[currentQuestion._id];
            return next;
          });
        } else {
          // User completed all questions
          // The useEffect will handle redirect based on match completion status
          console.log("User completed all questions, useEffect will handle redirect");
        }
      }, 2000);
      
    } catch (error) {
      toast.error(getCleanErrorMessage(error));
      setIsAnswered(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / (matchDetails?.questions.length || 1)) * 100;
  };

  const handleLeaveGame = async () => {
    console.log("handleLeaveGame called");
    try {
      console.log("Attempting to leave match:", matchId);
      await leaveMatch({ matchId });
      console.log("Successfully left match, calling onLeaveMatch");
      toast.success("از مسابقه خارج شدید");
      onLeaveMatch();
    } catch (error) {
      console.error("Error leaving match:", error);
      toast.error(getCleanErrorMessage(error));
    }
  };

  // Show loading while data is being fetched
  if (!userProfile || isParticipant === undefined) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
        <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
      </View>
    );
  }

  // Check if user is a participant in this match
  if (isParticipant === false) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-24 h-24 bg-red-600/20 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        </View>
        <Text className="text-2xl font-bold text-red-400 mb-4 text-center">
          خطا در دسترسی
        </Text>
        <Text className="text-gray-400 mb-6 text-center">
          شما در این بازی شرکت نکرده‌اید
        </Text>
        <TouchableOpacity
          onPress={onLeaveMatch}
          className="px-6 py-3 bg-accent rounded-lg"
        >
          <Text className="text-white font-semibold">بازگشت</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading while match details are being fetched
  if (!matchDetails || !currentQuestion) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff701a" />
        <Text className="text-gray-400 mt-4">در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="w-full px-6 py-8">
        {/* Header */}
        <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-accent mb-1" style={{ fontFamily: 'Vazirmatn-Bold' }}>
              مسابقه کویز
            </Text>
            <Text className="text-gray-300" style={{ fontFamily: 'Vazirmatn-Regular' }}>
              سؤال {currentQuestionIndex + 1} از {matchDetails.questions.length}
            </Text>
          </View>
          
          <View className="flex-row items-center gap-4">
            <View>
              <Text className="text-xl font-bold text-accent" style={{ fontFamily: 'Vazirmatn-Bold' }}>
                {userPoints} امتیاز
              </Text>
              <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Vazirmatn-Regular' }}>امتیاز شما</Text>
            </View>
            
            <TouchableOpacity
              onPress={handleLeaveGame}
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              <Text className="text-white text-sm font-semibold" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>خروج از مسابقه</Text>
            </TouchableOpacity>
            
            <View>
              <Text className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-accent'}`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                {formatTime(timeLeft)}
              </Text>
              <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Vazirmatn-Regular' }}>زمان باقی‌مانده</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View className="w-full bg-gray-700 rounded-full h-2">
          <View 
            className="bg-accent h-2 rounded-full"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </View>
      </View>

      {/* Players Info */}
      <View className="flex-row gap-4 mb-6">
        {matchDetails.participants.map((participant) => (
          <View key={participant.userId} className="flex-1 bg-background-light/60 rounded-xl border border-gray-700/30 p-4">
            <View className="flex-row items-center gap-3">
              <Avatar avatarId={participant.profile?.avatarId} size="md" />
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  {participant.profile?.name || "بازیکن ناشناس"}
                </Text>
                <Text className="text-gray-400 text-sm">
                  {participant.answers?.length || 0} پاسخ داده شده
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Question Card */}
      <View className="bg-background-light/60 rounded-2xl border border-gray-700/30 p-8 mb-6">
        {/* Media */}
        {currentQuestion.mediaStorageId && mediaUrl && (
          <View className="mb-6">
            <Image 
              source={{ uri: mediaUrl }}
              className="w-full h-64 rounded-lg"
              resizeMode="contain"
            />
          </View>
        )}
        
        {currentQuestion.mediaPath && (
          <View className="mb-6">
            <Image 
              source={{ uri: currentQuestion.mediaPath }}
              className="w-full h-64 rounded-lg"
              resizeMode="contain"
            />
          </View>
        )}

        {/* Question Text */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-semibold text-white text-center" style={{ fontFamily: 'Vazirmatn-SemiBold' }}>
            {currentQuestion.questionText}
          </Text>
        </View>

        {/* Hint Buttons */}
        {!isAnswered && (
          <View className="gap-3 mb-6">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleDisableOptions(1)}
                disabled={userPoints < 2 || (usedHints[currentQuestion._id] || []).length > 0}
                className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                  userPoints >= 2 && (usedHints[currentQuestion._id] || []).length === 0
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-700/50 border-gray-600 opacity-50"
                }`}
              >
                <View className="items-center">
                  <Text className={`text-lg font-bold ${
                    userPoints >= 2 && (usedHints[currentQuestion._id] || []).length === 0
                      ? "text-accent"
                      : "text-gray-400"
                  }`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                    غیرفعال کردن ۱ گزینه
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                    ۲ امتیاز
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleDisableOptions(2)}
                disabled={userPoints < 5 || (usedHints[currentQuestion._id] || []).length > 0}
                className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                  userPoints >= 5 && (usedHints[currentQuestion._id] || []).length === 0
                    ? "bg-accent/20 border-accent"
                    : "bg-gray-700/50 border-gray-600 opacity-50"
                }`}
              >
                <View className="items-center">
                  <Text className={`text-lg font-bold ${
                    userPoints >= 5 && (usedHints[currentQuestion._id] || []).length === 0
                      ? "text-accent"
                      : "text-gray-400"
                  }`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                  غیرفعال کردن ۲ گزینه
                </Text>
                  <Text className="text-gray-400 text-xs mt-1" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                    ۵ امتیاز
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={handleShowCorrectAnswer}
              disabled={userPoints < 7 || (usedHints[currentQuestion._id] || []).length > 0}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                userPoints >= 7 && (usedHints[currentQuestion._id] || []).length === 0
                  ? "bg-green-600/20 border-green-500"
                  : "bg-gray-700/50 border-gray-600 opacity-50"
              }`}
            >
              <View className="items-center">
                <Text className={`text-lg font-bold ${
                  userPoints >= 7 && (usedHints[currentQuestion._id] || []).length === 0
                    ? "text-green-400"
                    : "text-gray-400"
                }`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                  نمایش پاسخ صحیح
                </Text>
                <Text className="text-gray-400 text-xs mt-1" style={{ fontFamily: 'Vazirmatn-Regular' }}>
                  ۷ امتیاز
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Answer Options */}
        <View className="space-y-4">
          {[
            { key: 1, text: currentQuestion.option1Text },
            { key: 2, text: currentQuestion.option2Text },
            { key: 3, text: currentQuestion.option3Text },
            { key: 4, text: currentQuestion.option4Text },
          ].map((option) => {
            const isDisabled = disabledOptions[currentQuestion._id]?.includes(option.key);
            const isCorrect = correctOption[currentQuestion._id] === option.key;
            
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => !isAnswered && !isDisabled && handleAnswerSubmit(option.key)}
                disabled={isAnswered || isDisabled}
                className={`p-4 rounded-xl ${
                  isDisabled
                    ? "bg-gray-800/50 border border-gray-700 opacity-50"
                    : isAnswered && showResult
                    ? option.key === selectedAnswer
                      ? isCorrect
                        ? "bg-green-600/30 border-2 border-green-500"
                        : "bg-red-600/30 border-2 border-red-500"
                      : isCorrect
                      ? "bg-green-600/30 border-2 border-green-500"
                      : "bg-gray-700/50 border border-gray-600"
                    : isCorrect
                    ? "bg-green-600/20 border-2 border-green-500"
                    : selectedAnswer === option.key
                    ? "bg-accent/20 border-2 border-accent"
                    : "bg-gray-700/50 border border-gray-600 active:bg-gray-600/50"
                }`}
                activeOpacity={isDisabled ? 1 : 0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${
                    isDisabled
                      ? "bg-gray-700"
                      : isCorrect
                      ? "bg-green-500"
                      : isAnswered && showResult
                      ? option.key === selectedAnswer
                        ? isCorrect
                          ? "bg-green-500"
                          : "bg-red-500"
                        : "bg-gray-600"
                      : selectedAnswer === option.key
                      ? "bg-accent"
                      : "bg-gray-600"
                  }`}>
                    {isDisabled ? (
                      <Ionicons name="close" size={16} color="#6b7280" />
                    ) : (
                      <Text className={`font-bold ${
                        isCorrect
                          ? "text-white"
                          : isAnswered && showResult
                          ? option.key === selectedAnswer ? "text-white" : "text-gray-400"
                          : selectedAnswer === option.key ? "text-white" : "text-gray-300"
                      }`} style={{ fontFamily: 'Vazirmatn-Bold' }}>
                        {option.key}
                      </Text>
                    )}
                  </View>
                  <Text className={`flex-1 ${
                    isDisabled
                      ? "text-gray-500 line-through"
                      : isCorrect
                      ? "text-green-300 font-semibold"
                      : isAnswered && showResult
                      ? option.key === selectedAnswer
                        ? isCorrect ? "text-green-300" : "text-red-300"
                        : "text-gray-400"
                      : selectedAnswer === option.key
                      ? "text-accent"
                      : "text-white"
                  }`} style={{ fontFamily: 'Vazirmatn-Regular' }}>
                    {option.text}
                  </Text>
                  {isCorrect && !isAnswered && (
                    <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result Display */}
        {showResult && (
          <View className={`mt-6 p-4 rounded-xl items-center ${
            isCorrect ? "bg-green-600/20 border border-green-500/30" : "bg-red-600/20 border border-red-500/30"
          }`}>
            <View className="flex-row items-center justify-center gap-2 mb-2">
              <Ionicons 
                name={isCorrect ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={isCorrect ? "#4ade80" : "#f87171"}
              />
              <Text className={`text-lg font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? "درست!" : "اشتباه!"}
              </Text>
            </View>
            <Text className="text-gray-300">
              {isCorrect 
                ? "پاسخ شما صحیح است" 
                : "پاسخ شما اشتباه بود"
              }
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              زمان پاسخ: {Math.round((Date.now() - questionStartTime) / 1000)} ثانیه
            </Text>
          </View>
        )}
      </View>

        {/* Skip Button */}
        {!isAnswered && (
          <View className="items-center">
            <TouchableOpacity
              onPress={() => handleAnswerSubmit(0)}
              className="px-6 py-3 bg-gray-600 rounded-xl"
            >
              <Text className="text-white font-semibold">رد کردن سؤال</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
