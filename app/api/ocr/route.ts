import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { z } from "zod"
import { rateLimit } from "@/lib/rateLimit"

export async function POST(req: NextRequest) {
  const schema = z.object({ uploadId: z.string().min(1) })
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 })
  const { uploadId } = parsed.data
  const ip = req.headers.get("x-forwarded-for") || "anon"
  const rl = rateLimit({ key: `ocr:${ip}`, limit: 10, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "rate_limited", retryAfter: rl.retryAfterSec }, { status: 429 })

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!
    const client = new ConvexHttpClient(convexUrl)
    const { url } = await client.action(api.files.getDownloadUrl, { uploadId: uploadId as any })

    const res = await fetch(url)
    if (!res.ok) throw new Error("download failed")
    const ab = await res.arrayBuffer()
    const buf = Buffer.from(ab)

    // OCR with tesseract.js
    const { createWorker } = await import("tesseract.js")
    const worker = await createWorker()
    await worker.load()
    await worker.loadLanguage("eng")
    await worker.initialize("eng")
    const { data } = await worker.recognize(buf as any)
    const text = (data as any)?.text || ""
    await worker.terminate()

    const extractionId = await client.mutation(api.extractions.save, {
      uploadId: uploadId as any,
      rawText: text.trim(),
      method: "ocr",
    })
    return NextResponse.json({ extractionId })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "ocr failed" }, { status: 500 })
  }
}
