import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getRandomQuestions, requireAdmin } from "./utils";

/**
 * Match management and quiz logic functions
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
          category: question.category,
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
      return null; // Return null instead of throwing error for unauthenticated users
    }
    
    // Find user's active matches - this query will be reactive to changes in matchParticipants
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
      return null; // Return null instead of throwing error for unauthenticated users
    }
    
    // Get all user's match participants - this query is reactive to matchParticipants table
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    // For each participant, get the match and check if it's active/waiting
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && (match.status === "waiting" || match.status === "active")) {
        // Return just the status and matchId for maximum reactivity
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

export const submitAnswer = mutation({
  args: {
    matchId: v.id("matches"),
    questionId: v.id("questions"),
    selectedAnswer: v.number(),
    timeSpent: v.number(),
  },
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
    
    if (match.status !== "active") {
      throw new Error("Match is not active");
    }
    
    // Get question
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Check if question is part of this match
    if (!match.questions.includes(args.questionId)) {
      throw new Error("Question is not part of this match");
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
    
    // Check if user already answered this question
    const existingAnswer = participant.answers?.find(
      (answer) => answer.questionId === args.questionId
    );
    
    if (existingAnswer) {
      throw new Error("You have already answered this question");
    }
    
    // Check if answer is valid (0-4, where 0 means no answer)
    if (args.selectedAnswer < 0 || args.selectedAnswer > 4) {
      throw new Error("Invalid answer selection");
    }
    
    // Get correct answer from secure table (backend-only check)
    const answerEntry = await ctx.db
      .query("questionAnswers")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .unique();
    
    if (!answerEntry) {
      throw new Error("Question answer not found");
    }
    
    // Check if answer is correct (0 means no answer, so always incorrect)
    const isCorrect = args.selectedAnswer === answerEntry.correctOption && args.selectedAnswer !== 0;
    
    // Add answer to participant's answers
    const newAnswer = {
      questionId: args.questionId,
      selectedAnswer: args.selectedAnswer,
      timeSpent: args.timeSpent,
      isCorrect,
    };
    
    const updatedAnswers = [...(participant.answers || []), newAnswer];
    
    // Update participant
    await ctx.db.patch(participant._id, {
      answers: updatedAnswers,
    });
    
    // Check if this was the last question for this user
    if (updatedAnswers.length === match.questions.length) {
      // Calculate total score and time
      const totalScore = updatedAnswers.filter(a => a.isCorrect).length;
      const totalTime = updatedAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
      
      await ctx.db.patch(participant._id, {
        totalScore,
        totalTime,
        completedAt: Date.now(),
      });
      
      // Check if both players have completed
      const allParticipants = await ctx.db
        .query("matchParticipants")
        .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
        .collect();
      
      const allCompleted = allParticipants.every(p => p.completedAt);
      
      if (allCompleted && allParticipants.length === 2) {
        // Calculate match results
        const [player1, player2] = allParticipants;
        
        let winnerId = null;
        let isDraw = false;
        
        if (player1.totalScore! > player2.totalScore!) {
          winnerId = player1.userId;
        } else if (player2.totalScore! > player1.totalScore!) {
          winnerId = player2.userId;
        } else {
          // Tie on score, check time
          if (player1.totalTime! < player2.totalTime!) {
            winnerId = player1.userId;
          } else if (player2.totalTime! < player1.totalTime!) {
            winnerId = player2.userId;
          } else {
            isDraw = true;
          }
        }
        
        // Create match result
        await ctx.db.insert("matchResults", {
          matchId: args.matchId,
          winnerId: winnerId || undefined,
          isDraw,
          player1Id: player1.userId,
          player2Id: player2.userId,
          player1Score: player1.totalScore!,
          player2Score: player2.totalScore!,
          player1Time: player1.totalTime!,
          player2Time: player2.totalTime!,
          completedAt: Date.now(),
        });
        
        // Mark match as completed
        await ctx.db.patch(args.matchId, {
          status: "completed",
          completedAt: Date.now(),
        });
      }
    }
    
    // DO NOT expose correct answer to client for security
    return { isCorrect };
  },
});

export const getMatchResults = query({
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
    
    if (match.status !== "completed") {
      throw new Error("Match is not completed yet");
    }
    
    // Get match result
    const result = await ctx.db
      .query("matchResults")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .unique();
    
    if (!result) {
      throw new Error("Match result not found");
    }
    
    // Get participants with profiles
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
    
    // Get questions WITHOUT exposing correct answers (for completed matches, show answers in results)
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        const question = await ctx.db.get(questionId);
        if (!question) return null;
        
        // For completed matches, include correct answers so users can review
        const answerEntry = await ctx.db
          .query("questionAnswers")
          .withIndex("by_question", (q: any) => q.eq("questionId", questionId))
          .unique();
        
        return {
          ...question,
          rightAnswer: answerEntry?.correctOption || 0,
        };
      })
    );
    
    return {
      match,
      result,
      participants: participantsWithProfiles,
      questions: questions.filter(q => q !== null),
    };
  },
});

export const getUserMatchHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get user's completed matches
    const userMatches = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .collect();
    
    const completedMatches = [];
    
    for (const participant of userMatches) {
      const match = await ctx.db.get(participant.matchId);
      if (match && match.status === "completed") {
        const result = await ctx.db
          .query("matchResults")
          .withIndex("by_match", (q) => q.eq("matchId", participant.matchId))
          .unique();
        
        if (result) {
          // Get opponent info
          const opponentId = result.player1Id === currentUserId ? result.player2Id : result.player1Id;
          const opponentProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q: any) => q.eq("userId", opponentId))
            .unique();
          
          completedMatches.push({
            match,
            result,
            participant,
            opponent: opponentProfile,
            isWinner: result.winnerId === currentUserId,
            isDraw: result.isDraw,
          });
        }
      }
    }
    
    // Sort by completion time (newest first)
    completedMatches.sort((a, b) => b.match.completedAt! - a.match.completedAt!);
    
    // Apply limit
    const limit = args.limit || 20;
    return completedMatches.slice(0, limit);
  },
});

export const checkMatchCompletion = query({
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
    
    // Get all participants
    const participants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
    
    // Check if all participants have completed
    const allCompleted = participants.every(p => p.completedAt);
    
    return {
      match,
      participants,
      allCompleted,
      isCompleted: match.status === "completed",
    };
  },
});

export const getMatchResultsPartial = query({
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
    
    // Allow partial results even if match is not completed yet
    // This is for when one player finishes early
    
    // Get participants with profiles
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
    
    // Get questions - include correct answers only if match is completed
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        const question = await ctx.db.get(questionId);
        if (!question) return null;
        
        // Only include correct answers for completed matches
        if (match.status === "completed") {
          const answerEntry = await ctx.db
            .query("questionAnswers")
            .withIndex("by_question", (q: any) => q.eq("questionId", questionId))
            .unique();
          
          return {
            ...question,
            rightAnswer: answerEntry?.correctOption || 0,
          };
        }
        
        // For active/waiting matches, do not expose answers
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
          category: question.category,
        };
      })
    );
    
    // Get match result if completed
    let result = null;
    if (match.status === "completed") {
      result = await ctx.db
        .query("matchResults")
        .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
        .unique();
    }
    
    return {
      match,
      result,
      participants: participantsWithProfiles,
      questions: questions.filter(q => q !== null),
      isCompleted: match.status === "completed",
    };
  },
});

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
        
        return {
          match,
          participants: participantsWithProfiles,
          creator: creatorProfile,
          result,
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

