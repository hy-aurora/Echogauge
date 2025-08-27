import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { z } from "zod"
import { rateLimit } from "@/lib/rateLimit"

// This endpoint fetches a temporary download URL from Convex for the uploaded file
// then parses PDF text on the Next.js server using pdfjs-dist, and finally
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
    const { url } = await client.action(api.files.getDownloadUrl, { uploadId: uploadId as any })

    // Fetch the file bytes from storage via signed URL
    const res = await fetch(url)
    if (!res.ok) return NextResponse.json({ error: "download failed" }, { status: 500 })
    const ab = await res.arrayBuffer()
    const uint8 = new Uint8Array(ab)

    // Parse PDF text with pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs")
    // @ts-ignore
    const loadingTask = (pdfjsLib as any).getDocument({ data: uint8 })
    const pdf = await loadingTask.promise
    let text = ""
    const max = Math.min(pdf.numPages || 1, 20)
    for (let i = 1; i <= max; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const str = (content.items || []).map((it: any) => it.str).join(" ")
      text += str + "\n"
    }

    // Save extraction in Convex
    const extractionId = await client.mutation(api.extractions.save, {
      uploadId: uploadId as any,
      rawText: text.trim(),
      method: "pdf",
    })

    return NextResponse.json({ extractionId })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "parse failed" }, { status: 500 })
  }
}
