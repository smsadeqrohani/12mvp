import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getRandomQuestions } from "./utils";

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

export const createMatch = mutation({
  args: {},
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Check if user already has an active match
    const existingMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .collect();
    
    // Check if any of these matches are still active
    for (const participant of existingMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active")) {
        throw new Error("You already have an active match");
      }
    }
    
    // First, try to find an existing waiting match to join
    const waitingMatches = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
    
    for (const match of waitingMatches) {
      const participants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", match._id))
        .collect();
      
      // Check if current user is already in this match
      const isAlreadyParticipant = participants.some(p => p.userId === currentUserId);
      if (isAlreadyParticipant) {
        continue;
      }
      
      // If match has only one participant, join it and start the match
      if (participants.length === 1) {
        await ctx.db.insert("matchParticipants", {
          matchId: match._id,
          userId: currentUserId,
          joinedAt: Date.now(),
        });
        
        // Start the match (make it active)
        await ctx.db.patch(match._id, {
          status: "active",
          startedAt: Date.now(),
          currentQuestionIndex: 0,
        });
        
        return match._id;
      }
    }
    
    // If no waiting match found, create a new one
    const selectedQuestions = await getRandomQuestions(ctx);
    
    // Create match
    const matchId = await ctx.db.insert("matches", {
      status: "waiting",
      createdAt: Date.now(),
      questions: selectedQuestions,
      creatorId: currentUserId,
    });
    
    // Add current user as participant
    await ctx.db.insert("matchParticipants", {
      matchId,
      userId: currentUserId,
      joinedAt: Date.now(),
    });
    
    return matchId;
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
      if (match && (match.status === "waiting" || match.status === "active")) {
        return {
          matchId: participant.matchId,
          status: match.status
        };
      }
    }
    
    return null;
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
    
    // If match becomes empty or has only one participant, cancel it
    const remainingParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    if (remainingParticipants.length <= 1) {
      await ctx.db.patch(args.matchId, {
        status: "cancelled",
        completedAt: Date.now(),
      });
      
      // Also delete all remaining participants
      for (const participant of remainingParticipants) {
        await ctx.db.delete(participant._id);
      }
    }
    
    return true;
  },
});

