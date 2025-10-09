import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface MatchHistoryProps {
  onViewMatch: (matchId: string) => void;
}

export function MatchHistory({ onViewMatch }: MatchHistoryProps) {
  const matchHistory = useQuery(api.matches.getUserMatchHistory, { limit: 50 });

  if (!matchHistory) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
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

  if (matchHistory.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          تاریخچه مسابقات خالی است
        </h2>
        <p className="text-gray-400 mb-6">
          هنوز هیچ مسابقه‌ای انجام نداده‌اید. اولین مسابقه خود را شروع کنید!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-accent mb-2">
          تاریخچه مسابقات
        </h1>
        <p className="text-gray-300">
          {matchHistory.length} مسابقه انجام شده
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">
            {matchHistory.filter(m => m.isWinner).length}
          </div>
          <div className="text-gray-300 text-sm">برد</div>
        </div>
        
        <div className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {matchHistory.filter(m => !m.isWinner && !m.isDraw).length}
          </div>
          <div className="text-gray-300 text-sm">باخت</div>
        </div>
        
        <div className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {matchHistory.filter(m => m.isDraw).length}
          </div>
          <div className="text-gray-300 text-sm">مساوی</div>
        </div>
        
        <div className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {Math.round((matchHistory.filter(m => m.isWinner).length / matchHistory.length) * 100)}%
          </div>
          <div className="text-gray-300 text-sm">نرخ برد</div>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-4">
        {matchHistory.map((matchData, index) => {
          const { match, result, participant, opponent, isWinner, isDraw } = matchData;
          
          return (
            <div 
              key={match._id}
              className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6 hover:bg-background-light/80 transition-all duration-200 cursor-pointer"
              onClick={() => onViewMatch(match._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Match Number */}
                  <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {matchHistory.length - index}
                    </span>
                  </div>
                  
                  {/* Match Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        مسابقه با {opponent?.name || "بازیکن ناشناس"}
                      </h3>
                      
                      {/* Result Badge */}
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isDraw
                          ? "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30"
                          : isWinner
                          ? "bg-green-600/20 text-green-400 border border-green-500/30"
                          : "bg-red-600/20 text-red-400 border border-red-500/30"
                      }`}>
                        {isDraw ? "مساوی" : isWinner ? "برد" : "باخت"}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>
                        {new Date(match.completedAt!).toLocaleDateString('fa-IR')}
                      </span>
                      <span>
                        {new Date(match.completedAt!).toLocaleTimeString('fa-IR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Score Comparison */}
                <div className="text-right">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-center">
                      <div className="text-xl font-bold text-accent">
                        {participant.totalScore}
                      </div>
                      <div className="text-xs text-gray-400">شما</div>
                    </div>
                    
                    <div className="text-gray-500 text-lg">-</div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-400">
                        {result.player1Id === participant.userId ? result.player2Score : result.player1Score}
                      </div>
                      <div className="text-xs text-gray-400">حریف</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    دقت: {getAccuracy(participant)}% | 
                    زمان: {formatTime(participant.totalTime || 0)}
                  </div>
                </div>
                
                {/* View Button */}
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {matchHistory.length >= 50 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors">
            نمایش بیشتر
          </button>
        </div>
      )}
    </div>
  );
}
