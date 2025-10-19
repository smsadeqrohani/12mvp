import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { adminOnly } from "./utils";

/**
 * Categories CRUD operations
 */

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Anyone authenticated can view categories
    return await ctx.db.query("categories").order("desc").collect();
  },
});

export const getCategoriesPaginated = query({
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
      throw new Error("Only admins can view paginated categories");
    }
    
    return await ctx.db
      .query("categories")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .unique();
  },
});

export const createCategory = mutation({
  args: {
    persianName: v.string(),
    slug: v.string(),
    englishName: v.optional(v.string()),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    // Validate slug uniqueness
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .unique();
    
    if (existingCategory) {
      throw new Error("دسته‌بندی با این slug قبلاً ایجاد شده است");
    }
    
    // Validate required fields
    if (!args.persianName.trim()) {
      throw new Error("نام فارسی الزامی است");
    }
    
    if (!args.slug.trim()) {
      throw new Error("slug الزامی است");
    }
    
    // Validate slug format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new Error("slug باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد");
    }
    
    const categoryId = await ctx.db.insert("categories", {
      persianName: args.persianName,
      slug: args.slug,
      englishName: args.englishName,
    });
    
    return categoryId;
  }),
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    persianName: v.string(),
    slug: v.string(),
    englishName: v.optional(v.string()),
  },
  handler: adminOnly(async (ctx: any, args: any) => {
    // Check if category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("دسته‌بندی یافت نشد");
    }
    
    // If slug is being changed, validate uniqueness
    if (category.slug !== args.slug) {
      const existingCategory = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
        .unique();
      
      if (existingCategory) {
        throw new Error("دسته‌بندی با این slug قبلاً ایجاد شده است");
      }
    }
    
    // Validate required fields
    if (!args.persianName.trim()) {
      throw new Error("نام فارسی الزامی است");
    }
    
    if (!args.slug.trim()) {
      throw new Error("slug الزامی است");
    }
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new Error("slug باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد");
    }
    
    await ctx.db.patch(args.categoryId, {
      persianName: args.persianName,
      slug: args.slug,
      englishName: args.englishName,
    });
  }),
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: adminOnly(async (ctx: any, args: any) => {
    // Check if category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("دسته‌بندی یافت نشد");
    }
    
    // Check if any questions are using this category
    const questionsWithCategory = await ctx.db
      .query("questionCategories")
      .withIndex("by_category", (q: any) => q.eq("categoryId", args.categoryId))
      .collect();
    
    const isInUse = questionsWithCategory.length > 0;
    
    if (isInUse) {
      throw new Error("این دسته‌بندی در حال استفاده در سؤالات است و نمی‌توان آن را حذف کرد");
    }
    
    await ctx.db.delete(args.categoryId);
  }),
});

