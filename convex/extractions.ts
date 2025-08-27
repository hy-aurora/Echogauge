import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const save = mutation({
  args: {
    uploadId: v.id("uploads"),
    rawText: v.string(),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const extractionId = await ctx.db.insert("extractions", {
      uploadId: args.uploadId,
      rawText: args.rawText,
      method: args.method,
      createdAt: Date.now(),
    })
    await ctx.db.patch(args.uploadId, { status: "processing" })
    return extractionId
  },
})

export const get = query({
  args: { extractionId: v.id("extractions") },
  handler: async (ctx, { extractionId }) => {
    return await ctx.db.get(extractionId)
  },
})
