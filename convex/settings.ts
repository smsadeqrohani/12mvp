import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { adminOnly } from "./utils";

/**
 * App settings: default stadium and default mentor for new users.
 * Single row in appSettings; created on first set.
 */

export const getAppSettings = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    if (!profile?.isAdmin) {
      return null;
    }
    const row = await ctx.db.query("appSettings").first();
    return row ?? null;
  },
});

export const setAppSettings = mutation({
  args: {
    defaultStadiumItemId: v.optional(v.union(v.id("storeItems"), v.null())),
    defaultMentorItemId: v.optional(v.union(v.id("storeItems"), v.null())),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    const row = await ctx.db.query("appSettings").first();
    const updates: { defaultStadiumItemId?: any; defaultMentorItemId?: any } = {};
    if (args.defaultStadiumItemId !== undefined) {
      updates.defaultStadiumItemId = args.defaultStadiumItemId === null ? undefined : args.defaultStadiumItemId;
    }
    if (args.defaultMentorItemId !== undefined) {
      updates.defaultMentorItemId = args.defaultMentorItemId === null ? undefined : args.defaultMentorItemId;
    }
    if (row) {
      await ctx.db.patch(row._id, updates);
    } else {
      await ctx.db.insert("appSettings", {
        defaultStadiumItemId: updates.defaultStadiumItemId,
        defaultMentorItemId: updates.defaultMentorItemId,
      });
    }
  }),
});

/**
 * Assign default stadium and default mentor to all users who don't have them.
 * Run once (or from admin Settings tab) to migrate existing users.
 */
export const assignDefaultStadiumAndMentorToAllUsers = mutation({
  args: {},
  handler: adminOnly(async (ctx: any) => {
    const settings = await ctx.db.query("appSettings").first();
    if (!settings?.defaultStadiumItemId || !settings?.defaultMentorItemId) {
      throw new Error("لطفاً ابتدا در تنظیمات، استادیوم و مربی پیش‌فرض را انتخاب کنید");
    }
    const stadiumItem = await ctx.db.get(settings.defaultStadiumItemId);
    const mentorItem = await ctx.db.get(settings.defaultMentorItemId);
    if (!stadiumItem || stadiumItem.itemType !== "stadium") {
      throw new Error("آیتم پیش‌فرض استادیوم معتبر نیست");
    }
    if (!mentorItem || mentorItem.itemType !== "mentor") {
      throw new Error("آیتم پیش‌فرض مربی معتبر نیست");
    }

    const profiles = await ctx.db.query("profiles").collect();
    const now = Date.now();
    let assignedStadium = 0;
    let assignedMentor = 0;

    for (const profile of profiles) {
      const purchases = await ctx.db
        .query("purchases")
        .withIndex("by_user", (q: any) => q.eq("userId", profile.userId))
        .collect();

      let hasStadium = false;
      let hasMentor = false;
      for (const p of purchases) {
        const item = await ctx.db.get(p.itemId);
        if (item?.itemType === "stadium") hasStadium = true;
        if (item?.itemType === "mentor") hasMentor = true;
      }

      if (!hasStadium) {
        await ctx.db.insert("purchases", {
          userId: profile.userId,
          itemId: settings.defaultStadiumItemId,
          purchasedAt: now,
          durationMs: stadiumItem.durationMs ?? 0,
        });
        assignedStadium++;
      }
      if (!hasMentor) {
        await ctx.db.insert("purchases", {
          userId: profile.userId,
          itemId: settings.defaultMentorItemId,
          purchasedAt: now,
          durationMs: mentorItem.durationMs ?? 0,
        });
        assignedMentor++;
      }
    }

    return { assignedStadium, assignedMentor, totalUsers: profiles.length };
  }),
});
