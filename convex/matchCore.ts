import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getRandomQuestions } from "./utils";
import { DEFAULT_AVATAR_ID } from "../shared/avatarOptions";

// Helper function to get categories for a question
async function getQuestionCategories(ctx: any, questionId: string) {
  const questionCategories = await ctx.db
    .query("questionCategories")
    .withIndex("by_question", (q: any) => q.eq("questionId", questionId))
    .collect();

  const categories = await Promise.all(
    questionCategories.map(async (qc: any) => {
      const category = await ctx.db.get(qc.categoryId);
      return category;
    })
  );

  return categories.filter(Boolean);
}

/**
 * Core match operations - creating, joining, leaving matches
 */

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
    const existingMatch = await ctx.db
      .query("matches")
      .withIndex("by_joinCode", (q: any) => q.eq("joinCode", code))
      .first();
    
    exists = !!existingMatch;
  }
  
  return code!;
}

export const createMatch = mutation({
  args: {
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Check daily limit with stadium bonuses
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Get all matches created by user in last 24 hours (excluding cancelled)
    const allMatches = await ctx.db
      .query("matches")
      .collect();
    
    const recentMatches = allMatches.filter(
      (match) => 
        match.creatorId === currentUserId && 
        match.createdAt > twentyFourHoursAgo &&
        match.status !== "cancelled"
    );
    
    // Calculate match limit including stadium bonuses
    const baseMatchesLimit = 3;
    
    // Get active purchases and calculate bonuses
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    let matchesBonus = 0;
    
    for (const purchase of purchases) {
      // If durationMs is 0, item never expires
      const isActive = purchase.durationMs === 0 || (purchase.purchasedAt + purchase.durationMs > now);
      if (isActive) {
        // Purchase is still active
        const item = await ctx.db.get(purchase.itemId);
        if (item && item.itemType === "stadium" && item.matchesBonus) {
          matchesBonus += item.matchesBonus;
        }
      }
    }
    
    // Calculate total limit with bonuses
    const matchesLimit = baseMatchesLimit + matchesBonus;
    
    if (recentMatches.length >= matchesLimit) {
      throw new Error(`شما در 24 ساعت گذشته ${matchesLimit} بازی ایجاد کرده‌اید. لطفاً صبر کنید تا محدودیت روزانه بازنشانی شود.`);
    }
    
    // Get random questions for the match
    const selectedQuestions = await getRandomQuestions(ctx);
    
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    // Generate join code for private matches
    const isPrivate = args.isPrivate ?? false;
    const joinCode = isPrivate ? await generateUniqueJoinCode(ctx) : undefined;
    
    // Create new match in waiting state
    const matchId = await ctx.db.insert("matches", {
      status: "waiting",
      createdAt: now,
      expiresAt,
      questions: selectedQuestions,
      creatorId: currentUserId,
      isPrivate,
      joinCode,
    });
    
    // Add creator as first participant
    await ctx.db.insert("matchParticipants", {
      matchId,
      userId: currentUserId,
      joinedAt: now,
    });
    
    return { matchId, joinCode };
  },
});

export const checkMatchParticipation = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return false;
    }
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      return false;
    }
    
    // Check if user is participant
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    return !!participant;
  },
});

export const getMatchDetails = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    // Check if user is participant
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this match");
    }
    
    // Get all participants with their profiles
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
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
    
    // Get questions WITHOUT correct answers (security)
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        const question = await ctx.db.get(questionId);
        if (!question) return null;
        
        // Return question without exposing correct answer
        return {
          _id: question._id,
          _creationTime: question._creationTime,
          mediaPath: question.mediaPath,
          mediaStorageId: question.mediaStorageId,
          questionText: question.questionText,
          option1Text: question.option1Text,
          option2Text: question.option2Text,
          option3Text: question.option3Text,
          option4Text: question.option4Text,
          timeToRespond: question.timeToRespond,
          grade: question.grade,
          categories: await getQuestionCategories(ctx, question._id),
        };
      })
    );
    
    return {
      match,
      participants: participantsWithProfiles,
      questions: questions.filter(q => q !== null),
    };
  },
});

export const getUserActiveMatches = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    const userParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const activeMatches = [];
    
    for (const participant of userParticipants) {
      const match = await ctx.db.get(participant.matchId);
      if (!match || participant.completedAt) {
        continue;
      }

      const allParticipants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", participant.matchId))
        .collect();

      const isCreatorSoloPlay =
        match.status === "waiting" &&
        match.creatorId === currentUserId &&
        allParticipants.length === 1;

      if (match.status !== "active" && !isCreatorSoloPlay) {
        continue;
      }

      const opponent = allParticipants.find(p => p.userId !== currentUserId);
      let opponentProfile = null;
      if (opponent) {
        opponentProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", opponent.userId))
          .unique();
      }

      activeMatches.push({
        matchId: match._id,
        startedAt: match.startedAt || match.createdAt,
        expiresAt: match.expiresAt,
        questionsAnswered: participant.answers?.length || 0,
        totalQuestions: match.questions.length,
        opponentName: opponentProfile?.name || "Unknown",
        opponentAvatarId: opponentProfile?.avatarId ?? DEFAULT_AVATAR_ID,
        status: match.status,
        canCancel: isCreatorSoloPlay,
      });
    }
    
    // Sort by startedAt (most recent first)
    return activeMatches.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
  },
});

export const getUserPendingResultsMatches = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    const userParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const pendingMatches = [];
    
    for (const participant of userParticipants) {
      // User must have completed their part
      if (!participant.completedAt) continue;
      
      const match = await ctx.db.get(participant.matchId);
      // Match should be active OR completed (but not expired yet)
      if (!match || (match.status !== "active" && match.status !== "completed")) continue;
      
      // Skip if match is expired
      if (Date.now() > match.expiresAt) continue;
      
      // Get all participants
      const allParticipants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();
      
      const opponent = allParticipants.find(p => p.userId !== currentUserId);
      
      let opponentProfile = null;
      if (opponent) {
        opponentProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q: any) => q.eq("userId", opponent.userId))
          .unique();
      }
      
      // Check if match is completed (both players done)
      const isCompleted = match.status === "completed";
      
      pendingMatches.push({
        matchId: match._id,
        completedAt: participant.completedAt,
        expiresAt: match.expiresAt,
        myScore: participant.totalScore || 0,
        myTime: participant.totalTime || 0,
        opponentName: opponentProfile?.name || "Unknown",
        opponentAvatarId: opponentProfile?.avatarId ?? DEFAULT_AVATAR_ID,
        opponentAnswered: opponent?.answers?.length || 0,
        opponentCompleted: opponent?.completedAt ? true : false,
        totalQuestions: match.questions.length,
        isCompleted,
      });
    }
    
    // Sort by completedAt (most recent first)
    return pendingMatches.sort((a, b) => b.completedAt - a.completedAt);
  },
});

export const getUserActiveMatch = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active")) {
        return participant.matchId;
      }
    }
    
    return null;
  },
});

export const getUserActiveMatchStatus = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active" || match.status === "cancelled")) {
        return {
          matchId: participant.matchId,
          status: match.status
        };
      }
    }
    
    return null;
  },
});

export const getMatchByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    // Find match by join code
    const match = await ctx.db
      .query("matches")
      .withIndex("by_joinCode", (q: any) => q.eq("joinCode", args.joinCode))
      .first();
    
    if (!match) {
      return null;
    }
    
    // Check if match is waiting
    if (match.status !== "waiting") {
      return null;
    }
    
    // Check if match has expired
    if (Date.now() > match.expiresAt) {
      return null;
    }
    
    // Get participants
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", match._id))
      .collect();
    
    // Get creator profile
    const creator = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", match.creatorId))
      .unique();
    
    return {
      _id: match._id,
      createdAt: match.createdAt,
      expiresAt: match.expiresAt,
      creatorName: creator?.name || "Unknown",
      creatorAvatarId: creator?.avatarId ?? DEFAULT_AVATAR_ID,
      participantCount: participants.length,
      isUserCreator: match.creatorId === currentUserId,
      isAlreadyParticipant: participants.some(p => p.userId === currentUserId),
    };
  },
});

export const joinMatch = mutation({
  args: { 
    matchId: v.optional(v.id("matches")),
    joinCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    if (!args.matchId && !args.joinCode) {
      throw new Error("Either matchId or joinCode must be provided");
    }
    
    let match;
    
    // Get match by ID or join code
    if (args.matchId) {
      match = await ctx.db.get(args.matchId);
    } else if (args.joinCode) {
      match = await ctx.db
        .query("matches")
        .withIndex("by_joinCode", (q: any) => q.eq("joinCode", args.joinCode))
        .first();
    }
    
    if (!match) {
      throw new Error("Match not found");
    }
    
    // Check if match is waiting
    if (match.status !== "waiting") {
      throw new Error("Match is not available for joining");
    }
    
    // Check if match has expired
    if (Date.now() > match.expiresAt) {
      throw new Error("Match has expired");
    }
    
    // Get participants
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", match._id))
      .collect();
    
    // Check if user is already a participant
    if (participants.some(p => p.userId === currentUserId)) {
      throw new Error("You are already in this match");
    }
    
    // Check if match is full
    if (participants.length >= 2) {
      throw new Error("Match is full");
    }
    
    const now = Date.now();
    
    // Add user as second participant
    await ctx.db.insert("matchParticipants", {
      matchId: match._id,
      userId: currentUserId,
      joinedAt: now,
    });
    
    // Update match to active and set new expiration
    const newExpiresAt = now + (24 * 60 * 60 * 1000); // 24 hours for both to complete
    await ctx.db.patch(match._id, {
      status: "active",
      startedAt: now,
      expiresAt: newExpiresAt,
      currentQuestionIndex: 0,
    });
    
    return match._id;
  },
});

export const cancelMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    // Check if user is the creator or admin
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    const isCreator = match.creatorId === currentUserId;
    const isAdmin = profile?.isAdmin || false;
    
    if (!isCreator && !isAdmin) {
      throw new Error("Only the creator or admin can cancel the match");
    }
    
    // Check if match can be cancelled
    if (match.status === "completed" || match.status === "cancelled") {
      throw new Error("Cannot cancel a completed or already cancelled match");
    }
    
    // Update match status
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

export const getWaitingMatches = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    // Get all waiting matches
    const waitingMatches = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
    
    const now = Date.now();
    
    // Filter out expired matches, private matches, and get match details
    const matchesWithDetails = await Promise.all(
      waitingMatches
        .filter(match => match.expiresAt > now && !match.isPrivate) // Exclude private matches
        .map(async (match) => {
          const participants = await ctx.db
            .query("matchParticipants")
            .withIndex("by_match", (q) => q.eq("matchId", match._id))
            .collect();
          
          // Get creator profile
          const creator = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q: any) => q.eq("userId", match.creatorId))
            .unique();
          
          return {
            _id: match._id,
            createdAt: match.createdAt,
            expiresAt: match.expiresAt,
            creatorName: creator?.name || "Unknown",
            creatorAvatarId: creator?.avatarId ?? DEFAULT_AVATAR_ID,
            participantCount: participants.length,
            isUserCreator: match.creatorId === currentUserId,
          };
        })
    );
    
    // Sort by createdAt (most recent first)
    return matchesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMyWaitingMatches = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    // Get all waiting matches created by user
    const allMatches = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
    
    const myMatches = allMatches.filter(match => match.creatorId === currentUserId);
    
    const matchesWithDetails = await Promise.all(
      myMatches.map(async (match) => {
        const participants = await ctx.db
          .query("matchParticipants")
          .withIndex("by_match", (q) => q.eq("matchId", match._id))
          .collect();
        
        return {
          _id: match._id,
          createdAt: match.createdAt,
          expiresAt: match.expiresAt,
          participantCount: participants.length,
          isPrivate: match.isPrivate ?? false,
          joinCode: match.joinCode,
        };
      })
    );
    
    // Sort by createdAt (most recent first)
    return matchesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const leaveMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get match
    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    
    if (match.status === "completed") {
      throw new Error("Cannot leave completed match");
    }
    
    // Find user's participation
    const participant = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();
    
    if (!participant) {
      throw new Error("You are not a participant in this match");
    }
    
    // Remove participant
    await ctx.db.delete(participant._id);
    
    // Get remaining participants
    const remainingParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    // Cancel match if:
    // 1. No participants left, OR
    // 2. Only one participant left (since this is a 2-player game)
    if (remainingParticipants.length <= 1) {
      // Remove any remaining participants
      for (const remainingParticipant of remainingParticipants) {
        await ctx.db.delete(remainingParticipant._id);
      }
      
      // Cancel the match
      await ctx.db.patch(args.matchId, {
        status: "cancelled",
        completedAt: Date.now(),
      });
    }
    
    return true;
  },
});

/**
 * Get daily limits status for the current user
 */
export const getDailyLimits = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Get all matches created by user in last 24 hours (excluding cancelled)
    const allMatches = await ctx.db
      .query("matches")
      .collect();
    
    const recentMatches = allMatches.filter(
      (match) => 
        match.creatorId === currentUserId && 
        match.createdAt > twentyFourHoursAgo &&
        match.status !== "cancelled"
    );
    
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
    
    // Get active purchases and calculate bonuses
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    let matchesBonus = 0;
    let tournamentsBonus = 0;
    
    for (const purchase of purchases) {
      // If durationMs is 0, item never expires
      const isActive = purchase.durationMs === 0 || (purchase.purchasedAt + purchase.durationMs > now);
      if (isActive) {
        // Purchase is still active
        const item = await ctx.db.get(purchase.itemId);
        if (item && item.itemType === "stadium") {
          if (item.matchesBonus) {
            matchesBonus += item.matchesBonus;
          }
          if (item.tournamentsBonus) {
            tournamentsBonus += item.tournamentsBonus;
          }
        }
      }
    }
    
    // Base limits
    const baseMatchesLimit = 3;
    const baseTournamentsLimit = 1;
    
    // Calculate total limits with bonuses
    const matchesLimit = baseMatchesLimit + matchesBonus;
    const tournamentsLimit = baseTournamentsLimit + tournamentsBonus;
    
    // Find the oldest creation time to calculate when limits reset
    const allRecentCreations = [
      ...recentMatches.map(m => m.createdAt),
      ...recentTournaments.map(t => t.createdAt)
    ];
    
    const oldestCreation = allRecentCreations.length > 0 
      ? Math.min(...allRecentCreations)
      : null;
    
    const resetTime = oldestCreation 
      ? oldestCreation + (24 * 60 * 60 * 1000)
      : null;
    
    return {
      matchesCreated: recentMatches.length,
      matchesLimit,
      tournamentsCreated: recentTournaments.length,
      tournamentsLimit,
      resetTime,
      canCreateMatch: recentMatches.length < matchesLimit,
      canCreateTournament: recentTournaments.length < tournamentsLimit,
      matchesBonus,
      tournamentsBonus,
    };
  },
});

