import { action, mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createUploadUrl = action({
  args: {
    mime: v.optional(v.string()),
  },
  handler: async (ctx) => {
  const url = await ctx.storage.generateUploadUrl()
    return { uploadUrl: url, maxSize: 10 * 1024 * 1024 }
  },
})

export const markUploaded = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    mime: v.string(),
    size: v.number(),
    userId: v.string(), // clerk user id
  },
  handler: async (ctx, args) => {
    const uploadId = await ctx.db.insert("uploads", {
      userId: args.userId,
      fileName: args.fileName,
      mime: args.mime,
      size: args.size,
      storageId: args.storageId,
      createdAt: Date.now(),
      status: "uploaded",
    })
    return { uploadId }
  },
})

export const getUpload = query({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }) => {
    return await ctx.db.get(uploadId)
  },
})
