import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

function summarize(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const charCount = text.length
  const sentenceCount = (text.match(/[.!?]/g) || []).length || 1
  const avgWordsPerSentence = wordCount / sentenceCount
  // Simple readability proxy (not Flesch): lower is easier
  const readability = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 10))
  const suggestions: string[] = []
  if (avgWordsPerSentence > 20) suggestions.push("Shorten long sentences for clarity.")
  if (readability < 50) suggestions.push("Use simpler words and shorter sentences to improve readability.")
  if (!/\b(call to action|sign up|learn more|contact|buy now)\b/i.test(text)) suggestions.push("Add a clear call-to-action.")
  return { wordCount, charCount, readability, suggestions }
}

export const run = mutation({
  args: { extractionId: v.id("extractions") },
  handler: async (ctx, { extractionId }) => {
    const extraction = await ctx.db.get(extractionId)
    if (!extraction) throw new Error("extraction not found")
    const { wordCount, charCount, readability, suggestions } = summarize(extraction.rawText || "")
    const analysisId = await ctx.db.insert("analyses", {
      extractionId,
      metrics: { wordCount, charCount, readability },
      suggestions,
      createdAt: Date.now(),
    })
    return { analysisId }
  },
})

export const saveAnalysis = mutation({
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
    const analysis = await ctx.db.get(analysisId)
    if (!analysis) return null
    const extraction = await ctx.db.get(analysis.extractionId)
    return { analysis, extraction }
  },
})

// extraction helpers live in extractions.ts
