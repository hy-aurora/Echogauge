import { action, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

function summarize(text: string) {
  // Clean the text first - remove binary data patterns
  const cleanText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/stream[\s\S]*?endstream/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/[^\/\n]*\//g, '')
    .replace(/[^\w\s.,!?;:()[\]{}"'\-–—…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // If text is mostly binary/non-readable, return empty analysis
  if (cleanText.length < 50 || cleanText.split(' ').length < 10) {
    return {
      wordCount: 0,
      charCount: 0,
      readability: 0,
      suggestions: ["The uploaded file appears to be an image or contains non-text content. Please ensure you're uploading a text-based document."]
    }
  }

  const words = cleanText.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const charCount = cleanText.length
  const sentenceCount = (cleanText.match(/[.!?]/g) || []).length || 1
  const avgWordsPerSentence = wordCount / sentenceCount
  // Simple readability proxy (not Flesch): lower is easier
  const readability = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 10))
  const suggestions: string[] = []
  if (avgWordsPerSentence > 20) suggestions.push("Shorten long sentences for clarity.")
  if (readability < 50) suggestions.push("Use simpler words and shorter sentences to improve readability.")
  if (!/\b(call to action|sign up|learn more|contact|buy now)\b/i.test(cleanText)) suggestions.push("Add a clear call-to-action.")
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
    
    // Clean the text first
    const rawText = extraction.rawText || ""
    const cleanText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/stream[\s\S]*?endstream/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/[^\/\n]*\//g, '')
      .replace(/[^\w\s.,!?;:()[\]{}"'\-–—…]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // If text is too short or appears to be binary, skip AI analysis
    if (cleanText.length < 100 || cleanText.split(' ').length < 20) {
      const local = summarize(rawText)
      const analysisId = await ctx.runMutation(api.analyses.save, {
        extractionId,
        metrics: local,
        suggestions: local.suggestions,
        metadata: {
          summary: "The uploaded file appears to be an image or contains non-text content. Please ensure you're uploading a text-based document.",
          tone: "technical",
          keyTopics: ["File Analysis", "Content Type", "Text Extraction"],
          estimatedReadingTime: 0
        },
      })
      if (upload) await ctx.runMutation(api.files.setStatus, { uploadId: upload._id, status: "done" })
      return { analysisId }
    }
    
    // Improved prompt for better analysis
    const basePrompt = `Analyze the following text and provide a comprehensive analysis. Return your response as valid JSON with the following structure:

{
  "readability": number (0-100, where 100 is very easy to read),
  "summary": "1-2 sentence summary of the main content",
  "keyTopics": ["array", "of", "main", "topics"],
  "tone": "formal|informal|technical|conversational",
  "suggestions": ["array", "of", "actionable", "improvement", "suggestions"],
  "wordCount": number,
  "estimatedReadingTime": number (in minutes)
}

Text to analyze:
${cleanText.slice(0, 30000)}`

    let aiAnalysis: any = null
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
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            },
          }),
        }
      )
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Gemini API error ${res.status}: ${errorText}`)
      }
      
      const json = (await res.json()) as any
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          aiAnalysis = JSON.parse(jsonMatch[0])
          readability = typeof aiAnalysis.readability === "number" ? aiAnalysis.readability : undefined
        } catch (parseError) {
          console.log("Failed to parse Gemini JSON response:", parseError)
        }
      }
      
      // If JSON parsing failed, try to extract suggestions from plain text
      if (!aiAnalysis) {
        const suggestions = text
          .split(/\n|•|-/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 10 && s.length < 200)
          .slice(0, 8)
        aiAnalysis = { suggestions }
      }
      
    } catch (error) {
      console.log("Gemini analysis failed, falling back to local analysis:", error)
      // Continue with local analysis only
    }

    // Run local analysis
    const local = summarize(rawText)
    
    // Combine AI and local analysis
    const metrics = {
      wordCount: aiAnalysis?.wordCount || local.wordCount,
      charCount: local.charCount,
      readability: readability ?? local.readability,
    }
    
    // Merge suggestions, prioritizing AI suggestions
    const aiSuggestions = aiAnalysis?.suggestions || []
    const localSuggestions = local.suggestions || []
    const allSuggestions = [...new Set([...aiSuggestions, ...localSuggestions])].slice(0, 10)
    
    // Add additional metadata if available
    const metadata: any = {}
    if (aiAnalysis?.summary) metadata.summary = aiAnalysis.summary
    if (aiAnalysis?.keyTopics) metadata.keyTopics = aiAnalysis.keyTopics
    if (aiAnalysis?.tone) metadata.tone = aiAnalysis.tone
    if (aiAnalysis?.estimatedReadingTime) metadata.estimatedReadingTime = aiAnalysis.estimatedReadingTime

    const analysisId = await ctx.runMutation(api.analyses.save, {
      extractionId,
      metrics,
      suggestions: allSuggestions,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    })
    
    if (upload) await ctx.runMutation(api.files.setStatus, { uploadId: upload._id, status: "done" })
    return { analysisId }
  },
})
