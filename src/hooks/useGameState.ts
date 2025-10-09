import { useState, useCallback, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

export type GameState = "lobby" | "waiting" | "playing" | "results";

interface UseGameStateReturn {
  gameState: GameState;
  currentMatchId: Id<"matches"> | null;
  isResetting: boolean;
  setToLobby: () => void;
  setToWaiting: (matchId: Id<"matches">) => void;
  setToPlaying: (matchId: Id<"matches">) => void;
  setToResults: () => void;
  resetGame: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [currentMatchId, setCurrentMatchId] = useState<Id<"matches"> | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const setToLobby = useCallback(() => {
    setGameState("lobby");
    setCurrentMatchId(null);
  }, []);

  const setToWaiting = useCallback((matchId: Id<"matches">) => {
    setGameState("waiting");
    setCurrentMatchId(matchId);
  }, []);

  const setToPlaying = useCallback((matchId: Id<"matches">) => {
    setGameState("playing");
    setCurrentMatchId(matchId);
  }, []);

  const setToResults = useCallback(() => {
    setGameState("results");
  }, []);

  const resetGame = useCallback(() => {
    setIsResetting(true);
    setCurrentMatchId(null);
    setGameState("lobby");
    
    // Short reset delay to prevent race conditions
    setTimeout(() => {
      setIsResetting(false);
    }, 500);
  }, []);

  return {
    gameState,
    currentMatchId,
    isResetting,
    setToLobby,
    setToWaiting,
    setToPlaying,
    setToResults,
    resetGame,
  };
}

