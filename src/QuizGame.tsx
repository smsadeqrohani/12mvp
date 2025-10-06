import { useQuery, useMutation } from "convex/react";
import { useEffect, useState, useRef } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

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
  const [correctAnswer, setCorrectAnswer] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const matchDetails = useQuery(api.auth.getMatchDetails, { matchId });
  const matchCompletion = useQuery(api.auth.checkMatchCompletion, { matchId });
  const submitAnswer = useMutation(api.auth.submitAnswer);
  const leaveMatch = useMutation(api.auth.leaveMatch);
  const mediaUrl = useQuery(
    api.auth.getQuestionMediaUrl,
    matchDetails?.questions[currentQuestionIndex]?.mediaStorageId
      ? { storageId: matchDetails.questions[currentQuestionIndex].mediaStorageId! }
      : "skip"
  );

  const currentQuestion = matchDetails?.questions[currentQuestionIndex];
  const timePerQuestion = currentQuestion?.timeToRespond || 30;

  // Check if match is completed
  useEffect(() => {
    if (matchCompletion?.isCompleted) {
      onGameComplete();
    }
  }, [matchCompletion?.isCompleted, onGameComplete]);

  // Initialize timer when question changes
  useEffect(() => {
    if (currentQuestion && !isAnswered) {
      setTimeLeft(timePerQuestion);
      setQuestionStartTime(Date.now());
      setSelectedAnswer(null);
      setShowResult(false);
      
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

  const handleTimeUp = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!isAnswered && currentQuestion) {
      // Auto-submit with no answer (answer 0 means no answer)
      await handleAnswerSubmit(0);
    }
  };

  const handleAnswerSubmit = async (answer: number) => {
    if (isAnswered || !currentQuestion) return;
    
    setIsAnswered(true);
    setSelectedAnswer(answer);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const timeSpent = timePerQuestion - timeLeft;
    const actualAnswer = answer === 0 ? 0 : answer; // Keep 0 as "no answer"
    
    try {
      console.log("Submitting answer:", {
        matchId,
        questionId: currentQuestion._id,
        selectedAnswer: actualAnswer,
        timeSpent,
      });
      
      const result = await submitAnswer({
        matchId,
        questionId: currentQuestion._id,
        selectedAnswer: actualAnswer,
        timeSpent,
      });
      
      console.log("Answer submitted successfully:", result);
      
      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer);
      setShowResult(true);
      
      // Show result for 3 seconds before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < matchDetails!.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setIsAnswered(false);
          setShowResult(false);
        } else {
          // Game completed
          onGameComplete();
        }
      }, 3000);
      
    } catch (error) {
      toast.error("خطا در ارسال پاسخ: " + (error as Error).message);
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
    if (window.confirm("آیا مطمئن هستید که می‌خواهید از مسابقه خارج شوید؟")) {
      try {
        await leaveMatch({ matchId });
        toast.success("از مسابقه خارج شدید");
        onLeaveMatch();
      } catch (error) {
        toast.error("خطا در خروج از مسابقه: " + (error as Error).message);
      }
    }
  };

  if (!matchDetails || !currentQuestion) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-6 py-8">
      {/* Header */}
      <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-accent mb-1">
              مسابقه کویز
            </h1>
            <p className="text-gray-300">
              سؤال {currentQuestionIndex + 1} از {matchDetails.questions.length}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveGame}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              خروج از مسابقه
            </button>
            
            <div className="text-left">
              <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-accent'}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-400 text-sm">زمان باقی‌مانده</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Players Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {matchDetails.participants.map((participant, index) => (
          <div key={participant.userId} className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                <span className="text-accent font-bold text-sm">
                  {participant.profile?.name[0] || "?"}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">
                  {participant.profile?.name || "بازیکن ناشناس"}
                </p>
                <p className="text-gray-400 text-sm">
                  {participant.answers?.length || 0} پاسخ داده شده
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Card */}
      <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8 mb-6">
        {/* Media */}
        {currentQuestion.mediaStorageId && mediaUrl && (
          <div className="mb-6">
            <img 
              src={mediaUrl} 
              alt="سؤال" 
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
          </div>
        )}
        
        {currentQuestion.mediaPath && (
          <div className="mb-6">
            <img 
              src={currentQuestion.mediaPath} 
              alt="سؤال" 
              className="w-full max-h-64 object-contain rounded-lg mx-auto"
            />
          </div>
        )}

        {/* Question Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white leading-relaxed">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 1, text: currentQuestion.option1Text },
            { key: 2, text: currentQuestion.option2Text },
            { key: 3, text: currentQuestion.option3Text },
            { key: 4, text: currentQuestion.option4Text },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => !isAnswered && handleAnswerSubmit(option.key)}
              disabled={isAnswered}
              className={`p-4 rounded-xl text-right transition-all duration-200 ${
                isAnswered
                  ? option.key === correctAnswer
                    ? "bg-green-600/30 border-2 border-green-500 text-green-300"
                    : option.key === selectedAnswer
                    ? "bg-red-600/30 border-2 border-red-500 text-red-300"
                    : "bg-gray-700/50 border border-gray-600 text-gray-400"
                  : selectedAnswer === option.key
                  ? "bg-accent/20 border-2 border-accent text-accent"
                  : "bg-gray-700/50 border border-gray-600 text-white hover:bg-gray-600/50 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  isAnswered
                    ? option.key === correctAnswer
                      ? "bg-green-500 text-white"
                      : option.key === selectedAnswer
                      ? "bg-red-500 text-white"
                      : "bg-gray-600 text-gray-400"
                    : selectedAnswer === option.key
                    ? "bg-accent text-white"
                    : "bg-gray-600 text-gray-300"
                }`}>
                  {option.key}
                </div>
                <span className="flex-1">{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-xl text-center ${
            isCorrect ? "bg-green-600/20 border border-green-500/30" : "bg-red-600/20 border border-red-500/30"
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCorrect ? (
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={`text-lg font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? "درست!" : "اشتباه!"}
              </span>
            </div>
            <p className="text-gray-300">
              {isCorrect 
                ? "پاسخ شما صحیح است" 
                : `پاسخ صحیح گزینه ${correctAnswer} بود`
              }
            </p>
          </div>
        )}
      </div>

      {/* Skip Button */}
      {!isAnswered && (
        <div className="text-center">
          <button
            onClick={() => handleAnswerSubmit(0)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-semibold transition-colors"
          >
            رد کردن سؤال
          </button>
        </div>
      )}
    </div>
  );
}
