"use client"
import dynamic from "next/dynamic"
import { ExtractProgress } from "@/components/extract-progress"
import { UploadProgressProvider, useUploadProgress } from "@/components/UploadProgressContext"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Suspense } from "react"
import { GeminiWarning } from "@/components/gemini-warning"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Sparkles } from "lucide-react"

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
      <div className="space-y-6">
        {/* Upload Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Upload className="w-5 h-5 text-primary" />
              Upload & Analyze Content
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Drop your PDFs, images, or documents to get AI-powered insights
            </p>
          </CardHeader>
          <CardContent>
            <FileDropCardLazy />
            <GeminiWarning />
            <Suspense fallback={<ExtractProgress stage="idle" />}>
              <LiveProgress />
            </Suspense>
          </CardContent>
        </Card>

        {/* History Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-primary" />
              Recent Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your recently analyzed documents and their insights
            </p>
          </CardHeader>
          <CardContent>
            <HistoryTableLazy />
          </CardContent>
        </Card>
      </div>
    </UploadProgressProvider>
  )
}
