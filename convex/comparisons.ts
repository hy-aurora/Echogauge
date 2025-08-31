import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    analysisIds: v.array(v.id("analyses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("unauthorized")

    // Get the analyses to compare
    const analyses = await Promise.all(
      args.analysisIds.map(id => ctx.db.get(id))
    )

    // Filter out any null analyses
    const validAnalyses = analyses.filter((a): a is NonNullable<typeof a> => a !== null)
    if (validAnalyses.length < 2) {
      throw new Error("Need at least 2 valid analyses to compare")
    }

    // Calculate comparison metrics
    const comparisonData = {
      totalAnalyses: validAnalyses.length,
      avgReadability: validAnalyses.reduce((sum, a) => sum + ((a.metrics as any)?.readability || 0), 0) / validAnalyses.length,
      totalWords: validAnalyses.reduce((sum, a) => sum + ((a.metrics as any)?.wordCount || 0), 0),
      readabilityRange: {
        min: Math.min(...validAnalyses.map(a => (a.metrics as any)?.readability || 0)),
        max: Math.max(...validAnalyses.map(a => (a.metrics as any)?.readability || 0)),
      },
      wordCountRange: {
        min: Math.min(...validAnalyses.map(a => (a.metrics as any)?.wordCount || 0)),
        max: Math.max(...validAnalyses.map(a => (a.metrics as any)?.wordCount || 0)),
      },
      commonSuggestions: getCommonSuggestions(validAnalyses),
      toneVariety: getToneVariety(validAnalyses),
      analysisDetails: validAnalyses.map(a => ({
        id: a._id,
        metrics: a.metrics,
        suggestions: a.suggestions,
        metadata: a.metadata,
        createdAt: a.createdAt,
      }))
    }

    const comparisonId = await ctx.db.insert("comparisons", {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      analysisIds: args.analysisIds,
      comparisonData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return comparisonId
  },
})

export const getAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    return await ctx.db
      .query("comparisons")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect()
  },
})

export const get = query({
  args: { comparisonId: v.id("comparisons") },
  handler: async (ctx, { comparisonId }) => {
    const comparison = await ctx.db.get(comparisonId)
    if (!comparison) return null

    const identity = await ctx.auth.getUserIdentity()
    if (!identity || comparison.userId !== identity.subject) return null

    return comparison
  },
})

export const remove = mutation({
  args: { comparisonId: v.id("comparisons") },
  handler: async (ctx, { comparisonId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("unauthorized")

    const comparison = await ctx.db.get(comparisonId)
    if (!comparison || comparison.userId !== identity.subject) throw new Error("unauthorized")

    await ctx.db.delete(comparisonId)
  },
})

// Helper functions
function getCommonSuggestions(analyses: any[]) {
  const allSuggestions = analyses.flatMap(a => a.suggestions || [])
  const suggestionCounts = allSuggestions.reduce((acc, suggestion) => {
    acc[suggestion] = (acc[suggestion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(suggestionCounts)
    .filter(([_, count]) => (count as number) > 1)
    .sort(([_, a], [__, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([suggestion, count]) => ({ suggestion, count }))
}

function getToneVariety(analyses: any[]) {
  const tones = analyses
    .map(a => (a.metadata as any)?.tone)
    .filter(Boolean)
    .map(tone => tone.toLowerCase())

  const uniqueTones = [...new Set(tones)]
  const toneCounts = uniqueTones.reduce((acc, tone) => {
    acc[tone] = tones.filter(t => t === tone).length
    return acc
  }, {} as Record<string, number>)

  return {
    uniqueTones: uniqueTones.length,
    toneDistribution: toneCounts,
    mostCommonTone: Object.entries(toneCounts).sort(([_, a], [__, b]) => (b as number) - (a as number))[0]?.[0] || null
  }
}
