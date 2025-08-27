"use client"
import { ExtractProgress } from "@/components/extract-progress"
import { useUploadProgress } from "@/components/UploadProgressContext"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type Stage = "idle" | "uploading" | "extracting" | "analyzing" | "ready" | "error"

export function LiveExtractProgress() {
  const { uploadId } = useUploadProgress()
  const upload = useQuery(api.files.getUpload, uploadId ? { uploadId: uploadId as any } : "skip" as any)

  if (!uploadId) return null
  let stage: Stage = "idle"
  switch (upload?.status) {
    case "uploaded":
      stage = "uploading"
      break
    case "extracting":
      stage = "extracting"
      break
    case "analyzing":
      stage = "analyzing"
      break
    case "extracted":
      stage = "analyzing"
      break
    case "done":
      stage = "ready"
      break
    case "error":
      stage = "error"
      break
    default:
      stage = "idle"
  }
  if (stage === "idle") return null
  return <ExtractProgress stage={stage} />
}
