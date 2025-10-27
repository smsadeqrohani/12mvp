import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Shared utility functions for authentication and authorization
 */

export const requireAuth = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
};

export const requireAdmin = async (ctx: any) => {
  const userId = await requireAuth(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();
  if (!profile?.isAdmin) throw new Error("Admin access required");
  return { userId, profile };
};

export const validateQuestion = (args: any) => {
  if (args.grade < 1 || args.grade > 5) throw new Error("Grade must be between 1 and 5");
  if (args.timeToRespond <= 0) throw new Error("Time to respond must be positive");
  if (args.rightAnswer < 1 || args.rightAnswer > 4) throw new Error("Right answer must be between 1 and 4");
};

export const getRandomQuestions = async (ctx: any, categoryId?: any) => {
  let questions;
  
  if (categoryId) {
    // Get questions for specific category
    const questionCategories = await ctx.db
      .query("questionCategories")
      .withIndex("by_category", (q: any) => q.eq("categoryId", categoryId))
      .collect();
    
    const questionIds = questionCategories.map((qc: any) => qc.questionId);
    
    if (questionIds.length === 0) {
      throw new Error(`No questions found for the selected category`);
    }
    
    questions = await Promise.all(
      questionIds.map((id: any) => ctx.db.get(id))
    );
    questions = questions.filter((q: any) => q !== null);
  } else {
    // Get all questions for random
    questions = await ctx.db.query("questions").collect();
  }
  
  if (questions.length < 5) {
    throw new Error("Not enough questions available");
  }
  
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((q: any) => q._id);
};

/**
 * Admin-only wrapper for mutations and queries
 */
export const adminOnly = <T extends any[]>(
  handler: (ctx: any, ...args: T) => Promise<any>
) => {
  return async (ctx: any, ...args: T) => {
    await requireAdmin(ctx);
    return handler(ctx, ...args);
  };
};

