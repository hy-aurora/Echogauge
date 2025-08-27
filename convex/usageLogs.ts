import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const log = mutation({
  args: {
    action: v.string(),
    uploadId: v.optional(v.id("uploads")),
    meta: v.optional(v.any()),
    level: v.optional(v.string()),
  },
  handler: async (ctx, { action, uploadId, meta, level }) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject || "anon"
    await ctx.db.insert("usage_logs", {
      userId,
      action,
      ts: Date.now(),
      meta: { ...meta, level, uploadId },
    })
  },
})
