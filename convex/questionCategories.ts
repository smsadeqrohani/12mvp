import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { adminOnly, requireAuth } from "./utils";

// Get all categories for a specific question
export const getCategoriesForQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const questionCategories = await ctx.db
      .query("questionCategories")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .collect();

    const categories = await Promise.all(
      questionCategories.map(async (qc) => {
        const category = await ctx.db.get(qc.categoryId);
        return category;
      })
    );

    return categories.filter(Boolean);
  },
});

// Get all questions in a specific category
export const getQuestionsInCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const questionCategories = await ctx.db
      .query("questionCategories")
      .withIndex("by_category", (q: any) => q.eq("categoryId", args.categoryId))
      .collect();

    const questions = await Promise.all(
      questionCategories.map(async (qc) => {
        const question = await ctx.db.get(qc.questionId);
        return question;
      })
    );

    return questions.filter(Boolean);
  },
});

// Get questions in multiple categories (intersection)
export const getQuestionsInCategories = query({
  args: { categoryIds: v.array(v.id("categories")) },
  handler: async (ctx, args) => {
    if (args.categoryIds.length === 0) {
      return [];
    }

    // Get all question-category relationships for the given categories
    const questionCategories = await Promise.all(
      args.categoryIds.map(categoryId =>
        ctx.db
          .query("questionCategories")
          .withIndex("by_category", (q: any) => q.eq("categoryId", categoryId))
          .collect()
      )
    );

    // Find questions that appear in ALL specified categories
    const questionIdCounts = new Map<string, number>();
    
    questionCategories.flat().forEach(qc => {
      const questionId = qc.questionId;
      questionIdCounts.set(questionId, (questionIdCounts.get(questionId) || 0) + 1);
    });

    // Only include questions that appear in all categories
    const questionIdsInAllCategories = Array.from(questionIdCounts.entries())
      .filter(([_, count]) => count === args.categoryIds.length)
      .map(([questionId, _]) => questionId);

    // Get the actual question objects
    const questions = await Promise.all(
      questionIdsInAllCategories.map(async (questionId) => {
        const question = await ctx.db.get(questionId as any);
        return question;
      })
    );

    return questions.filter(Boolean);
  },
});

// Add categories to a question
export const addCategoriesToQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    categoryIds: v.array(v.id("categories")),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    // Remove existing categories for this question
    const existingRelations = await ctx.db
      .query("questionCategories")
      .withIndex("by_question", (q: any) => q.eq("questionId", args.questionId))
      .collect();

    for (const relation of existingRelations) {
      await ctx.db.delete(relation._id);
    }

    // Add new categories
    for (const categoryId of args.categoryIds) {
      await ctx.db.insert("questionCategories", {
        questionId: args.questionId,
        categoryId: categoryId,
      });
    }
  }),
});

// Remove a category from a question
export const removeCategoryFromQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    categoryId: v.id("categories"),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    const relation = await ctx.db
      .query("questionCategories")
      .withIndex("by_question_category", (q: any) => 
        q.eq("questionId", args.questionId).eq("categoryId", args.categoryId)
      )
      .unique();

    if (relation) {
      await ctx.db.delete(relation._id);
    }
  }),
});

// Get paginated questions in a category
export const getQuestionsInCategoryPaginated = query({
  args: {
    categoryId: v.id("categories"),
    paginationOpts: v.object({
      cursor: v.union(v.string(), v.null()),
      numItems: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const questionCategories = await ctx.db
      .query("questionCategories")
      .withIndex("by_category", (q: any) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);

    const questions = await Promise.all(
      questionCategories.page.map(async (qc) => {
        const question = await ctx.db.get(qc.questionId);
        return question;
      })
    );

    return {
      ...questionCategories,
      page: questions.filter(Boolean),
    };
  },
});

// Get categories with question counts
export const getCategoriesWithCounts = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const questionCount = await ctx.db
          .query("questionCategories")
          .withIndex("by_category", (q: any) => q.eq("categoryId", category._id))
          .collect()
          .then(relations => relations.length);

        return {
          ...category,
          questionCount,
        };
      })
    );

    return categoriesWithCounts;
  },
});
