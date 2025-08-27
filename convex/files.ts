import { action, mutation, query } from "./_generated/server"
import { api } from "./_generated/api"
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("unauthorized")
    const uploadId = await ctx.db.insert("uploads", {
      userId: identity.subject,
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

export const setStatus = mutation({
  args: { uploadId: v.id("uploads"), status: v.string() },
  handler: async (ctx, { uploadId, status }) => {
    await ctx.db.patch(uploadId, { status })
  },
})

export const getUpload = query({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }) => {
    return await ctx.db.get(uploadId)
  },
})

export const getDownloadUrl = action({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }): Promise<{ url: string }> => {
    const upload = await ctx.runQuery(api.files.getUpload, { uploadId }) as any
    if (!upload) throw new Error("upload not found")
    const url = (await ctx.storage.getUrl(upload.storageId)) as string | null
    if (!url) throw new Error("no url")
    return { url }
  },
})
