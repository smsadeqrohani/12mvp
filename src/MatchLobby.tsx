import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface MatchLobbyProps {
  onMatchStart: (matchId: Id<"matches">) => void;
  onMatchFound: (matchId: Id<"matches">) => void;
  isResetting?: boolean;
}

export function MatchLobby({ onMatchStart, onMatchFound, isResetting }: MatchLobbyProps) {
  const [isSearching, setIsSearching] = useState(false);
  
  const userProfile = useQuery(api.auth.getUserProfile);
  const userMatchStatus = useQuery(api.auth.getUserActiveMatchStatus);
  const createMatch = useMutation(api.auth.createMatch);
  const leaveMatch = useMutation(api.auth.leaveMatch);

  // Single, simplified effect for match status monitoring
  useEffect(() => {
    if (!userMatchStatus || isResetting) return;
    
    console.log("Match status changed:", userMatchStatus.status);
    
    if (userMatchStatus.status === "active") {
      console.log("Match became active, redirecting to game...");
      setIsSearching(false);
      toast.success("حریف پیدا شد! مسابقه شروع شد");
      onMatchFound(userMatchStatus.matchId);
    } else if (userMatchStatus.status === "waiting" && isSearching) {
      console.log("Match is waiting for opponent...");
      onMatchStart(userMatchStatus.matchId);
    } else if (userMatchStatus.status === "cancelled" && isSearching) {
      console.log("Match was cancelled, resetting state...");
      setIsSearching(false);
      toast.info("مسابقه لغو شد");
    }
  }, [userMatchStatus?.status, userMatchStatus?.matchId, onMatchFound, onMatchStart, isResetting, isSearching]);

  const handleCreateMatch = async () => {
    try {
      setIsSearching(true);
      toast.success("در حال جستجو برای حریف...");
      
      console.log("Creating match...");
      const matchId = await createMatch();
      console.log("Match created/joined with ID:", matchId);
      
      // The createMatch function now handles matchmaking automatically
      // It will either join an existing waiting match or create a new one
      // The useEffect will handle the status check when activeMatch updates
      
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
      if (userMatchStatus?.matchId) {
        await leaveMatch({ matchId: userMatchStatus.matchId });
      }
      setIsSearching(false);
      toast.success("مسابقه لغو شد");
    } catch (error) {
      toast.error("خطا در لغو مسابقه: " + (error as Error).message);
      setIsSearching(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-accent mb-2">
          مسابقه کویز دو نفره
        </h1>
        <p className="text-gray-300">
          با حریفان مختلف مسابقه دهید و مهارت‌های خود را محک بزنید
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Match Info */}
        <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-right">
            اطلاعات مسابقه
          </h2>
          
          <div className="space-y-4">
              <div className="text-gray-300 text-right">
                <p className="mb-2">• با کلیک روی "شروع مسابقه" مسابقه ایجاد می‌شود</p>
                <p className="mb-2">• اگر مسابقه‌ای در انتظار باشد، به آن می‌پیوندید</p>
                <p className="mb-2">• هر سؤال زمان مخصوص خودش را دارد</p>
                <p className="mb-2">• زمان هر سؤال در پایین سؤال نمایش داده می‌شود</p>
                <p>• 5 سؤال تصادفی از بانک سؤالات انتخاب می‌شود</p>
              </div>
          </div>
        </div>

        {/* Match Actions */}
        <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-right">
            شروع مسابقه
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleCreateMatch}
                disabled={isSearching}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                شروع مسابقه
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Match Stats */}
        <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-right">
            آمار مسابقه
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent mb-1">5</div>
              <div className="text-gray-300 text-sm">تعداد سؤالات</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent mb-1">2</div>
              <div className="text-gray-300 text-sm">تعداد بازیکنان</div>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-right">
            نحوه بازی
          </h2>
          
          <div className="space-y-3 text-right text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">1</div>
              <p>روی "شروع مسابقه" کلیک کنید</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">2</div>
              <p>اگر مسابقه‌ای در انتظار باشد، به آن می‌پیوندید</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">3</div>
              <p>به 5 سؤال تصادفی پاسخ دهید</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">4</div>
              <p>نتایج را با حریف خود مقایسه کنید</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background-light rounded-2xl p-8 text-center max-w-md mx-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              در حال جستجو...
            </h3>
            <p className="text-gray-300 mb-4">
              منتظر حریف باشید یا در حال پیوستن به مسابقه...
            </p>
            <button
              onClick={handleCancelSearch}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              لغو
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
