import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

export const fromPdf = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }): Promise<{ extractionId: any }> => {
    const upload = await ctx.runQuery(api.files.getUpload, { uploadId })
    if (!upload) throw new Error("upload not found")
    // Minimal text extraction stub (real parsing TBD)
    const text = "PDF text extraction coming soon"
    const extractionId = await ctx.db.insert("extractions", {
      uploadId,
      rawText: text,
      method: "pdf",
      createdAt: Date.now(),
    })
    return { extractionId }
  },
})

export const fromImage = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }): Promise<{ extractionId: any }> => {
    const upload = await ctx.runQuery(api.files.getUpload, { uploadId })
    if (!upload) throw new Error("upload not found")
    // OCR stub
    const text = "OCR result coming soon"
    const extractionId = await ctx.db.insert("extractions", {
      uploadId,
      rawText: text,
      method: "ocr",
      createdAt: Date.now(),
    })
    return { extractionId }
  },
})

// saveExtraction moved to extractions.save

// helper queries live in files.ts
