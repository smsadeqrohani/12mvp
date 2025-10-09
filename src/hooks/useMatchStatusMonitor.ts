import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GameState } from "./useGameState";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface UseMatchStatusMonitorProps {
  gameState: GameState;
  isResetting: boolean;
  onMatchWaiting: (matchId: Id<"matches">) => void;
  onMatchActive: (matchId: Id<"matches">) => void;
  onMatchCancelled: () => void;
}

export function useMatchStatusMonitor({
  gameState,
  isResetting,
  onMatchWaiting,
  onMatchActive,
  onMatchCancelled,
}: UseMatchStatusMonitorProps) {
  const userMatchStatus = useQuery(api.matches.getUserActiveMatchStatus);

  // Monitor match status changes
  useEffect(() => {
    if (!userMatchStatus || isResetting) return;

    console.log("Match status changed:", userMatchStatus.status, "Current gameState:", gameState);

    // Handle match becoming active
    if (userMatchStatus.status === "active") {
      if (gameState === "waiting" || gameState === "lobby") {
        console.log("Match became active, auto-joining to game...");
        setTimeout(() => {
          onMatchActive(userMatchStatus.matchId);
          toast.success("حریف پیدا شد! مسابقه شروع شد");
        }, 100);
      }
    } 
    // Handle match waiting for opponent
    else if (userMatchStatus.status === "waiting") {
      if (gameState === "lobby") {
        console.log("Match is waiting, transitioning to waiting state...");
        onMatchWaiting(userMatchStatus.matchId);
      }
    } 
    // Handle match cancellation
    else if (userMatchStatus.status === "cancelled") {
      if (gameState === "waiting" || gameState === "playing") {
        console.log("Match was cancelled, resetting to lobby...");
        onMatchCancelled();
        toast.info("مسابقه لغو شد");
      }
    }
  }, [userMatchStatus?.status, userMatchStatus?.matchId, gameState, isResetting, onMatchWaiting, onMatchActive, onMatchCancelled]);

  // Initialize state from existing match on page load
  useEffect(() => {
    if (userMatchStatus && gameState === "lobby") {
      console.log("Initializing state from existing match:", userMatchStatus);
      if (userMatchStatus.status === "waiting") {
        onMatchWaiting(userMatchStatus.matchId);
      } else if (userMatchStatus.status === "active") {
        onMatchActive(userMatchStatus.matchId);
      }
    }
  }, [userMatchStatus?.status, userMatchStatus?.matchId]);

  return userMatchStatus;
}

