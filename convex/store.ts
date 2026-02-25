import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireAuth, requireAdmin } from "./utils";

/**
 * Store operations - items and purchases
 * 
 * To initialize the stadium item, call createStoreItem with:
 * {
 *   name: "استادیوم",
 *   description: "با خرید استادیوم، 5 بازی و 2 تورنومنت اضافی به محدودیت‌های شما برای یک ماه اضافه می‌شود",
 *   matchesBonus: 5,
 *   tournamentsBonus: 2,
 *   durationMs: 30 * 24 * 60 * 60 * 1000, // 30 days
 *   isActive: true
 * }
 */

export const getStoreItems = query({
  handler: async (ctx) => {
    const items = await ctx.db
      .query("storeItems")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return await Promise.all(items.map(async (item) => {
      let imageUrl: string | null = null;
      if (item.imageStorageId) {
        imageUrl = await ctx.storage.getUrl(item.imageStorageId);
      } else if (item.imagePath && item.imagePath.startsWith("http")) {
        imageUrl = item.imagePath;
      }
      return {
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        itemType: item.itemType || "stadium",
        matchesBonus: item.matchesBonus,
        tournamentsBonus: item.tournamentsBonus,
        mentorMode: item.mentorMode,
        avatarId: item.avatarId,
        durationMs: item.durationMs,
        imageUrl,
      };
    }));
  },
});

export const getUserPurchases = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    return purchases.map(purchase => ({
      _id: purchase._id,
      itemId: purchase.itemId,
      purchasedAt: purchase.purchasedAt,
      durationMs: purchase.durationMs,
    }));
  },
});

/**
 * Get user's owned avatars (permanent avatar purchases)
 * Returns array of avatar IDs that the user owns
 */
export const getUserOwnedAvatars = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }
    
    // Get all user purchases
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const ownedAvatars: string[] = [];
    
    // Check each purchase for avatar items
    for (const purchase of purchases) {
      const item = await ctx.db.get(purchase.itemId);
      if (!item || item.itemType !== "avatar") continue;
      
      // Avatar purchases are permanent (durationMs = 0)
      // So if it's an avatar item, user owns it permanently
      if (item.avatarId) {
        ownedAvatars.push(item.avatarId);
      }
    }
    
    return ownedAvatars;
  },
});

/**
 * Get user's active mentor purchase (if any).
 * Only the single latest purchase is used (new purchase replaces previous).
 */
export const getUserActiveMentor = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();
    
    const now = Date.now();
    let best: {
      itemId: Id<"storeItems">;
      mentorMode: 0 | 1 | 2;
      name: string;
      purchasedAt: number;
      imageStorageId?: Id<"_storage"> | undefined;
      imagePath?: string | undefined;
    } | null = null;
    
    for (const purchase of purchases) {
      const item = await ctx.db.get(purchase.itemId);
      if (!item || item.itemType !== "mentor") continue;
      const isActive = item.durationMs === 0 || (purchase.purchasedAt + purchase.durationMs > now);
      if (!isActive) continue;
      const mode = (item.mentorMode ?? 0) as 0 | 1 | 2;
      if (!best || purchase.purchasedAt > best.purchasedAt) {
        best = {
          itemId: item._id,
          mentorMode: mode,
          name: item.name,
          purchasedAt: purchase.purchasedAt,
          imageStorageId: item.imageStorageId,
          imagePath: item.imagePath,
        };
      }
    }
    
    if (!best) return null;

    let imageUrl: string | null = null;
    if (best.imageStorageId) {
      imageUrl = await ctx.storage.getUrl(best.imageStorageId);
    } else if (best.imagePath && best.imagePath.startsWith("http")) {
      imageUrl = best.imagePath;
    }

    return {
      itemId: best.itemId,
      mentorMode: best.mentorMode,
      name: best.name,
      imageUrl,
    };
  },
});

/**
 * Get user's active stadium (if any) with image and bonuses.
 * Uses the latest non-expired stadium purchase.
 */
export const getUserActiveStadium = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }

    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .collect();

    const now = Date.now();
    let best: {
      itemId: Id<"storeItems">;
      name: string;
      matchesBonus: number;
      tournamentsBonus: number;
      purchasedAt: number;
      imageStorageId?: Id<"_storage"> | undefined;
      imagePath?: string | undefined;
    } | null = null;

    for (const purchase of purchases) {
      const item = await ctx.db.get(purchase.itemId);
      if (!item || item.itemType !== "stadium") continue;
      const isActive = item.durationMs === 0 || (purchase.purchasedAt + purchase.durationMs > now);
      if (!isActive) continue;

      const matchesBonus = item.matchesBonus ?? 0;
      const tournamentsBonus = item.tournamentsBonus ?? 0;

      if (!best || purchase.purchasedAt > best.purchasedAt) {
        best = {
          itemId: item._id,
          name: item.name,
          matchesBonus,
          tournamentsBonus,
          purchasedAt: purchase.purchasedAt,
          imageStorageId: item.imageStorageId,
          imagePath: item.imagePath,
        };
      }
    }

    if (!best) return null;

    let imageUrl: string | null = null;
    if (best.imageStorageId) {
      imageUrl = await ctx.storage.getUrl(best.imageStorageId);
    } else if (best.imagePath && best.imagePath.startsWith("http")) {
      imageUrl = best.imagePath;
    }

    return {
      itemId: best.itemId,
      name: best.name,
      matchesBonus: best.matchesBonus,
      tournamentsBonus: best.tournamentsBonus,
      imageUrl,
    };
  },
});

export const purchaseItem = mutation({
  args: { itemId: v.id("storeItems") },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuth(ctx);
    
    // Get item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    
    if (!item.isActive) {
      throw new Error("Item is not available for purchase");
    }
    
    // For avatar items, check if user already owns it
    if (item.itemType === "avatar") {
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
        .collect();
      
      // Check if user already purchased this avatar
      for (const purchase of purchases) {
        const purchasedItem = await ctx.db.get(purchase.itemId);
        if (purchasedItem?.itemType === "avatar" && purchasedItem.avatarId === item.avatarId) {
          throw new Error("شما قبلاً این آواتار را خریداری کرده‌اید");
        }
      }
    }
    
    // Get user profile to check points
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    
    if (!profile) {
      throw new Error("User profile not found");
    }
    
    const currentPoints = profile.points ?? 0;
    
    // Check if user has enough points
    if (currentPoints < item.price) {
      throw new Error(`امتیاز کافی ندارید. نیاز به ${item.price} امتیاز دارید.`);
    }
    
    // Deduct points
    await ctx.db.patch(profile._id, {
      points: currentPoints - item.price,
    });
    
    const now = Date.now();
    
    // Create purchase record
    // Avatar items are always permanent (durationMs = 0)
    const durationMs = item.itemType === "avatar" ? 0 : item.durationMs;
    
    await ctx.db.insert("purchases", {
      userId: currentUserId,
      itemId: args.itemId,
      purchasedAt: now,
      durationMs,
    });
    
    return { success: true, remainingPoints: currentPoints - item.price };
  },
});

/**
 * Admin functions for managing store items
 */
export const getAllStoreItems = query({
  handler: async (ctx) => {
    const items = await ctx.db
      .query("storeItems")
      .collect();
    
    return items.map(item => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      itemType: item.itemType || "stadium",
      matchesBonus: item.matchesBonus,
      tournamentsBonus: item.tournamentsBonus,
      mentorMode: item.mentorMode,
      avatarId: item.avatarId,
      durationMs: item.durationMs,
      isActive: item.isActive,
      imagePath: item.imagePath,
      imageStorageId: item.imageStorageId,
    }));
  },
});

export const createStoreItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    itemType: v.union(v.literal("stadium"), v.literal("mentor"), v.literal("avatar")),
    matchesBonus: v.optional(v.number()),
    tournamentsBonus: v.optional(v.number()),
    mentorMode: v.optional(v.number()),
    avatarId: v.optional(v.string()),
    durationMs: v.number(),
    isActive: v.boolean(),
    imagePath: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const itemData: any = {
      name: args.name,
      description: args.description,
      price: args.price,
      itemType: args.itemType,
      durationMs: args.durationMs,
      isActive: args.isActive,
    };
    if (args.imagePath !== undefined) itemData.imagePath = args.imagePath;
    if (args.imageStorageId !== undefined) itemData.imageStorageId = args.imageStorageId;
    
    if (args.itemType === "stadium") {
      itemData.matchesBonus = args.matchesBonus ?? 0;
      itemData.tournamentsBonus = args.tournamentsBonus ?? 0;
    } else if (args.itemType === "mentor") {
      const mode = args.mentorMode;
      if (mode !== undefined && mode !== 0 && mode !== 1 && mode !== 2) {
        throw new Error("mentorMode must be 0, 1, or 2");
      }
      itemData.mentorMode = mode === undefined ? undefined : (mode as 0 | 1 | 2);
    } else if (args.itemType === "avatar") {
      itemData.avatarId = args.avatarId?.trim() || undefined;
      // Avatar items are always permanent (durationMs = 0)
      itemData.durationMs = 0;
    }
    
    const itemId = await ctx.db.insert("storeItems", itemData);
    
    // اگر آواتار بدون avatarId ساخته شد، با شناسه یکتا پر کنیم
    if (args.itemType === "avatar" && !itemData.avatarId) {
      await ctx.db.patch(itemId, { avatarId: "store_" + itemId });
    }
    
    return { itemId };
  },
});

export const updateStoreItem = mutation({
  args: {
    itemId: v.id("storeItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    itemType: v.optional(v.union(v.literal("stadium"), v.literal("mentor"), v.literal("avatar"))),
    matchesBonus: v.optional(v.number()),
    tournamentsBonus: v.optional(v.number()),
    mentorMode: v.optional(v.number()),
    avatarId: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    imagePath: v.optional(v.union(v.string(), v.null())),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.price !== undefined) updates.price = args.price;
    if (args.itemType !== undefined) updates.itemType = args.itemType;
    if (args.matchesBonus !== undefined) updates.matchesBonus = args.matchesBonus;
    if (args.tournamentsBonus !== undefined) updates.tournamentsBonus = args.tournamentsBonus;
    if (args.mentorMode !== undefined) {
      const m = args.mentorMode;
      if (m !== 0 && m !== 1 && m !== 2) throw new Error("mentorMode must be 0, 1, or 2");
      updates.mentorMode = m as 0 | 1 | 2;
    }
    if (args.avatarId !== undefined) updates.avatarId = args.avatarId;
    if (args.imagePath !== undefined) updates.imagePath = args.imagePath === null ? undefined : args.imagePath;
    if (args.imageStorageId !== undefined) updates.imageStorageId = args.imageStorageId === null ? undefined : args.imageStorageId;
    if (args.durationMs !== undefined) {
      // For avatar items, always set durationMs to 0 (permanent)
      if (args.itemType === "avatar" || item.itemType === "avatar") {
        updates.durationMs = 0;
      } else {
        updates.durationMs = args.durationMs;
      }
    }
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    
    await ctx.db.patch(args.itemId, updates);
    
    return { success: true };
  },
});

export const deleteStoreItem = mutation({
  args: { itemId: v.id("storeItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    
    await ctx.db.delete(args.itemId);
    
    return { success: true };
  },
});

export const toggleStoreItemStatus = mutation({
  args: { itemId: v.id("storeItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    
    await ctx.db.patch(args.itemId, {
      isActive: !item.isActive,
    });
    
    return { success: true, isActive: !item.isActive };
  },
});

/**
 * Migration: Update existing store items to have itemType field
 * This should be run once to migrate existing data
 */
export const migrateStoreItems = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const allItems = await ctx.db
      .query("storeItems")
      .collect();
    
    let migrated = 0;
    
    for (const item of allItems) {
      // Check if itemType is missing (old items)
      if (!("itemType" in item)) {
        // Determine itemType based on existing fields
        // If it has matchesBonus or tournamentsBonus, it's a stadium
        // Otherwise, it's a mentor (but old items are likely stadiums)
        const itemType = (item.matchesBonus !== undefined || item.tournamentsBonus !== undefined) 
          ? "stadium" 
          : "stadium"; // Default to stadium for old items
        
        await ctx.db.patch(item._id, {
          itemType: itemType as "stadium" | "mentor",
        });
        
        migrated++;
      }
    }
    
    return { success: true, migrated };
  },
});

