/**
 * Match management - Main barrel export
 * 
 * This file re-exports all match-related operations from specialized modules:
 * - matchCore: Core operations (create, join, leave, get details)
 * - matchGameplay: Gameplay operations (submit answers, check completion)
 * - matchResults: Results and history
 * - matchAdmin: Admin operations
 */

// Core match operations
export {
  createMatch,
  joinMatch,
  cancelMatch,
  getMatchDetails,
  getUserActiveMatch,
  getUserActiveMatches,
  getUserPendingResultsMatches,
  getUserActiveMatchStatus,
  getWaitingMatches,
  getMyWaitingMatches,
  leaveMatch,
} from "./matchCore";

// Gameplay operations
export {
  submitAnswer,
  checkMatchCompletion,
} from "./matchGameplay";

// Results and history
export {
  getMatchResults,
  getUserMatchHistory,
  getMatchResultsPartial,
} from "./matchResults";

// Admin operations (for admin panel only)
export {
  getAllMatches,
  cancelMatch as adminCancelMatch,
} from "./matchAdmin";
