"use client"
import React, { createContext, useContext, useState } from "react"

type Ctx = {
  uploadId: string | null
  setUploadId: (id: string | null) => void
}

const UploadProgressCtx = createContext<Ctx | undefined>(undefined)

export function UploadProgressProvider({ children }: { children: React.ReactNode }) {
  const [uploadId, setUploadId] = useState<string | null>(null)
  return (
    <UploadProgressCtx.Provider value={{ uploadId, setUploadId }}>
      {children}
    </UploadProgressCtx.Provider>
  )
}

export function useUploadProgress() {
  const ctx = useContext(UploadProgressCtx)
  if (!ctx) throw new Error("useUploadProgress must be used within UploadProgressProvider")
  return ctx
}
