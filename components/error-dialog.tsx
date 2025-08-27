"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function ErrorDialog({ open, onOpenChange, title = "Something went wrong", details }: { open: boolean; onOpenChange: (v: boolean) => void; title?: string; details?: any }) {
  const [busy, setBusy] = useState(false)
  const log = useMutation(api.usageLogs.log as any)
  const onReport = async () => {
    try {
      setBusy(true)
      await log({ action: "client_error_report", level: "error", meta: { details } })
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          If the issue persists, click Report to send error details to the team.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Close</Button>
          <Button onClick={onReport} disabled={busy}>Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
