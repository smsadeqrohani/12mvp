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
 *   benefits: [
 *     "+5 بازی اضافی در روز",
 *     "+2 تورنومنت اضافی در روز",
 *     "اعتبار یک ماهه"
 *   ],
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
    
    return items.map(item => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      matchesBonus: item.matchesBonus,
      tournamentsBonus: item.tournamentsBonus,
      durationMs: item.durationMs,
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
    await ctx.db.insert("purchases", {
      userId: currentUserId,
      itemId: args.itemId,
      purchasedAt: now,
      durationMs: item.durationMs,
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
      matchesBonus: item.matchesBonus,
      tournamentsBonus: item.tournamentsBonus,
      durationMs: item.durationMs,
      isActive: item.isActive,
    }));
  },
});

export const createStoreItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    matchesBonus: v.number(),
    tournamentsBonus: v.number(),
    durationMs: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const itemId = await ctx.db.insert("storeItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      matchesBonus: args.matchesBonus,
      tournamentsBonus: args.tournamentsBonus,
      durationMs: args.durationMs,
      isActive: args.isActive,
    });
    
    return { itemId };
  },
});

export const updateStoreItem = mutation({
  args: {
    itemId: v.id("storeItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    matchesBonus: v.optional(v.number()),
    tournamentsBonus: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
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
    if (args.matchesBonus !== undefined) updates.matchesBonus = args.matchesBonus;
    if (args.tournamentsBonus !== undefined) updates.tournamentsBonus = args.tournamentsBonus;
    if (args.durationMs !== undefined) updates.durationMs = args.durationMs;
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

