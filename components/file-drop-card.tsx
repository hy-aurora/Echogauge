"use client"
import { useCallback, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUploadProgress } from "@/components/UploadProgressContext"
import { Id } from "@/convex/_generated/dataModel"
import { ErrorDialog } from "@/components/error-dialog"

const ACCEPT = {
  "application/pdf": [".pdf"],
  "image/*": [".png", ".jpg", ".jpeg", ".webp"],
}

export function FileDropCard() {
  const [isUploading, setUploading] = useState(false)
  const maxSize = 10 * 1024 * 1024 // 10MB
  const router = useRouter()
  const createUploadUrl = useAction(api.files.createUploadUrl)
  const markUploaded = useMutation(api.files.markUploaded)
  const extractPdf = useMutation(api.extract.fromPdf)
  const extractImage = useMutation(api.extract.fromImage)
  // Node PDF extraction temporarily disabled due to bundling issues
  const extractPdfNode = null as any
  const analyzeLocal = useMutation(api.analyze.run)
  const analyzeGemini = useAction(api.analyze.gemini)
  const { setUploadId } = useUploadProgress()
  const canUseGemini = Boolean(process.env.NEXT_PUBLIC_HAS_GEMINI || process.env.GEMINI_API_KEY)
  const log = useMutation(api.usageLogs.log as any)

  const onDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    if (rejected?.length) {
      toast.error("Some files were rejected. Only PDF or images under 10MB.")
      return
    }
    const file = accepted[0]
    if (!file) return
  setUploading(true)
  toast.message("Uploading…")
  try {
      const { uploadUrl } = await createUploadUrl({})
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      })
      if (!res.ok) throw new Error("upload failed")
      const json = await res.json()
      const { storageId } = json
      const { uploadId } = await markUploaded({
        storageId,
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
      })
  setUploadId(uploadId as unknown as string)
      // Kick off extraction based on mime
      const isPdf = /pdf$/i.test(file.type) || file.name.toLowerCase().endsWith(".pdf")
      toast.message(isPdf ? "Extracting PDF…" : "Running OCR…")
      let extractionId: string
  const maxRetries = 3
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))
  const jitter = (base: number) => base + Math.floor(Math.random() * 150)
      const parsePdf = async () => {
        // Prefer server API route to parse PDFs with pdfjs-dist
        const resp = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId }),
        })
        if (!resp.ok) throw new Error("parse http")
        const j = await resp.json()
        return j.extractionId as string
      }
      for (let i = 0; ; i++) {
        try {
          if (isPdf) {
            extractionId = await parsePdf()
          } else {
            // Use Next OCR endpoint to avoid Convex bundling issues
            const resp = await fetch("/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uploadId }),
            })
            if (!resp.ok) throw new Error("ocr http")
            const j = await resp.json()
            extractionId = j.extractionId as string
          }
          break
        } catch (e) {
          await log({ action: isPdf ? "parse_pdf_error" : "ocr_error", uploadId: uploadId as any, meta: { message: (e as any)?.message }, level: "error" }).catch(() => {})
          if (i >= maxRetries - 1) throw e
          const delay = jitter(200 * Math.pow(2, i))
          await sleep(delay)
        }
      }
  toast.message("Analyzing…")
      let analysisId: string
    if (canUseGemini) {
        try {
          const r = await analyzeGemini({ extractionId: extractionId as unknown as Id<"extractions"> })
          analysisId = r.analysisId as unknown as string
        } catch {
      await log({ action: "analyze_gemini_error", uploadId: uploadId as any, meta: { extractionId }, level: "error" }).catch(() => {})
          const r = await analyzeLocal({ extractionId: extractionId as unknown as Id<"extractions"> })
          analysisId = r.analysisId as unknown as string
        }
      } else {
        const r = await analyzeLocal({ extractionId: extractionId as unknown as Id<"extractions"> })
        analysisId = r.analysisId as unknown as string
      }
      toast.success("Ready! Opening session…")
      router.push(`/session/${analysisId}`)
      setUploadId(null)
    } catch (err) {
      console.error(err)
      toast.error("Upload failed. Please try again.")
  try { await log({ action: "upload_pipeline_error", meta: { message: (err as any)?.message }, level: "error" }) } catch {}
      setUploadId(null)
  setLastError({ message: (err as any)?.message })
  setErrorOpen(true)
    }
  }, [analyzeGemini, analyzeLocal, createUploadUrl, extractImage, extractPdf, markUploaded, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: ACCEPT,
    maxSize,
  })

  const hint = useMemo(
    () => (isDragActive ? "Drop the file here…" : "Drag & drop or click to upload (PDF, PNG, JPG)") ,
    [isDragActive]
  )

  const [errorOpen, setErrorOpen] = useState(false)
  const [lastError, setLastError] = useState<any>(null)

  return (
  <>
  <Card
      className="flex min-h-40 flex-col items-center justify-center gap-3 border-dashed p-8 text-center"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="text-sm text-muted-foreground">{hint}</div>
      <Button disabled={isUploading} variant="outline">
        {isUploading ? "Uploading…" : "Choose file"}
      </Button>
    </Card>
  <ErrorDialog open={errorOpen} onOpenChange={setErrorOpen} details={lastError} />
  </>
  )
}
