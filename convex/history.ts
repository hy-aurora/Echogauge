import { query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { limit: v.optional(v.number()), cursor: v.optional(v.number()) },
    handler: async (ctx, { limit = 20, cursor }) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) return { items: [], nextCursor: null as number | null }
      // Find uploads by this user
      const uploads = await ctx.db
        .query("uploads")
        .withIndex("by_user", q => q.eq("userId", identity.subject))
        .order("desc")
        .collect()
      const uploadIds = new Set(uploads.map(u => u._id))
      // Get extractions for those uploads
      const extractions = await Promise.all(
        uploads.map(u => ctx.db.query("extractions").withIndex("by_upload", q => q.eq("uploadId", u._id)).collect())
      )
      const extractionIds = new Set(extractions.flat().map(e => e._id))
      // Get analyses for those extractions
      const analyses = await ctx.db
        .query("analyses")
        .withIndex("by_created")
        .order("desc")
        .collect()
      const filtered = analyses.filter(a => extractionIds.has(a.extractionId))
      const start = cursor ?? 0
      const items = filtered.slice(start, start + limit)
      const nextCursor = start + items.length < filtered.length ? start + items.length : null
      return { items, nextCursor }
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
