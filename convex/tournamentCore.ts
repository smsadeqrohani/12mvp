import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getRandomQuestions } from "./utils";
import { Id } from "./_generated/dataModel";

// Helper function to generate unique tournament ID
function generateTournamentId(): string {
  return `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Core tournament operations - creating, joining, leaving tournaments
 */

export const createTournament = mutation({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now
    const tournamentId = generateTournamentId();
    
    // Create new tournament in waiting state
    const tournamentDocId = await ctx.db.insert("tournaments", {
      status: "waiting",
      createdAt: now,
      expiresAt,
      creatorId: currentUserId,
      tournamentId,
    });
    
    // Add creator as first participant
    await ctx.db.insert("tournamentParticipants", {
      tournamentId,
      userId: currentUserId,
      joinedAt: now,
    });
    
    return tournamentId;
  },
});

export const getUserActiveTournaments = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    const userParticipants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const activeTournaments = [];
    
    for (const participant of userParticipants) {
      const tournament = await ctx.db
        .query("tournaments")
        .filter((q: any) => q.eq(q.field("tournamentId"), participant.tournamentId))
        .unique();
      
      if (tournament && (tournament.status === "active" || tournament.status === "waiting")) {
        // Get other participants count
        const allParticipants = await ctx.db
          .query("tournamentParticipants")
          .withIndex("by_tournament", (q: any) => q.eq("tournamentId", participant.tournamentId))
          .collect();
        
        activeTournaments.push({
          tournamentId: tournament.tournamentId,
          status: tournament.status,
          createdAt: tournament.createdAt,
          startedAt: tournament.startedAt,
          participantsCount: allParticipants.length,
          maxParticipants: 4,
        });
      }
    }
    
    // Sort by createdAt (most recent first)
    return activeTournaments.sort((a, b) => (b.createdAt - a.createdAt));
  },
});

export const joinTournament = mutation({
  args: { tournamentId: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    // Check if tournament is waiting
    if (tournament.status !== "waiting") {
      throw new Error("Tournament is not available for joining");
    }
    
    // Check if tournament has expired
    if (Date.now() > tournament.expiresAt) {
      throw new Error("Tournament has expired");
    }
    
    // Get participants
    const participants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    // Check if user is already a participant
    if (participants.some(p => p.userId === currentUserId)) {
      throw new Error("You are already in this tournament");
    }
    
    // Check if tournament is full
    if (participants.length >= 4) {
      throw new Error("Tournament is full");
    }
    
    const now = Date.now();
    
    // Add user as participant
    await ctx.db.insert("tournamentParticipants", {
      tournamentId: args.tournamentId,
      userId: currentUserId,
      joinedAt: now,
    });
    
    // Update tournament if now has 4 participants
    if (participants.length === 3) {
      // Start the tournament - create matches
      await startTournament(ctx, args.tournamentId);
    }
    
    return args.tournamentId;
  },
});

async function startTournament(ctx: any, tournamentId: string) {
  // Get all participants
  const participants = await ctx.db
    .query("tournamentParticipants")
    .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournamentId))
    .collect();
  
  if (participants.length !== 4) {
    throw new Error("Tournament must have exactly 4 participants");
  }
  
  // Shuffle participants
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  // Get random questions for semi-finals (same set for both)
  const semiQuestions = await getRandomQuestions(ctx);
  
  // Get random questions for final (different from semi-finals)
  const finalQuestions = await getRandomQuestions(ctx);
  
  // Create semi-final 1: player 1 vs player 2
  const semi1MatchId = await createTournamentMatch(
    ctx,
    tournamentId,
    shuffled[0].userId,
    shuffled[1].userId,
    "semi1",
    semiQuestions
  );
  
  // Create semi-final 2: player 3 vs player 4
  const semi2MatchId = await createTournamentMatch(
    ctx,
    tournamentId,
    shuffled[2].userId,
    shuffled[3].userId,
    "semi2",
    semiQuestions
  );
  
  // Create final match (placeholder - will be updated when winners are determined)
  // We don't create an actual match yet, just a tournament match entry
  const finalTournamentMatchId = await ctx.db.insert("tournamentMatches", {
    tournamentId,
    matchId: semi1MatchId, // Placeholder - no actual match until semifinals complete
    round: "final",
    player1Id: shuffled[0].userId, // Placeholder - Winner of Semi 1
    player2Id: shuffled[2].userId, // Placeholder - Winner of Semi 2
    status: "waiting",
  });
  
  // Update tournament status
  const tournamentDoc = await ctx.db
    .query("tournaments")
    .filter((q: any) => q.eq(q.field("tournamentId"), tournamentId))
    .unique();
  
  if (!tournamentDoc) {
    throw new Error("Tournament not found");
  }
  
  await ctx.db.patch(tournamentDoc._id, {
    status: "active",
    startedAt: Date.now(),
  });
  
  return { semi1MatchId, semi2MatchId };
}

async function createTournamentMatch(
  ctx: any,
  tournamentId: string,
  player1Id: Id<"users">,
  player2Id: Id<"users">,
  round: "semi1" | "semi2" | "final",
  questions: Id<"questions">[]
) {
  const now = Date.now();
  const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours
  
  // Create match
  const matchId = await ctx.db.insert("matches", {
    status: "waiting",
    createdAt: now,
    expiresAt,
    questions,
    creatorId: player1Id,
  });
  
  // Add both players as participants
  await ctx.db.insert("matchParticipants", {
    matchId,
    userId: player1Id,
    joinedAt: now,
  });
  
  await ctx.db.insert("matchParticipants", {
    matchId,
    userId: player2Id,
    joinedAt: now,
  });
  
  // Create tournament match reference
  await ctx.db.insert("tournamentMatches", {
    tournamentId,
    matchId,
    round,
    player1Id,
    player2Id,
    status: "waiting",
  });
  
  // Auto-start the match
  await ctx.db.patch(matchId, {
    status: "active",
    startedAt: now,
    currentQuestionIndex: 0,
  });
  
  const tournamentMatch = await ctx.db
    .query("tournamentMatches")
    .filter((q: any) => q.eq(q.field("matchId"), matchId))
    .unique();
  
  if (tournamentMatch) {
    await ctx.db.patch(tournamentMatch._id, { status: "active" });
  }
  
  return matchId;
}

export const cancelTournament = mutation({
  args: { tournamentId: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    // Check if user is the creator or admin
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    const isCreator = tournament.creatorId === currentUserId;
    const isAdmin = profile?.isAdmin || false;
    
    if (!isCreator && !isAdmin) {
      throw new Error("Only the creator or admin can cancel the tournament");
    }
    
    // Check if tournament can be cancelled
    if (tournament.status === "completed" || tournament.status === "cancelled") {
      throw new Error("Cannot cancel a completed or already cancelled tournament");
    }
    
    const tournamentDoc = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (tournamentDoc) {
      // Update tournament status
      await ctx.db.patch(tournamentDoc._id, {
        status: "cancelled",
        completedAt: Date.now(),
      });
    }
    
    // Get all tournament matches
    const tournamentMatches = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    // Cancel all associated matches that are still active
    for (const tm of tournamentMatches) {
      if (tm.status === "active" || tm.status === "waiting") {
        const match = await ctx.db.get(tm.matchId);
        if (match && (match.status === "active" || match.status === "waiting")) {
          await ctx.db.patch(tm.matchId, {
            status: "cancelled",
            completedAt: Date.now(),
          });
        }
      }
    }
    
    // Remove all participants
    const participants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }
    
    return true;
  },
});

export const getWaitingTournaments = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    // Get all waiting tournaments
    const waitingTournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_status", (q: any) => q.eq("status", "waiting"))
      .collect();
    
    const now = Date.now();
    
    // Filter out expired tournaments and get tournament details
    const tournamentsWithDetails = await Promise.all(
      waitingTournaments
        .filter(tournament => tournament.expiresAt > now)
        .map(async (tournament) => {
          const participants = await ctx.db
            .query("tournamentParticipants")
            .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament.tournamentId))
            .collect();
          
          // Get creator profile
          const creator = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q: any) => q.eq("userId", tournament.creatorId))
            .unique();
          
          // Check if user is already a participant
          const isUserParticipant = participants.some(p => p.userId === currentUserId);
          
          return {
            tournamentId: tournament.tournamentId,
            createdAt: tournament.createdAt,
            expiresAt: tournament.expiresAt,
            creatorName: creator?.name || "Unknown",
            participantCount: participants.length,
            isUserCreator: tournament.creatorId === currentUserId,
            isUserParticipant, // Add this field
          };
        })
    );
    
    // Filter out tournaments the user has already joined
    const availableTournaments = tournamentsWithDetails.filter(t => !t.isUserParticipant);
    
    // Sort by createdAt (most recent first)
    return availableTournaments.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const checkTournamentParticipation = query({
  args: { tournamentId: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return false;
    }
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      return false;
    }
    
    // Check if user is participant
    const participant = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .filter((q: any) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    return !!participant;
  },
});

export const getTournamentDetails = query({
  args: { tournamentId: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    // Check if user is participant
    const participant = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .filter((q: any) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this tournament");
    }
    
    // Get all participants with their profiles
    const participants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    const participantsWithProfiles = await Promise.all(
      participants.map(async (p) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
          .unique();
        return {
          ...p,
          profile,
        };
      })
    );
    
    // Get all tournament matches
    const tournamentMatches = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    // Enrich matches with match details
    const enrichedMatches = await Promise.all(
      tournamentMatches.map(async (tm) => {
        const match = await ctx.db.get(tm.matchId);
        return {
          ...tm,
          match,
        };
      })
    );
    
    return {
      tournament,
      participants: participantsWithProfiles,
      matches: enrichedMatches,
    };
  },
});

export const getMyWaitingTournaments = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    // Get all waiting tournaments created by user
    const allTournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_status", (q: any) => q.eq("status", "waiting"))
      .collect();
    
    const myTournaments = allTournaments.filter(tournament => tournament.creatorId === currentUserId);
    
    const tournamentsWithDetails = await Promise.all(
      myTournaments.map(async (tournament) => {
        const participants = await ctx.db
          .query("tournamentParticipants")
          .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament.tournamentId))
          .collect();
        
        return {
          tournamentId: tournament.tournamentId,
          createdAt: tournament.createdAt,
          expiresAt: tournament.expiresAt,
          participantCount: participants.length,
        };
      })
    );
    
    // Sort by createdAt (most recent first)
    return tournamentsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const leaveTournament = mutation({
  args: { tournamentId: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    if (tournament.status === "completed") {
      throw new Error("Cannot leave completed tournament");
    }
    
    // Find user's participation
    const participant = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .filter((q: any) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this tournament");
    }
    
    // Remove participant
    await ctx.db.delete(participant._id);
    
    // Get remaining participants
    const remainingParticipants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    // Cancel tournament if no participants left
    if (remainingParticipants.length === 0) {
      const tournamentDoc = await ctx.db
        .query("tournaments")
        .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
        .unique();
      
      if (tournamentDoc) {
        // Cancel the tournament
        await ctx.db.patch(tournamentDoc._id, {
          status: "cancelled",
          completedAt: Date.now(),
        });
      }
    }
    
    return true;
  },
});
