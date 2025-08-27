"use client"
import dynamic from "next/dynamic"
import { ExtractProgress } from "@/components/extract-progress"
import { UploadProgressProvider, useUploadProgress } from "@/components/UploadProgressContext"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Suspense } from "react"
import { GeminiWarning } from "@/components/gemini-warning"

const FileDropCardLazy = dynamic(() => import("@/components/file-drop-card").then(m => m.FileDropCard), { ssr: false })
const HistoryTableLazy = dynamic(() => import("@/components/history-table").then(m => m.HistoryTable), { ssr: false })

function LiveProgress() {
  const { uploadId } = useUploadProgress()
  const upload = useQuery(api.files.getUpload, uploadId ? { uploadId: uploadId as Id<"uploads"> } : "skip")
  const stage = !uploadId
    ? ("idle" as const)
    : upload?.status === "uploaded"
    ? ("uploading" as const)
    : upload?.status === "extracting" || upload?.status === "extracted"
    ? ("extracting" as const)
    : upload?.status === "analyzing"
    ? ("analyzing" as const)
    : upload?.status === "done"
    ? ("ready" as const)
    : ("error" as const)
  return <ExtractProgress stage={stage} />
}

export default function DashboardClient() {
  return (
    <UploadProgressProvider>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <FileDropCardLazy />
            </div>
            <GeminiWarning />
            <Suspense fallback={<ExtractProgress stage="idle" />}>
              <LiveProgress />
            </Suspense>
            <div className="px-4 lg:px-6">
              <HistoryTableLazy />
            </div>
          </div>
        </div>
      </div>
    </UploadProgressProvider>
  )
}
