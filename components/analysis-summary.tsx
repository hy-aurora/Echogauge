import { Card } from "@/components/ui/card"

type Metrics = {
  wordCount?: number
  readingTimeMin?: number
  readability?: number
  ctaPresent?: boolean
  hashtags?: number
  links?: number
  sentiment?: number
}

export function AnalysisSummary({ metrics }: { metrics: Metrics }) {
  const m: Metrics = { wordCount: 0, readingTimeMin: 0, hashtags: 0, links: 0, ...metrics }
  return (
    <Card className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
      <Metric label="Words" value={m.wordCount ?? 0} />
      <Metric label="Read mins" value={m.readingTimeMin ?? 0} />
      <Metric label="Readability" value={m.readability ?? 0} />
      <Metric label="CTA" value={m.ctaPresent ? "Yes" : "No"} />
      <Metric label="#Tags" value={m.hashtags ?? 0} />
      <Metric label="Links" value={m.links ?? 0} />
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border bg-card p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-medium">{String(value)}</div>
    </div>
  )
}
