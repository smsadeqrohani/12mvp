import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Dashboard-specific queries for the club/dashboard screen.
 * All queries are auth-aware and scoped to the current user.
 */

/** Dashboard stats: games played, wins/draws/losses. Goals scored = totalWins per product note. */
export const getDashboardStats = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();

    let totalGames = 0;
    let totalWins = 0;
    let totalDraws = 0;
    let totalLosses = 0;

    for (const p of participants) {
      const match = await ctx.db.get(p.matchId);
      if (!match || match.status !== "completed") continue;

      totalGames += 1;
      const result = await ctx.db
        .query("matchResults")
        .withIndex("by_match", (q: any) => q.eq("matchId", p.matchId))
        .unique();
      if (!result) continue;

      if (result.isDraw) {
        totalDraws += 1;
      } else if (result.winnerId === currentUserId) {
        totalWins += 1;
      } else {
        totalLosses += 1;
      }
    }

    return {
      totalGames,
      totalWins,
      totalDraws,
      totalLosses,
      /** Display as "goals scored"; per product, map to total wins. */
      goalsScored: totalWins,
    };
  },
});

/** Wins per tournament category for the current user (tournament winner in completed tournaments). */
export const getTournamentCategoryWins = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    const userParticipants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();

    const winsByCategory: Record<string, number> = {};

    for (const participant of userParticipants) {
      const tournament = await ctx.db
        .query("tournaments")
        .filter((q: any) => q.eq(q.field("tournamentId"), participant.tournamentId))
        .unique();
      if (!tournament || tournament.status !== "completed" || !tournament.categoryId) continue;

      const tournamentMatches = await ctx.db
        .query("tournamentMatches")
        .withIndex("by_tournament", (q: any) => q.eq("tournamentId", participant.tournamentId))
        .collect();
      const finalMatch = tournamentMatches.find((m: any) => m.round === "final");
      if (!finalMatch) continue;

      const matchResult = await ctx.db
        .query("matchResults")
        .withIndex("by_match", (q: any) => q.eq("matchId", finalMatch.matchId))
        .unique();
      if (!matchResult || matchResult.winnerId !== currentUserId) continue;

      const key = tournament.categoryId as string;
      winsByCategory[key] = (winsByCategory[key] ?? 0) + 1;
    }

    return Object.entries(winsByCategory).map(([categoryId, wins]) => ({
      categoryId: categoryId as Id<"categories">,
      wins,
    }));
  },
});

/** Dashboard sliders with resolved image URLs for position "dashboard". */
export const getDashboardSlidersWithUrls = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return [];

    const sliders = await ctx.db
      .query("sliders")
      .withIndex("by_position", (q: any) => q.eq("position", "dashboard"))
      .order("desc")
      .collect();

    const result: Array<{
      _id: Id<"sliders">;
      slides: Array<{ imageUrl: string | null; imagePath?: string; order: number }>;
    }> = [];

    for (const slider of sliders) {
      const slides = await Promise.all(
        slider.slides.map(async (s: any) => {
          let imageUrl: string | null = null;
          if (s.imagePath && s.imagePath.startsWith("http")) {
            imageUrl = s.imagePath;
          } else if (s.imageStorageId) {
            imageUrl = await ctx.storage.getUrl(s.imageStorageId);
          }
          return {
            imageUrl,
            imagePath: s.imagePath,
            order: s.order ?? 0,
          };
        })
      );
      slides.sort((a, b) => a.order - b.order);
      result.push({ _id: slider._id, slides });
    }

    return result;
  },
});
