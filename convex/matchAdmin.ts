import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./utils";

/**
 * Admin functions for match management
 */

export const getAllMatches = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Get paginated matches
    const paginatedResult = await ctx.db
      .query("matches")
      .order("desc")
      .paginate(args.paginationOpts);
    
    // Get participants and profiles for each match
    const matchesWithDetails = await Promise.all(
      paginatedResult.page.map(async (match) => {
        const participants = await ctx.db
          .query("matchParticipants")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))
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
        
        // Get creator profile (if exists)
        let creatorProfile = null;
        if (match.creatorId) {
          creatorProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q: any) => q.eq("userId", match.creatorId))
            .unique();
        }
        
        // Get result if completed
        let result = null;
        if (match.status === "completed") {
          result = await ctx.db
            .query("matchResults")
            .withIndex("by_match", (q) => q.eq("matchId", match._id))
            .unique();
        }
        
        // Check if this match is part of a tournament
        const tournamentMatch = await ctx.db
          .query("tournamentMatches")
          .withIndex("by_match", (q: any) => q.eq("matchId", match._id))
          .unique();
        
        let tournamentInfo = null;
        if (tournamentMatch) {
          const tournament = await ctx.db
            .query("tournaments")
            .filter((q: any) => q.eq(q.field("tournamentId"), tournamentMatch.tournamentId))
            .unique();
          
          if (tournament) {
            tournamentInfo = {
              tournamentId: tournamentMatch.tournamentId,
              round: tournamentMatch.round,
              tournament: tournament,
            };
          }
        }
        
        return {
          match,
          participants: participantsWithProfiles,
          creator: creatorProfile,
          result,
          tournamentInfo,
        };
      })
    );
    
    return {
      page: matchesWithDetails,
      isDone: paginatedResult.isDone,
      continueCursor: paginatedResult.continueCursor,
    };
  },
});

export const cancelMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    if (match.status === "completed") {
      throw new Error("Cannot cancel completed match");
    }
    
    // Cancel the match
    await ctx.db.patch(args.matchId, {
      status: "cancelled",
      completedAt: Date.now(),
    });
    
    // Remove all participants
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }
    
    return true;
  },
});

export const expireOldMatches = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all matches that have expired
    const allMatches = await ctx.db.query("matches").collect();
    
    const expiredMatches = allMatches.filter(
      match => 
        match.expiresAt <= now && 
        (match.status === "waiting" || match.status === "active")
    );
    
    console.log(`Found ${expiredMatches.length} expired matches to cancel`);
    
    // Cancel each expired match
    for (const match of expiredMatches) {
      // Update match status
      await ctx.db.patch(match._id, {
        status: "cancelled",
        completedAt: now,
      });
      
      // Remove all participants
      const participants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();
      
      for (const participant of participants) {
        await ctx.db.delete(participant._id);
      }
      
      console.log(`Cancelled expired match ${match._id}`);
    }
    
    return { cancelledCount: expiredMatches.length };
  },
});

