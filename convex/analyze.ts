import { action, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

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
    // set status to analyzing
    try {
      const upload = await ctx.db.get(extraction.uploadId)
      if (upload) await ctx.db.patch(upload._id, { status: "analyzing" })
    } catch {}
    const { wordCount, charCount, readability, suggestions } = summarize(extraction.rawText || "")
    const analysisId = await ctx.db.insert("analyses", {
      extractionId,
      metrics: { wordCount, charCount, readability },
      suggestions,
      status: "processing",
      createdAt: Date.now(),
    })
    // mark done (in future, long-running tasks could update later)
    await ctx.db.patch(analysisId, { status: "done" })
    try {
      const upload = await ctx.db.get(extraction.uploadId)
      if (upload) await ctx.db.patch(upload._id, { status: "done" })
    } catch {}
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

export const gemini = action({
  args: { extractionId: v.id("extractions") },
  handler: async (ctx, { extractionId }): Promise<{ analysisId: any }> => {
  const extraction = await ctx.runQuery(api.extractions.get, { extractionId })
    if (!extraction) throw new Error("extraction not found")
  // set related upload to analyzing
  const upload = await ctx.runQuery(api.files.getUpload, { uploadId: extraction.uploadId })
  if (upload) await ctx.runMutation(api.files.setStatus, { uploadId: upload._id, status: "analyzing" })

    const apiKey = (process.env.GEMINI_API_KEY || "").trim()
    const basePrompt = `Analyze the following text and return JSON with keys: readability (0-100), summary (1-2 sentences), suggestions (array of short actionable strings). Text:\n\n${extraction.rawText?.slice(0, 20000) || ""}`

    let aiSuggestions: string[] = []
    let readability = undefined as number | undefined
    try {
      if (!apiKey) throw new Error("missing api key")
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: basePrompt }],
              },
            ],
          }),
        }
      )
      if (!res.ok) throw new Error(`gemini http ${res.status}`)
      const json = (await res.json()) as any
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        aiSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 10) : []
        if (typeof parsed.readability === "number") readability = parsed.readability
      } else {
        // fallback simple parsing
        aiSuggestions = text
          .split(/\n|•|-/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 10)
      }
  } catch {
      // ignore and use local analysis only
    }

    const local = summarize(extraction.rawText || "")
    const metrics = {
      wordCount: local.wordCount,
      charCount: local.charCount,
      readability: readability ?? local.readability,
    }
    const suggestions = [...new Set([...(aiSuggestions || []), ...local.suggestions])].slice(0, 10)

  const analysisId = await ctx.runMutation(api.analyses.save, {
      extractionId,
      metrics,
      suggestions,
    })
  if (upload) await ctx.runMutation(api.files.setStatus, { uploadId: upload._id, status: "done" })
    return { analysisId }
  },
})
