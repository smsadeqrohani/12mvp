import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getRandomQuestions } from "./utils";
import { DEFAULT_AVATAR_ID } from "../shared/avatarOptions";
import { Id } from "./_generated/dataModel";

// Helper function to generate unique tournament ID
function generateTournamentId(): string {
  return `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to generate unique join code
async function generateUniqueJoinCode(ctx: any): Promise<string> {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters
  let code: string;
  let exists = true;
  
  // Try generating codes until we find a unique one
  while (exists) {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if code already exists
    const existingTournament = await ctx.db
      .query("tournaments")
      .withIndex("by_joinCode", (q: any) => q.eq("joinCode", code))
      .first();
    
    exists = !!existingTournament;
  }
  
  return code!;
}

/**
 * Core tournament operations - creating, joining, leaving tournaments
 */

export const createTournament = mutation({
  args: {
    categoryId: v.optional(v.id("categories")),
    isRandom: v.optional(v.boolean()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Check daily limit with stadium bonuses
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Get all tournaments created by user in last 24 hours (excluding cancelled)
    const allTournaments = await ctx.db
      .query("tournaments")
      .collect();
    
    const recentTournaments = allTournaments.filter(
      (tournament) => 
        tournament.creatorId === currentUserId && 
        tournament.createdAt > twentyFourHoursAgo &&
        tournament.status !== "cancelled"
    );
    
    // Calculate tournament limit including stadium bonuses
    const baseTournamentsLimit = 1;
    
    // Get active purchases and calculate bonuses
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    let tournamentsBonus = 0;
    
    for (const purchase of purchases) {
      // If durationMs is 0, item never expires
      const isActive = purchase.durationMs === 0 || (purchase.purchasedAt + purchase.durationMs > now);
      if (isActive) {
        // Purchase is still active
        const item = await ctx.db.get(purchase.itemId);
        if (item && item.itemType === "stadium" && item.tournamentsBonus) {
          tournamentsBonus += item.tournamentsBonus;
        }
      }
    }
    
    // Calculate total limit with bonuses
    const tournamentsLimit = baseTournamentsLimit + tournamentsBonus;
    
    if (recentTournaments.length >= tournamentsLimit) {
      throw new Error(`شما در 24 ساعت گذشته ${tournamentsLimit} تورنومنت ایجاد کرده‌اید. لطفاً صبر کنید تا محدودیت روزانه بازنشانی شود.`);
    }
    
    // If categoryId is provided, validate it exists
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new Error("Invalid category ID");
      }
    }
    
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now
    const tournamentId = generateTournamentId();
    
    // Determine if random (if no category specified, default to random)
    const isRandom = args.isRandom ?? (!args.categoryId);
    
    // Generate join code for private tournaments
    const isPrivate = args.isPrivate ?? false;
    const joinCode = isPrivate ? await generateUniqueJoinCode(ctx) : undefined;
    
    // Create new tournament in waiting state
    const tournamentDocId = await ctx.db.insert("tournaments", {
      status: "waiting",
      createdAt: now,
      expiresAt,
      creatorId: currentUserId,
      tournamentId,
      categoryId: args.categoryId,
      isRandom,
      isPrivate,
      joinCode,
    });
    
    // Add creator as first participant
    await ctx.db.insert("tournamentParticipants", {
      tournamentId,
      userId: currentUserId,
      joinedAt: now,
    });
    
    return { tournamentId, joinCode };
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

export const getTournamentByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    // Find tournament by join code
    const tournament = await ctx.db
      .query("tournaments")
      .withIndex("by_joinCode", (q: any) => q.eq("joinCode", args.joinCode))
      .first();
    
    if (!tournament) {
      return null;
    }
    
    // Check if tournament is waiting
    if (tournament.status !== "waiting") {
      return null;
    }
    
    // Check if tournament has expired
    if (Date.now() > tournament.expiresAt) {
      return null;
    }
    
    // Get participants
    const participants = await ctx.db
      .query("tournamentParticipants")
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament.tournamentId))
      .collect();
    
    // Get creator profile
    const creator = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", tournament.creatorId))
      .unique();
    
    return {
      tournamentId: tournament.tournamentId,
      createdAt: tournament.createdAt,
      expiresAt: tournament.expiresAt,
      creatorName: creator?.name || "Unknown",
      creatorAvatarId: creator?.avatarId ?? DEFAULT_AVATAR_ID,
      participantCount: participants.length,
      maxParticipants: 4,
      isUserCreator: tournament.creatorId === currentUserId,
      isAlreadyParticipant: participants.some(p => p.userId === currentUserId),
    };
  },
});

export const joinTournament = mutation({
  args: { 
    tournamentId: v.optional(v.string()),
    joinCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    if (!args.tournamentId && !args.joinCode) {
      throw new Error("Either tournamentId or joinCode must be provided");
    }
    
    let tournament;
    
    // Get tournament by ID or join code
    if (args.tournamentId) {
      tournament = await ctx.db
        .query("tournaments")
        .filter((q: any) => q.eq(q.field("tournamentId"), args.tournamentId))
        .unique();
    } else if (args.joinCode) {
      tournament = await ctx.db
        .query("tournaments")
        .withIndex("by_joinCode", (q: any) => q.eq("joinCode", args.joinCode))
        .first();
    }
    
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
      .withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament.tournamentId))
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
      tournamentId: tournament.tournamentId,
      userId: currentUserId,
      joinedAt: now,
    });
    
    // Update tournament if now has 4 participants
    if (participants.length === 3) {
      // Start the tournament - create matches
      await startTournament(ctx, tournament.tournamentId);
    }
    
    return tournament.tournamentId;
  },
});

async function startTournament(ctx: any, tournamentId: string) {
  // Get tournament details to check category
  const tournamentDoc = await ctx.db
    .query("tournaments")
    .filter((q: any) => q.eq(q.field("tournamentId"), tournamentId))
    .unique();
  
  if (!tournamentDoc) {
    throw new Error("Tournament not found");
  }
  
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
  
  // Get questions based on tournament category (or random if isRandom is true)
  const categoryId = tournamentDoc.isRandom ? undefined : tournamentDoc.categoryId;
  
  // Get random questions for semi-finals (same set for both)
  const semiQuestions = await getRandomQuestions(ctx, categoryId);
  
  // Get random questions for final (different from semi-finals)
  const finalQuestions = await getRandomQuestions(ctx, categoryId);
  
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
  
  // Don't create final match yet - will be created when both semifinals complete
  
  // Update tournament status
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
    
    // Filter out expired tournaments, private tournaments, and get tournament details
    const tournamentsWithDetails = await Promise.all(
      waitingTournaments
        .filter(tournament => tournament.expiresAt > now && !tournament.isPrivate) // Exclude private tournaments
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
          creatorAvatarId: creator?.avatarId ?? DEFAULT_AVATAR_ID,
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
    
    // Enrich matches with match details and participant info
    const enrichedMatches = await Promise.all(
      tournamentMatches.map(async (tm) => {
        const match = await ctx.db.get(tm.matchId);
        
        // Get match participants to check if current user has completed
        let currentUserCompleted = false;
        if (match) {
          const matchParticipants = await ctx.db
            .query("matchParticipants")
            .withIndex("by_match", (q: any) => q.eq("matchId", tm.matchId))
            .collect();
          
          const currentUserParticipant = matchParticipants.find(
            (p: any) => p.userId === currentUserId
          );
          
          currentUserCompleted = currentUserParticipant?.completedAt !== undefined;
        }
        
        return {
          ...tm,
          match,
          currentUserCompleted,
        };
      })
    );
    
    // Get category information if exists
    let category = null;
    if (tournament.categoryId) {
      category = await ctx.db.get(tournament.categoryId);
    }
    
    return {
      tournament: {
        ...tournament,
        category,
      },
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
          isPrivate: tournament.isPrivate ?? false,
          joinCode: tournament.joinCode,
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

export const checkTournamentMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    // Get tournament match entry
    const tournamentMatch = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_match", (q: any) => q.eq("matchId", args.matchId))
      .unique();
    
    return tournamentMatch;
  },
});


