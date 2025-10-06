import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface MatchResultsProps {
  matchId: Id<"matches">;
  onPlayAgain: () => void;
}

export function MatchResults({ matchId, onPlayAgain }: MatchResultsProps) {
  const matchResults = useQuery(api.auth.getMatchResultsPartial, { matchId });
  const userProfile = useQuery(api.auth.getUserProfile);

  if (!matchResults || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Show waiting message if match is not completed yet
  if (!matchResults.isCompleted) {
    return (
      <div className="w-full max-w-none px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">
              منتظر سایر بازیکنان...
            </h2>
            <p className="text-gray-300 mb-6">
              شما تمام سؤالات را پاسخ دادید. منتظر بمانید تا سایر بازیکنان نیز تکمیل کنند.
            </p>
            <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
              <p className="text-accent font-semibold">
                نتایج به محض تکمیل همه بازیکنان نمایش داده خواهد شد
              </p>
            </div>
          </div>
        </div>
      </div>
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
    <div className="w-full max-w-none px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-xl font-bold mb-4 ${
          isDraw 
            ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
            : isWinner 
            ? "bg-green-600/20 text-green-400 border border-green-500/30"
            : "bg-red-600/20 text-red-400 border border-red-500/30"
        }`}>
          {isDraw ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              مساوی!
            </>
          ) : isWinner ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              برنده شدید!
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              باختید
            </>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-accent mb-2">
          نتایج مسابقه
        </h1>
        <p className="text-gray-300">
          مسابقه در {new Date(match.completedAt!).toLocaleString('fa-IR')} به پایان رسید
        </p>
      </div>

      {/* Score Comparison */}
      <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          مقایسه امتیازات
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current User */}
          <div className={`p-6 rounded-xl border-2 ${
            isWinner 
              ? "bg-green-600/10 border-green-500/30" 
              : isDraw 
              ? "bg-yellow-600/10 border-yellow-500/30"
              : "bg-red-600/10 border-red-500/30"
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent font-bold text-xl">
                  {currentUserParticipant?.profile?.name[0] || "?"}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {currentUserParticipant?.profile?.name || "شما"}
              </h3>
              <div className="text-3xl font-bold text-accent mb-2">
                {currentUserParticipant?.totalScore || 0}
              </div>
              <p className="text-gray-400 text-sm mb-4">امتیاز</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">دقت:</span>
                  <span className="text-white font-semibold">
                    {getAccuracy(currentUserParticipant)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">زمان کل:</span>
                  <span className="text-white font-semibold">
                    {currentUserParticipant?.totalTime ? formatTime(currentUserParticipant.totalTime) : "محاسبه نشده"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">میانگین زمان:</span>
                  <span className="text-white font-semibold">
                    {currentUserParticipant?.totalTime ? formatTime(Math.round(currentUserParticipant.totalTime / 5)) : "محاسبه نشده"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Opponent */}
          <div className={`p-6 rounded-xl border-2 ${
            !isWinner && !isDraw
              ? "bg-green-600/10 border-green-500/30" 
              : isDraw
              ? "bg-yellow-600/10 border-yellow-500/30"
              : "bg-red-600/10 border-red-500/30"
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 font-bold text-xl">
                  {opponentParticipant?.profile?.name[0] || "?"}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {opponentParticipant?.profile?.name || "حریف"}
              </h3>
              <div className="text-3xl font-bold text-gray-400 mb-2">
                {opponentParticipant?.totalScore || 0}
              </div>
              <p className="text-gray-400 text-sm mb-4">امتیاز</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">دقت:</span>
                  <span className="text-white font-semibold">
                    {getAccuracy(opponentParticipant)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">زمان کل:</span>
                  <span className="text-white font-semibold">
                    {opponentParticipant?.totalTime ? formatTime(opponentParticipant.totalTime) : "محاسبه نشده"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">میانگین زمان:</span>
                  <span className="text-white font-semibold">
                    {opponentParticipant?.totalTime ? formatTime(Math.round(opponentParticipant.totalTime / 5)) : "محاسبه نشده"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 text-center">
          جزئیات پاسخ‌ها
        </h2>
        
        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = currentUserParticipant?.answers?.find(
              (a: any) => a.questionId === question._id
            );
            const opponentAnswer = opponentParticipant?.answers?.find(
              (a: any) => a.questionId === question._id
            );
            
            return (
              <div key={question._id} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">
                      {question.questionText}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* User's Answer */}
                      <div className="space-y-2">
                        <h4 className="text-accent font-semibold text-sm">پاسخ شما:</h4>
                        <div className={`p-3 rounded-lg ${
                          userAnswer?.isCorrect 
                            ? "bg-green-600/20 border border-green-500/30" 
                            : "bg-red-600/20 border border-red-500/30"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {userAnswer?.isCorrect ? (
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            <span className={`text-sm font-semibold ${
                              userAnswer?.isCorrect ? "text-green-400" : "text-red-400"
                            }`}>
                              گزینه {userAnswer?.selectedAnswer || "ندارد"}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            زمان: {userAnswer?.timeSpent ? formatTime(userAnswer.timeSpent) : "ثبت نشده"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Opponent's Answer */}
                      <div className="space-y-2">
                        <h4 className="text-gray-400 font-semibold text-sm">پاسخ حریف:</h4>
                        <div className={`p-3 rounded-lg ${
                          opponentAnswer?.isCorrect 
                            ? "bg-green-600/20 border border-green-500/30" 
                            : "bg-red-600/20 border border-red-500/30"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {opponentAnswer?.isCorrect ? (
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            <span className={`text-sm font-semibold ${
                              opponentAnswer?.isCorrect ? "text-green-400" : "text-red-400"
                            }`}>
                              گزینه {opponentAnswer?.selectedAnswer || "ندارد"}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            زمان: {opponentAnswer?.timeSpent ? formatTime(opponentAnswer.timeSpent) : "ثبت نشده"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        <span className="font-semibold">پاسخ صحیح:</span> گزینه {question.rightAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="text-center">
        <button
          onClick={onPlayAgain}
          className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          بازگشت به خانه
        </button>
      </div>
    </div>
  );
}
