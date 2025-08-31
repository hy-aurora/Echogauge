import { query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { 
    limit: v.optional(v.number()), 
    cursor: v.optional(v.number()),
    search: v.optional(v.string()),
    filter: v.optional(v.string()) // "all", "recent", "this_week", "this_month"
  },
  handler: async (ctx, { limit = 20, cursor, search, filter = "all" }) => {
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
    let analyses = await ctx.db
      .query("analyses")
      .withIndex("by_created")
      .order("desc")
      .collect()
    
    // Filter by user's extractions
    analyses = analyses.filter(a => extractionIds.has(a.extractionId))
    
    // Apply date filter
    if (filter !== "all") {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      analyses = analyses.filter(a => {
        const analysisDate = new Date(a.createdAt)
        switch (filter) {
          case "recent":
            return analysisDate >= startOfDay
          case "this_week":
            return analysisDate >= startOfWeek
          case "this_month":
            return analysisDate >= startOfMonth
          default:
            return true
        }
      })
    }
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
      analyses = analyses.filter(a => {
        // Search in metrics
        const metrics = a.metrics as any
        if (metrics?.wordCount?.toString().includes(searchLower) ||
            metrics?.readability?.toString().includes(searchLower)) {
          return true
        }
        
        // Search in suggestions
        if (a.suggestions?.some((s: string) => s.toLowerCase().includes(searchLower))) {
          return true
        }
        
        // Search in metadata
        const metadata = a.metadata as any
        if (metadata?.summary?.toLowerCase().includes(searchLower) ||
            metadata?.tone?.toLowerCase().includes(searchLower) ||
            metadata?.keyTopics?.some((t: string) => t.toLowerCase().includes(searchLower))) {
          return true
        }
        
        return false
      })
    }
    
    const start = cursor ?? 0
    const items = analyses.slice(start, start + limit)
    const nextCursor = start + items.length < analyses.length ? start + items.length : null
    
    return { items, nextCursor, total: analyses.length }
  },
})

export const get = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, { analysisId }) => {
    const analysis = await ctx.db.get(analysisId)
    if (!analysis) return null
    
    const extraction = await ctx.db.get(analysis.extractionId)
    if (!extraction) return null
    
    const upload = await ctx.db.get(extraction.uploadId)
    
    return { 
      analysis, 
      extraction,
      upload,
      // Add computed fields for better UX
      computed: {
        isRecent: Date.now() - analysis.createdAt < 24 * 60 * 60 * 1000, // Within 24 hours
        ageInDays: Math.floor((Date.now() - analysis.createdAt) / (24 * 60 * 60 * 1000)),
        readabilityLevel: analysis.metrics?.readability > 70 ? "high" : 
                         analysis.metrics?.readability > 40 ? "medium" : "low"
      }
    }
  },
})

export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    
    // Get user's uploads
    const uploads = await ctx.db
      .query("uploads")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
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
    
    const userAnalyses = analyses.filter(a => extractionIds.has(a.extractionId))
    
    // Calculate stats
    const totalAnalyses = userAnalyses.length
    const totalWords = userAnalyses.reduce((sum, a) => sum + ((a.metrics as any)?.wordCount || 0), 0)
    const avgReadability = totalAnalyses > 0 
      ? userAnalyses.reduce((sum, a) => sum + ((a.metrics as any)?.readability || 0), 0) / totalAnalyses 
      : 0
    
    // Recent activity (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentAnalyses = userAnalyses.filter(a => a.createdAt >= weekAgo)
    
    return {
      totalAnalyses,
      totalWords,
      avgReadability: Math.round(avgReadability),
      recentAnalyses: recentAnalyses.length,
      uploadsCount: uploads.length
    }
  },
})
