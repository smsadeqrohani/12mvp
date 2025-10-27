/**
 * Tournament management - Main barrel export
 * 
 * This file re-exports all tournament-related operations from specialized modules:
 * - tournamentCore: Core operations (create, join, leave, get details)
 * - tournamentResults: Results and history
 */

// Core tournament operations
export {
  createTournament,
  joinTournament,
  cancelTournament,
  checkTournamentParticipation,
  getTournamentDetails,
  getUserActiveTournaments,
  getWaitingTournaments,
  getMyWaitingTournaments,
  leaveTournament,
  checkTournamentMatch,
} from "./tournamentCore";

// Results and history
export {
  getUserTournamentHistory,
  getTournamentResults,
} from "./tournamentResults";

// Admin operations
export {
  getAllTournaments,
  getTournamentDetailsAdmin,
} from "./tournamentAdmin";
