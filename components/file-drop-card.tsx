"use client"
import { useCallback, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

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
  const analyze = useMutation(api.analyze.run)

  const onDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    if (rejected?.length) {
      toast.error("Some files were rejected. Only PDF or images under 10MB.")
      return
    }
    const file = accepted[0]
    if (!file) return
    setUploading(true)
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
        userId: "self", // optional: replace with clerk id in server mutations if needed
      })
      // Kick off extraction based on mime
      const isPdf = /pdf$/i.test(file.type) || file.name.toLowerCase().endsWith(".pdf")
      const { extractionId } = isPdf
        ? await extractPdf({ uploadId })
        : await extractImage({ uploadId })
      const { analysisId } = await analyze({ extractionId })
    router.push(`/session/${analysisId}`)
    } catch (err) {
      console.error(err)
    }
  }, [analyze, createUploadUrl, extractImage, extractPdf, markUploaded, router])

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

  return (
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
  )
}
