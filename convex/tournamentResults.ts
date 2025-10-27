import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Tournament results and history operations
 */

export const getUserTournamentHistory = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    // Get all tournaments user participated in
    const userParticipants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const tournamentHistory = [];
    
    for (const participant of userParticipants) {
      const tournament = await ctx.db
        .query("tournaments")
        .filter((q) => q.eq(q.field("tournamentId"), participant.tournamentId))
        .unique();
      
      if (!tournament) continue;
      
      // Get all participants
      const allParticipants = await ctx.db
        .query("tournamentParticipants")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", participant.tournamentId))
        .collect();
      
      const participantsWithProfiles = await Promise.all(
        allParticipants.map(async (p) => {
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
      
      // Get all matches
      const tournamentMatches = await ctx.db
        .query("tournamentMatches")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", participant.tournamentId))
        .collect();
      
      const enrichedMatches = await Promise.all(
        tournamentMatches.map(async (tm) => {
          const match = await ctx.db.get(tm.matchId);
          const matchResult = await ctx.db
            .query("matchResults")
            .withIndex("by_match", (q) => q.eq("matchId", tm.matchId))
            .unique();
          return {
            ...tm,
            match,
            result: matchResult,
          };
        })
      );
      
      // Determine if user won
      let userWon = false;
      if (tournament.status === "completed" && enrichedMatches.length > 0) {
        const finalMatch = enrichedMatches.find(m => m.round === "final");
        if (finalMatch?.result?.winnerId === currentUserId) {
          userWon = true;
        }
      }
      
      tournamentHistory.push({
        tournament,
        participants: participantsWithProfiles,
        matches: enrichedMatches,
        userWon,
      });
    }
    
    // Sort by createdAt (most recent first)
    return tournamentHistory.sort((a, b) => b.tournament.createdAt - a.tournament.createdAt);
  },
});

export const getTournamentResults = query({
  args: { tournamentId: require("convex/values").v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    // Get all participants
    const participants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
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
    
    // Get all matches with results
    const tournamentMatches = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    const enrichedMatches = await Promise.all(
      tournamentMatches.map(async (tm) => {
        const match = await ctx.db.get(tm.matchId);
        const matchResult = await ctx.db
          .query("matchResults")
          .withIndex("by_match", (q) => q.eq("matchId", tm.matchId))
          .unique();
        
        // Get player profiles
        const player1Profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", tm.player1Id))
          .unique();
        
        const player2Profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", tm.player2Id))
          .unique();
        
        return {
          ...tm,
          match,
          result: matchResult,
          player1Profile,
          player2Profile,
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
