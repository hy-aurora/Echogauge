import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { z } from "zod"
import { rateLimit } from "@/lib/rateLimit"

// This endpoint fetches a temporary download URL from Convex for the uploaded file
// then parses PDF text on the Next.js server using pdf-parse and pdf2json, and finally
// saves the extraction back to Convex via a mutation.

export async function POST(req: NextRequest) {
  try {
    const schema = z.object({ uploadId: z.string().min(1) })
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 })
    const { uploadId } = parsed.data

    const ip = req.headers.get("x-forwarded-for") || "anon"
    const rl = rateLimit({ key: `parse:${ip}`, limit: 10, windowMs: 60_000 })
    if (!rl.ok) return NextResponse.json({ error: "rate_limited", retryAfter: rl.retryAfterSec }, { status: 429 })

    // Initialize Convex HTTP client (server-side)
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) return NextResponse.json({ error: "Convex URL missing" }, { status: 500 })
    const client = new ConvexHttpClient(convexUrl)

    // Get file download URL
    console.log("Getting download URL for uploadId:", uploadId)
    const { url } = await client.action(api.files.getDownloadUrl, { uploadId: uploadId as any })
    console.log("Download URL obtained:", url ? "success" : "failed")

    // Fetch the file bytes from storage via signed URL
    console.log("Fetching file from storage...")
    const res = await fetch(url)
    if (!res.ok) {
      console.error("Download failed with status:", res.status, res.statusText)
      return NextResponse.json({ error: "download failed" }, { status: 500 })
    }
    const ab = await res.arrayBuffer()
    const uint8 = new Uint8Array(ab)
    console.log("File downloaded, size:", uint8.length)

    // Parse PDF text: try pdf-parse first, then pdf2json, then printable-bytes
    console.log("Parsing PDF...")
    let text = ""

    const tryPrintableFallback = () => {
      const decoder = new TextDecoder("utf-8", { fatal: false })
      const decoded = decoder.decode(uint8)
      const runs = decoded.match(/[\x20-\x7E\xC2-\xF4][\x20-\x7E\x80-\xBF]{3,}/g) || []
      return runs.join("\n").slice(0, 200000)
    }

    // 1) Try pdf-parse (fast, node-oriented)
    try {
      const imported = await import("pdf-parse")
      const pdfParse = imported && (imported.default || imported)
      if (pdfParse) {
        try {
          const data = await pdfParse(Buffer.from(uint8))
          text = (data && data.text) || ""
          console.log("PDF parsed with pdf-parse, text length:", text.length)
        } catch (innerErr: any) {
          // If pdf-parse attempts to open files embedded/referenced by the PDF it may
          // surface an ENOENT with a repo/test path; don't treat that as fatal here.
          if (innerErr && innerErr.code === "ENOENT") {
            console.log("pdf-parse produced ENOENT; will try fallback. message:", innerErr.message)
          } else {
            console.log("pdf-parse parsing error, will try fallback:", innerErr?.message || innerErr)
          }
        }
      }
    } catch (e) {
      // Import failed or module not present — move on to fallback
      console.log("pdf-parse import failed, will try fallback:", (e as any)?.message || e)
    }

    // 2) If pdf-parse didn't yield text, try pdf2json (requires file path, so we'll skip for now)
    // Note: pdf2json requires a file path, not a buffer, so we'll use it in a future implementation
    // that saves the file temporarily
    if (!text || text.trim().length === 0) {
      console.log("pdf2json requires file path - skipping for now, using fallback")
    }

    // 3) If both parsers didn't yield text, try printable-bytes extraction
    if (!text || text.trim().length === 0) {
      try {
        text = tryPrintableFallback()
        console.log("Fallback printable-text extraction length:", text.length)
        if (!text || text.trim().length === 0) throw new Error("fallback empty")
      } catch (e3) {
        console.log("printable-bytes fallback failed:", e3)
        throw new Error("Failed to parse PDF")
      }
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n\s*\n/g, "\n") // Remove excessive line breaks
      .trim()

    // Save extraction in Convex
    console.log("Saving extraction to Convex...")
    const extractionId = await client.mutation(api.extractions.save, {
      uploadId: uploadId as any,
      rawText: text,
      method: "pdf",
    })
    console.log("Extraction saved with ID:", extractionId)

    return NextResponse.json({ extractionId })
  } catch (e: any) {
    console.error("Parse error:", e)
    return NextResponse.json({ error: "parse failed" }, { status: 500 })
  }
}
