import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

export const fromPdf = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }): Promise<{ extractionId: any }> => {
    const upload = await ctx.runQuery(api.files.getUpload, { uploadId })
    if (!upload) throw new Error("upload not found")
    // update status while extracting
    try {
      await ctx.db.patch(uploadId, { status: "extracting" })
    } catch {}
    // Minimal text extraction stub (real parsing TBD)
    const text = "PDF text extraction coming soon"
    const extractionId = await ctx.db.insert("extractions", {
      uploadId,
      rawText: text,
      method: "pdf",
      status: "processing",
      createdAt: Date.now(),
    })
    // Mark done immediately in stub
    await ctx.db.patch(extractionId, { status: "done" })
    try {
      await ctx.db.patch(uploadId, { status: "extracted" })
    } catch {}
    return { extractionId }
  },
})

export const fromImage = mutation({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, { uploadId }): Promise<{ extractionId: any }> => {
    const upload = await ctx.runQuery(api.files.getUpload, { uploadId })
    if (!upload) throw new Error("upload not found")
    try {
      await ctx.db.patch(uploadId, { status: "extracting" })
    } catch {}
    // OCR stub
    const text = "OCR result coming soon"
    const extractionId = await ctx.db.insert("extractions", {
      uploadId,
      rawText: text,
      method: "ocr",
      status: "processing",
      createdAt: Date.now(),
    })
    await ctx.db.patch(extractionId, { status: "done" })
    try {
      await ctx.db.patch(uploadId, { status: "extracted" })
    } catch {}
    return { extractionId }
  },
})

// Node actions for real parsing
// Node-only actions moved to extract_node.ts

// saveExtraction moved to extractions.save

// helper queries live in files.ts
