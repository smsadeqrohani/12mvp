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
    
    // For admins, also include the correct answers and categories
    const questionsWithAnswers = await Promise.all(
      paginatedResult.page.map(async (question) => {
        const answerEntry = await ctx.db
          .query("questionAnswers")
          .withIndex("by_question", (q: any) => q.eq("questionId", question._id))
          .unique();
        
        // Get categories for this question
        const questionCategories = await ctx.db
          .query("questionCategories")
          .withIndex("by_question", (q: any) => q.eq("questionId", question._id))
          .collect();
        
        const categories = await Promise.all(
          questionCategories.map(async (qc) => {
            const category = await ctx.db.get(qc.categoryId);
            return category;
          })
        );
        
        return {
          ...question,
          rightAnswer: answerEntry?.correctOption || 0,
          categories: categories.filter(Boolean),
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
    categories: v.optional(v.array(v.id("categories"))),
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
    });
    
    // Store correct answer separately in secure table
    await ctx.db.insert("questionAnswers", {
      questionId: questionId,
      correctOption: args.rightAnswer,
    });
    
    // Add categories using junction table
    if (args.categories && args.categories.length > 0) {
      for (const categoryId of args.categories) {
        await ctx.db.insert("questionCategories", {
          questionId: questionId,
          categoryId: categoryId,
        });
      }
    }
    
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
    categories: v.optional(v.array(v.id("categories"))),
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
    
    // Update categories using junction table
    // Remove existing category relationships
    const existingRelations = await ctx.db
      .query("questionCategories")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .collect();

    for (const relation of existingRelations) {
      await ctx.db.delete(relation._id);
    }

    // Add new category relationships
    if (args.categories && args.categories.length > 0) {
      for (const categoryId of args.categories) {
        await ctx.db.insert("questionCategories", {
          questionId: args.questionId,
          categoryId: categoryId,
        });
      }
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
    
    // Delete category relationships
    const categoryRelations = await ctx.db
      .query("questionCategories")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .collect();

    for (const relation of categoryRelations) {
      await ctx.db.delete(relation._id);
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

