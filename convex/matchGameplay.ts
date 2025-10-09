import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Match gameplay operations - answer submission, completion checking
 */

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

