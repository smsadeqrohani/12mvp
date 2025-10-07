import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * File management functions
 */

export const getAllFiles = query({
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
      throw new Error("Only admins can view all files");
    }
    
    const paginatedResult = await ctx.db
      .query("files")
      .order("desc")
      .paginate(args.paginationOpts);
    
    // Get uploader names
    const filesWithUploaderNames = await Promise.all(
      paginatedResult.page.map(async (file) => {
        const uploader = await ctx.db.get(file.uploadedBy);
        return {
          ...file,
          uploaderName: uploader?.email || "Unknown",
        };
      })
    );
    
    return {
      page: filesWithUploaderNames,
      isDone: paginatedResult.isDone,
      continueCursor: paginatedResult.continueCursor,
    };
  },
});

export const uploadFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
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
      throw new Error("Only admins can upload files");
    }
    
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      fileName: args.fileName,
      originalName: args.originalName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedBy: currentUserId,
      uploadedAt: Date.now(),
    });
  },
});

export const renameFile = mutation({
  args: {
    fileId: v.id("files"),
    newName: v.string(),
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
      throw new Error("Only admins can rename files");
    }
    
    // Check if file exists
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    await ctx.db.patch(args.fileId, {
      fileName: args.newName,
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
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
      throw new Error("Only admins can delete files");
    }
    
    // Check if file exists
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete from database
    await ctx.db.delete(args.fileId);
  },
});

