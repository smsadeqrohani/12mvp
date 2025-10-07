import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { MatchResults } from "./MatchResults";

interface MatchDetailsAdminProps {
  matchId: Id<"matches">;
  onBack: () => void;
}

export function MatchDetailsAdmin({ matchId, onBack }: MatchDetailsAdminProps) {
  const matchDetails = useQuery(api.matches.getMatchResultsPartial, { matchId });

  if (!matchDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const { match, result, participants, isCompleted } = matchDetails;

  // If match is cancelled, show cancelled message
  if (match.status === "cancelled") {
    return (
      <div className="w-full max-w-none px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8 text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              مسابقه لغو شده
            </h2>
            <p className="text-gray-300 mb-6">
              این مسابقه توسط مدیر یا یکی از بازیکنان لغو شده است
            </p>
            <div className="bg-red-600/20 rounded-lg p-4 border border-red-500/30 mb-6">
              <p className="text-red-400">
                وضعیت: لغو شده در تاریخ {new Date(match.completedAt || match.createdAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-right">
              <h3 className="text-white font-semibold mb-3">شرکت‌کنندگان:</h3>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">
                        {p.profile?.name[0] || "?"}
                      </span>
                    </div>
                    <span className="text-gray-300">{p.profile?.name || "ناشناس"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If match is not completed (waiting or active), show in-progress message
  if (!isCompleted) {
    return (
      <div className="w-full max-w-none px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              مسابقه هنوز تکمیل نشده
            </h2>
            <p className="text-gray-300 mb-6">
              {match.status === "waiting" 
                ? "این مسابقه در انتظار شرکت‌کننده دوم است" 
                : "این مسابقه در حال انجام است"}
            </p>
            <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-500/30 mb-6">
              <p className="text-yellow-400">
                وضعیت: {match.status === "waiting" ? "منتظر" : "در حال انجام"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 text-right">
                <h3 className="text-white font-semibold mb-3">شرکت‌کنندگان:</h3>
                <div className="space-y-2">
                  {participants.map((p) => (
                    <div key={p.userId} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                        <span className="text-accent font-bold text-sm">
                          {p.profile?.name[0] || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-300">{p.profile?.name || "ناشناس"}</span>
                        {p.completedAt && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-400 text-xs">تکمیل شده</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 text-right">
                <h3 className="text-white font-semibold mb-3">اطلاعات مسابقه:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">تعداد سؤالات:</span>
                    <span className="text-white">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">تاریخ ایجاد:</span>
                    <span className="text-white">
                      {new Date(match.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  {match.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">شروع شده:</span>
                      <span className="text-white">
                        {new Date(match.startedAt).toLocaleTimeString('fa-IR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If match is completed, show full results
  return <MatchResults matchId={matchId} onPlayAgain={onBack} />;
}

