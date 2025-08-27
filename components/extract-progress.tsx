import { Card } from "@/components/ui/card"

type Stage = "idle" | "uploading" | "extracting" | "analyzing" | "ready" | "error"

export function ExtractProgress({ stage, message }: { stage: Stage; message?: string }) {
  if (stage === "idle") return null
  const widthClass =
    stage === "uploading"
      ? "w-1/4"
      : stage === "extracting"
      ? "w-3/5"
      : stage === "analyzing"
      ? "w-5/6"
      : "w-full"
  return (
    <div className="px-4 lg:px-6">
      <Card className="p-4">
        <div className="mb-2 text-sm font-medium capitalize">{stage}</div>
        <div className="h-2 w-full overflow-hidden rounded bg-muted">
          <div className={`h-full bg-primary transition-all ${widthClass}`} />
        </div>
        {message ? <div className="mt-2 text-xs text-muted-foreground">{message}</div> : null}
      </Card>
    </div>
  )
}
