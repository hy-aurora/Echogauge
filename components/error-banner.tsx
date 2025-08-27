import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="flex items-center justify-between gap-4 border-destructive bg-destructive/5 p-4">
      <div className="text-sm text-destructive">{message}</div>
      {onRetry ? (
        <Button size="sm" variant="destructive" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Card>
  )
}
