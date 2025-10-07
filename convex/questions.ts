import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { adminOnly, validateQuestion } from "./utils";

/**
 * Questions CRUD operations
 */

export const getAllQuestions = query({
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
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can view all questions");
    }
    
    const paginatedResult = await ctx.db
      .query("questions")
      .order("desc")
      .paginate(args.paginationOpts);
    
    // For admins, also include the correct answers
    const questionsWithAnswers = await Promise.all(
      paginatedResult.page.map(async (question) => {
        const answerEntry = await ctx.db
          .query("questionAnswers")
          .withIndex("by_question", (q: any) => q.eq("questionId", question._id))
          .unique();
        
        return {
          ...question,
          rightAnswer: answerEntry?.correctOption || 0,
        };
      })
    );
    
    return {
      ...paginatedResult,
      page: questionsWithAnswers,
    };
  },
});

export const createQuestion = mutation({
  args: {
    mediaPath: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    questionText: v.string(),
    option1Text: v.string(),
    option2Text: v.string(),
    option3Text: v.string(),
    option4Text: v.string(),
    rightAnswer: v.number(),
    timeToRespond: v.number(),
    grade: v.number(),
    category: v.optional(v.string()),
  },
  handler: adminOnly(async (ctx, args) => {
    validateQuestion(args);
    
    // Insert question without the correct answer
    const questionId = await ctx.db.insert("questions", {
      mediaPath: args.mediaPath,
      mediaStorageId: args.mediaStorageId,
      questionText: args.questionText,
      option1Text: args.option1Text,
      option2Text: args.option2Text,
      option3Text: args.option3Text,
      option4Text: args.option4Text,
      timeToRespond: args.timeToRespond,
      grade: args.grade,
      category: args.category,
    });
    
    // Store correct answer separately in secure table
    await ctx.db.insert("questionAnswers", {
      questionId: questionId,
      correctOption: args.rightAnswer,
    });
    
    return questionId;
  }),
});

export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    mediaPath: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    questionText: v.string(),
    option1Text: v.string(),
    option2Text: v.string(),
    option3Text: v.string(),
    option4Text: v.string(),
    rightAnswer: v.number(),
    timeToRespond: v.number(),
    grade: v.number(),
    category: v.optional(v.string()),
  },
  handler: adminOnly(async (ctx, args) => {
    validateQuestion(args);
    
    // Check if question exists
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Update question (without correct answer)
    await ctx.db.patch(args.questionId, {
      mediaPath: args.mediaPath,
      mediaStorageId: args.mediaStorageId,
      questionText: args.questionText,
      option1Text: args.option1Text,
      option2Text: args.option2Text,
      option3Text: args.option3Text,
      option4Text: args.option4Text,
      timeToRespond: args.timeToRespond,
      grade: args.grade,
      category: args.category,
    });
    
    // Update correct answer in separate table
    const answerEntry = await ctx.db
      .query("questionAnswers")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .unique();
    
    if (answerEntry) {
      await ctx.db.patch(answerEntry._id, {
        correctOption: args.rightAnswer,
      });
    } else {
      // Create if doesn't exist (edge case)
      await ctx.db.insert("questionAnswers", {
        questionId: args.questionId,
        correctOption: args.rightAnswer,
      });
    }
  }),
});

export const deleteQuestion = mutation({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can delete questions");
    }
    
    // Check if question exists
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found");
    }
    
    // Delete associated media file if exists
    if (question.mediaStorageId) {
      await ctx.storage.delete(question.mediaStorageId);
    }
    
    // Delete the answer entry
    const answerEntry = await ctx.db
      .query("questionAnswers")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .unique();
    
    if (answerEntry) {
      await ctx.db.delete(answerEntry._id);
    }
    
    // Delete the question
    await ctx.db.delete(args.questionId);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can upload media");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const getMediaUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    
    if (!currentProfile?.isAdmin) {
      throw new Error("Only admins can view media");
    }
    
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getQuestionMediaUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.storage.getUrl(args.storageId);
  },
});

