import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Match results and history operations
 */

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
    
    // Get questions WITH correct answers (for completed matches, show answers in results)
    const questions = await Promise.all(
      match.questions.map(async (questionId) => {
        const question = await ctx.db.get(questionId);
        if (!question) return null;
        
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
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Get user's completed match participants with pagination
    const paginatedParticipants = await ctx.db
      .query("matchParticipants")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .order("desc")
      .paginate(args.paginationOpts);
    
    const completedMatches = [];
    
    for (const participant of paginatedParticipants.page) {
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
    
    return {
      page: completedMatches,
      isDone: paginatedParticipants.isDone,
      continueCursor: paginatedParticipants.continueCursor,
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

