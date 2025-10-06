import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ProfileSetup } from "./ProfileSetup";
import { HelloPage } from "./HelloPage";
import { MatchLobby } from "./MatchLobby";
import { QuizGame } from "./QuizGame";
import { MatchResults } from "./MatchResults";
import { MatchHistory } from "./MatchHistory";
import { toast } from "sonner";

type TabType = "dashboard" | "new-match" | "history";
type GameState = "lobby" | "waiting" | "playing" | "results";

export function HomePage() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);
  const navigate = useNavigate();
  const cancelMatch = useMutation(api.auth.cancelMatch);
  
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved as TabType) || "new-match";
  });
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [currentMatchId, setCurrentMatchId] = useState<Id<"matches"> | null>(null);
  const [viewingMatchId, setViewingMatchId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Always call useEffect at the top level
  useEffect(() => {
    if (loggedInUser === null) {
      navigate("/login", { replace: true });
    }
  }, [loggedInUser, navigate]);

  // Show loading while checking authentication
  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (loggedInUser === null) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // User is not set up yet
  if (!userProfile) {
    return <ProfileSetup />;
  }

  const handleMatchStart = (matchId: Id<"matches">) => {
    setCurrentMatchId(matchId);
    setGameState("waiting");
    setActiveTab("new-match");
  };

  const handleMatchFound = (matchId: Id<"matches">) => {
    setCurrentMatchId(matchId);
    setGameState("playing");
    setActiveTab("new-match");
  };

  const handleGameComplete = () => {
    setGameState("results");
  };

  const handlePlayAgain = async () => {
    try {
      if (currentMatchId) {
        await cancelMatch({ matchId: currentMatchId });
        toast.success("مسابقه لغو شد");
      }
      setIsResetting(true);
      setCurrentMatchId(null);
      setGameState("lobby");
      setActiveTab("new-match");
      localStorage.setItem('activeTab', 'new-match');
      setTimeout(() => {
        setIsResetting(false);
      }, 1000);
    } catch (error) {
      console.error("Error cancelling match:", error);
      toast.error("خطا در لغو مسابقه: " + (error as Error).message);
      // Still reset the UI even if cancel fails
      setIsResetting(true);
      setCurrentMatchId(null);
      setGameState("lobby");
      setActiveTab("new-match");
      localStorage.setItem('activeTab', 'new-match');
      setTimeout(() => {
        setIsResetting(false);
      }, 1000);
    }
  };

  const handleViewMatch = (matchId: string) => {
    setViewingMatchId(matchId);
    setActiveTab("history");
  };

  const handleBackToHistory = () => {
    setViewingMatchId(null);
  };

  // Render game components based on state
  if (gameState === "waiting" && currentMatchId) {
    return (
      <div className="w-full max-w-none px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background-light/60 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-4">
              منتظر حریف...
            </h2>
            <p className="text-gray-300 mb-6">
              منتظر بمانید تا حریف دیگری به مسابقه بپیوندد
            </p>
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
            >
              لغو مسابقه
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "playing" && currentMatchId) {
    return (
      <QuizGame 
        matchId={currentMatchId} 
        onGameComplete={handleGameComplete}
        onLeaveMatch={handlePlayAgain}
      />
    );
  }

  if (gameState === "results" && currentMatchId) {
    return (
      <MatchResults 
        matchId={currentMatchId} 
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (viewingMatchId) {
    return (
      <div className="w-full max-w-none px-6 py-8">
        <div className="mb-6">
          <button
            onClick={handleBackToHistory}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            بازگشت به تاریخچه
          </button>
        </div>
        <MatchResults 
          matchId={viewingMatchId as Id<"matches">} 
          onPlayAgain={handleBackToHistory}
        />
      </div>
    );
  }

  // Main dashboard with tabs
  return (
    <div className="w-full max-w-none px-6 py-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">
          سلام، {userProfile.name}! 👋
        </h1>
        <p className="text-lg text-gray-300">
          به داشبورد مسابقات کویز خوش آمدید
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-background-light/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-1">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                localStorage.setItem('activeTab', 'dashboard');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-accent text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              داشبورد
            </button>
            <button
              onClick={() => {
                setActiveTab("new-match");
                localStorage.setItem('activeTab', 'new-match');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "new-match"
                  ? "bg-accent text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              مسابقه جدید
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                localStorage.setItem('activeTab', 'history');
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-accent text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              تاریخچه
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "dashboard" && <HelloPage />}
        {activeTab === "new-match" && (
          <MatchLobby 
            onMatchStart={handleMatchStart}
            onMatchFound={handleMatchFound}
            isResetting={isResetting}
          />
        )}
        {activeTab === "history" && (
          <MatchHistory onViewMatch={handleViewMatch} />
        )}
      </div>
    </div>
  );
}
