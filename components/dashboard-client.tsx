"use client"
import dynamic from "next/dynamic"
import { SiteHeader } from "@/components/site-header"
import { ExtractProgress } from "@/components/extract-progress"
import { Suspense } from "react"

const FileDropCardLazy = dynamic(() => import("@/components/file-drop-card").then(m => m.FileDropCard), { ssr: false })
const HistoryTableLazy = dynamic(() => import("@/components/history-table").then(m => m.HistoryTable), { ssr: false })

export default function DashboardClient() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 lg:px-6">
              <FileDropCardLazy />
            </div>
            <Suspense fallback={<ExtractProgress stage="idle" />}>
              {/* Placeholder for live upload/extract progress */}
            </Suspense>
            <div className="px-4 lg:px-6">
              <HistoryTableLazy />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
