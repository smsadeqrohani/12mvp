import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAuth } from "./utils";

/**
 * Tournament admin operations
 */

export const getAllTournaments = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if user is admin
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    if (!profile?.isAdmin) {
      throw new Error("Not authorized");
    }
    
    // Get all tournaments
    const tournaments = await ctx.db.query("tournaments").collect();
    
    // Enrich with participant data
    const enrichedTournaments = await Promise.all(
      tournaments.map(async (tournament) => {
        const participants = await ctx.db
          .query("tournamentParticipants")
          .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament.tournamentId))
          .collect();
        
        const participantsWithProfiles = await Promise.all(
          participants.map(async (p) => {
            const participantProfile = await ctx.db
              .query("profiles")
              .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
              .unique();
            return {
              ...p,
              profile: participantProfile,
            };
          })
        );
        
        // Get creator profile
        const creator = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", tournament.creatorId))
          .unique();
        
        // Get tournament matches
        const tournamentMatches = await ctx.db
          .query("tournamentMatches")
          .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament.tournamentId))
          .collect();
        
        const enrichedMatches = await Promise.all(
          tournamentMatches.map(async (tm) => {
            const match = await ctx.db.get(tm.matchId);
            const matchResult = await ctx.db
              .query("matchResults")
              .withIndex("by_match", (q: any) => q.eq("matchId", tm.matchId))
              .unique();
            
            return {
              ...tm,
              match,
              result: matchResult,
            };
          })
        );
        
        return {
          tournament,
          creator,
          participants: participantsWithProfiles,
          matches: enrichedMatches,
        };
      })
    );
    
    // Sort by createdAt (most recent first)
    return enrichedTournaments.sort((a, b) => b.tournament.createdAt - a.tournament.createdAt);
  },
});

export const getTournamentDetailsAdmin = query({
  args: { tournamentId: require("convex/values").v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Check if user is admin
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    if (!profile?.isAdmin) {
      throw new Error("Not authorized");
    }
    
    // Get tournament
    const tournament = await ctx.db
      .query("tournaments")
      .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
      .unique();
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    // Get all participants
    const participants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    const participantsWithProfiles = await Promise.all(
      participants.map(async (p) => {
        const participantProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", p.userId))
          .unique();
        return {
          ...p,
          profile: participantProfile,
        };
      })
    );
    
    // Get creator profile
    const creator = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", tournament.creatorId))
      .unique();
    
    // Get all tournament matches
    const tournamentMatches = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", args.tournamentId))
      .collect();
    
    const enrichedMatches = await Promise.all(
      tournamentMatches.map(async (tm) => {
        const match = await ctx.db.get(tm.matchId);
        const matchResult = await ctx.db
          .query("matchResults")
          .withIndex("by_match", (q: any) => q.eq("matchId", tm.matchId))
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
      creator,
      participants: participantsWithProfiles,
      matches: enrichedMatches,
    };
  },
});
