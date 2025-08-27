"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function ExtractionView({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "")
      setCopied(true)
      toast.success("Copied text")
      setTimeout(() => setCopied(false), 1000)
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <Card className="flex min-h-60 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">Extracted Text</div>
        <Button onClick={onCopy} size="sm" variant="outline">
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="max-h-[60dvh] overflow-auto rounded border bg-background p-3 text-sm">
        {text ? text : <span className="text-muted-foreground">No text yet.</span>}
      </div>
    </Card>
  )
}
