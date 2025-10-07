import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Authentication and User Profile Management
 */

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const getUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
    return profile;
  },
});

export const createProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
    
    if (existingProfile) {
      throw new Error("Profile already exists");
    }
    
    await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      isAdmin: false,
    });
  },
});

export const getAllUsers = query({
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
      throw new Error("Only admins can view all users");
    }
    
    // Get paginated profiles
    const paginatedResult = await ctx.db
      .query("profiles")
      .order("desc")
      .paginate(args.paginationOpts);
    
    // Get user data for each profile
    const usersWithProfiles = await Promise.all(
      paginatedResult.page.map(async (profile: any) => {
        const user = await ctx.db.get(profile.userId);
        // Type guard to ensure we have a user object with email
        const email = user && 'email' in user ? user.email : "";
        const emailVerified = user && 'emailVerificationTime' in user ? !!user.emailVerificationTime : false;
        return {
          ...profile,
          email: email || "",
          emailVerified,
          name: profile.name,
          isAdmin: profile.isAdmin,
        };
      })
    );
    
    return {
      page: usersWithProfiles,
      isDone: paginatedResult.isDone,
      continueCursor: paginatedResult.continueCursor,
    };
  },
});

export const makeUserAdmin = mutation({
  args: { userId: v.id("users"), isAdmin: v.boolean() },
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
      throw new Error("Only admins can modify user admin status");
    }
    
    // Update target user's profile
    const targetProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!targetProfile) {
      throw new Error("User profile not found");
    }
    
    await ctx.db.patch(targetProfile._id, {
      isAdmin: args.isAdmin,
    });
  },
});

export const updateUserName = mutation({
  args: { userId: v.id("users"), name: v.string() },
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
      throw new Error("Only admins can update user names");
    }
    
    // Update target user's profile
    const targetProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!targetProfile) {
      throw new Error("User profile not found");
    }
    
    await ctx.db.patch(targetProfile._id, {
      name: args.name,
    });
  },
});

export const resetUserPassword = mutation({
  args: { userId: v.id("users") },
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
      throw new Error("Only admins can reset user passwords");
    }
    
    // For now, we'll just return success
    // In a real implementation, you'd send a password reset email
    // or generate a temporary password
    return { success: true, message: "Password reset initiated" };
  },
});
