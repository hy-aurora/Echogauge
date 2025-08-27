import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const save = mutation({
  args: {
    extractionId: v.id("extractions"),
    metrics: v.object({ wordCount: v.number(), charCount: v.number(), readability: v.number() }),
    suggestions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("analyses", {
      extractionId: args.extractionId,
      metrics: args.metrics,
      suggestions: args.suggestions,
      createdAt: Date.now(),
    })
    return id
  },
})

export const get = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, { analysisId }) => {
    return await ctx.db.get(analysisId)
  },
})
