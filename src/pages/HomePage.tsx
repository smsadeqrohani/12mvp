import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProfileSetup } from "../features/auth";
import { HelloPage, MatchLobby, QuizGame, MatchResults, MatchHistory } from "../features/game";
import { PageContainer, PageHeader, TabNavigation, Tab } from "../components/layout";
import { WaitingScreen } from "../components/match";
import { LoadingSpinner, PageLoader } from "../components/ui";
import { getStorageItem, setStorageItem } from "../lib/storage";
import { STORAGE_KEYS, MESSAGES } from "../lib/constants";
import { toast } from "sonner";

type TabType = "dashboard" | "new-match" | "history";
type GameState = "lobby" | "waiting" | "playing" | "results";

export function HomePage() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.auth.getUserProfile);
  const userMatchStatus = useQuery(api.matches.getUserActiveMatchStatus);
  const leaveMatch = useMutation(api.matches.leaveMatch);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>(() => 
    getStorageItem(STORAGE_KEYS.ACTIVE_TAB, "dashboard" as TabType)
  );
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [currentMatchId, setCurrentMatchId] = useState<Id<"matches"> | null>(null);
  const [viewingMatchId, setViewingMatchId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (loggedInUser === null) {
      navigate("/login", { replace: true });
    }
  }, [loggedInUser, navigate]);

  // Unified match status monitoring - handles all auto-join scenarios
  useEffect(() => {
    if (!userMatchStatus || isResetting) return;
    
    console.log("Match status changed:", userMatchStatus.status, "Current gameState:", gameState);
    
    if (userMatchStatus.status === "active") {
      // Match became active - both players auto-join
      if (gameState === "waiting" || gameState === "lobby") {
        console.log("Match became active, auto-joining game...");
        setTimeout(() => {
          setGameState("playing");
          setCurrentMatchId(userMatchStatus.matchId);
          setActiveTab("new-match");
          toast.success(MESSAGES.MATCH.OPPONENT_FOUND);
        }, 100);
      }
    } else if (userMatchStatus.status === "waiting") {
      // Match is waiting for opponent
      if (gameState === "lobby") {
        console.log("Match is waiting, transitioning to waiting state...");
        setGameState("waiting");
        setCurrentMatchId(userMatchStatus.matchId);
        setActiveTab("new-match");
      }
    } else if (userMatchStatus.status === "cancelled") {
      // Match was cancelled
      if (gameState === "waiting" || gameState === "playing") {
        console.log("Match was cancelled, resetting to lobby...");
        setGameState("lobby");
        setCurrentMatchId(null);
        setActiveTab("dashboard");
        toast.info(MESSAGES.MATCH.MATCH_CANCELLED);
      }
    }
  }, [userMatchStatus?.status, userMatchStatus?.matchId, gameState, isResetting]);

  // Initialize state from existing match on page load
  useEffect(() => {
    if (userMatchStatus && gameState === "lobby") {
      console.log("Initializing state from existing match:", userMatchStatus);
      if (userMatchStatus.status === "waiting") {
        setGameState("waiting");
        setCurrentMatchId(userMatchStatus.matchId);
        setActiveTab("new-match");
      } else if (userMatchStatus.status === "active") {
        setGameState("playing");
        setCurrentMatchId(userMatchStatus.matchId);
        setActiveTab("new-match");
      }
    }
  }, [userMatchStatus?.status, userMatchStatus?.matchId]);

  // Handlers
  const handleMatchStart = (matchId: Id<"matches">) => {
    console.log("handleMatchStart called with matchId:", matchId);
  };

  const handleMatchFound = (matchId: Id<"matches">) => {
    console.log("handleMatchFound called with matchId:", matchId);
  };

  const handleGameComplete = () => {
    setGameState("results");
  };

  const handlePlayAgain = () => {
    setIsResetting(true);
    setCurrentMatchId(null);
    setGameState("lobby");
    setActiveTab("dashboard");
    setStorageItem(STORAGE_KEYS.ACTIVE_TAB, "dashboard");
    setTimeout(() => setIsResetting(false), 500);
  };

  const handleCancelMatch = async () => {
    try {
      if (userMatchStatus?.matchId) {
        await leaveMatch({ matchId: userMatchStatus.matchId });
      }
      toast.success(MESSAGES.MATCH.MATCH_CANCELLED);
      handlePlayAgain();
    } catch (error) {
      toast.error("خطا در لغو مسابقه: " + (error as Error).message);
      handlePlayAgain();
    }
  };

  const handleViewMatch = (matchId: string) => {
    setViewingMatchId(matchId);
    setActiveTab("history");
  };

  const handleBackToHistory = () => {
    setViewingMatchId(null);
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setStorageItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
  };

  // Loading state
  if (loggedInUser === undefined || userProfile === undefined) {
    return <PageLoader message="در حال بارگذاری اطلاعات کاربر..." />;
  }

  // Redirecting state
  if (loggedInUser === null) {
    return <PageLoader message="در حال انتقال به صفحه ورود..." />;
  }

  // User setup required
  if (!userProfile) {
    return <ProfileSetup />;
  }

  // Game states with full screen rendering
  if (gameState === "waiting" && currentMatchId) {
    return <WaitingScreen onCancel={handleCancelMatch} />;
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

  // Match viewer from history
  if (viewingMatchId) {
    return (
      <PageContainer>
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
      </PageContainer>
    );
  }

  // Main dashboard with tabs
  const tabs: Tab<TabType>[] = [
    { id: "dashboard", label: "داشبورد" },
    { id: "new-match", label: "مسابقه جدید" },
    { id: "history", label: "تاریخچه" },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title={`سلام، ${userProfile.name}!`}
        subtitle="به داشبورد مسابقات کویز خوش آمدید"
      />

      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

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
    </PageContainer>
  );
}
