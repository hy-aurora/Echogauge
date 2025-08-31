import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    mood: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("unauthorized")

    const logId = await ctx.db.insert("personal_logs", {
      userId: identity.subject,
      title: args.title,
      content: args.content,
      tags: args.tags,
      mood: args.mood,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return logId
  },
})

export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    return await ctx.db
      .query("personal_logs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()
  },
})

export const update = mutation({
  args: {
    logId: v.id("personal_logs"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    mood: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("unauthorized")

    const log = await ctx.db.get(args.logId)
    if (!log || log.userId !== identity.subject) throw new Error("unauthorized")

    await ctx.db.patch(args.logId, {
      ...args,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { logId: v.id("personal_logs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("unauthorized")

    const log = await ctx.db.get(args.logId)
    if (!log || log.userId !== identity.subject) throw new Error("unauthorized")

    await ctx.db.delete(args.logId)
  },
})
