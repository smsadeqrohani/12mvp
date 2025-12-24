import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { DEFAULT_AVATAR_ID, isValidAvatarId, isPremiumAvatar, isFreeAvatar } from "../shared/avatarOptions";

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
  args: { name: v.string(), avatarId: v.optional(v.string()) },
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
    
    let avatarId = args.avatarId && isValidAvatarId(args.avatarId) ? args.avatarId : DEFAULT_AVATAR_ID;
    
    // Check if it's a premium avatar - if so, verify user owns it
    if (isPremiumAvatar(avatarId)) {
      // Get all user purchases
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();
      
      // Check if user owns this avatar
      let ownsAvatar = false;
      for (const purchase of purchases) {
        const item = await ctx.db.get(purchase.itemId);
        if (item?.itemType === "avatar" && item.avatarId === avatarId) {
          ownsAvatar = true;
          break;
        }
      }
      
      if (!ownsAvatar) {
        // Fall back to default avatar if user doesn't own the premium one
        avatarId = DEFAULT_AVATAR_ID;
      }
    }

    await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      isAdmin: false,
      points: 0,
      correctAnswersTotal: 0,
      avatarId,
    });
  },
});

export const updateProfileAvatar = mutation({
  args: { avatarId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!isValidAvatarId(args.avatarId)) {
      throw new Error("Invalid avatar selection");
    }

    // Check if it's a premium avatar - if so, verify user owns it
    if (isPremiumAvatar(args.avatarId)) {
      // Get all user purchases
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .collect();
      
      // Check if user owns this avatar
      let ownsAvatar = false;
      for (const purchase of purchases) {
        const item = await ctx.db.get(purchase.itemId);
        if (item?.itemType === "avatar" && item.avatarId === args.avatarId) {
          ownsAvatar = true;
          break;
        }
      }
      
      if (!ownsAvatar) {
        throw new Error("شما این آواتار را خریداری نکرده‌اید");
      }
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("User profile not found");
    }

    if (profile.avatarId === args.avatarId) {
      return;
    }

    await ctx.db.patch(profile._id, {
      avatarId: args.avatarId,
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
          points: profile.points ?? 0,
          avatarId: profile.avatarId ?? DEFAULT_AVATAR_ID,
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

export const getTopUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    
    // Get all profiles
    const allProfiles = await ctx.db.query("profiles").collect();
    
    // Get user data and sort by total correct answers, then by creation time
    const usersWithData = await Promise.all(
      allProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        const correctAnswers = profile.correctAnswersTotal ?? 0;
        const creationTime = user?._creationTime ?? 0;
        
        return {
          userId: profile.userId,
          name: profile.name,
          correctAnswers,
          creationTime,
          avatarId: profile.avatarId ?? DEFAULT_AVATAR_ID,
        };
      })
    );
    
    // Sort by correct answers (descending), then by creation time (ascending - oldest first for tiebreaker)
    usersWithData.sort((a, b) => {
      if (b.correctAnswers !== a.correctAnswers) {
        return b.correctAnswers - a.correctAnswers;
      }
      // For equal points, older users (lower creation time) rank higher
      return a.creationTime - b.creationTime;
    });
    
    // Return top N users with rank
    return usersWithData.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      name: user.name,
      correctAnswers: user.correctAnswers,
      avatarId: user.avatarId ?? DEFAULT_AVATAR_ID,
    }));
  },
});

export const updateProfileName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Name cannot be empty");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    if (profile.name === trimmedName) {
      return;
    }

    await ctx.db.patch(profile._id, {
      name: trimmedName,
    });
  },
});
