import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { adminOnly } from "./utils";

const slideValidator = v.object({
  imagePath: v.optional(v.string()),
  imageStorageId: v.optional(v.id("_storage")),
  order: v.number(),
});

const positionValidator = v.union(
  v.literal("dashboard"),
  v.literal("game_result"),
  v.literal("leaderboard")
);

/** Get all sliders (admin) */
export const getAllSliders = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q: any) => q.eq("userId", currentUserId))
      .unique();
    if (!profile?.isAdmin) throw new Error("Admin access required");
    return await ctx.db.query("sliders").order("desc").collect();
  },
});

/** Get sliders by position (for app: Dashboard, Game Result, Leaderboard) */
export const getSlidersByPosition = query({
  args: { position: positionValidator },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    return await ctx.db
      .query("sliders")
      .withIndex("by_position", (q: any) => q.eq("position", args.position))
      .order("desc")
      .collect();
  },
});

/** Get URL for slider image (storage) */
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createSlider = mutation({
  args: {
    name: v.optional(v.string()),
    position: positionValidator,
    slides: v.array(slideValidator),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    if (!args.slides.length) {
      throw new Error("حداقل یک اسلاید لازم است");
    }
    const slidesWithOrder = args.slides.map((s: any, i: number) => ({
      ...s,
      order: s.order ?? i,
    }));
    return await ctx.db.insert("sliders", {
      name: args.name,
      position: args.position,
      slides: slidesWithOrder,
    });
  }),
});

export const updateSlider = mutation({
  args: {
    sliderId: v.id("sliders"),
    name: v.optional(v.union(v.string(), v.null())),
    position: positionValidator,
    slides: v.array(slideValidator),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    const slider = await ctx.db.get(args.sliderId);
    if (!slider) throw new Error("اسلایدر یافت نشد");
    if (!args.slides.length) {
      throw new Error("حداقل یک اسلاید لازم است");
    }
    const slidesWithOrder = args.slides.map((s: any, i: number) => ({
      ...s,
      order: s.order ?? i,
    }));
    await ctx.db.patch(args.sliderId, {
      name: args.name ?? undefined,
      position: args.position,
      slides: slidesWithOrder,
    });
  }),
});

export const deleteSlider = mutation({
  args: { sliderId: v.id("sliders") },
  handler: adminOnly(async (ctx: any, args: any) => {
    const slider = await ctx.db.get(args.sliderId);
    if (!slider) throw new Error("اسلایدر یافت نشد");
    await ctx.db.delete(args.sliderId);
  }),
});
