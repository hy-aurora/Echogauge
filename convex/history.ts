import { query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { limit: v.optional(v.number()), cursor: v.optional(v.number()) },
  handler: async (ctx, { limit = 20, cursor }) => {
    // If user table links to Clerk, try to scope by identity
    const identity = await ctx.auth.getUserIdentity()
    // For now, list latest analyses globally or later join by user uploads
    const analyses = await ctx.db
      .query("analyses")
      .order("desc")
      .collect()
    const items = analyses.slice(cursor ?? 0, (cursor ?? 0) + limit)
    return { items, nextCursor: (cursor ?? 0) + items.length < analyses.length ? (cursor ?? 0) + items.length : null }
  },
})

export const get = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, { analysisId }) => {
    const analysis = await ctx.db.get(analysisId)
    if (!analysis) return null
    const extraction = await ctx.db.get(analysis.extractionId)
    return { analysis, extraction }
  },
})
