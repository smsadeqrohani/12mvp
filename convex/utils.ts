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

export const getRandomQuestions = async (ctx: any) => {
  const allQuestions = await ctx.db.query("questions").collect();
  if (allQuestions.length < 5) {
    throw new Error("Not enough questions in database");
  }
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
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

