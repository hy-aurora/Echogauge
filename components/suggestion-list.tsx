"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function SuggestionList({ suggestions }: { suggestions: string[] }) {
  const copy = async (s: string) => {
    try {
      await navigator.clipboard.writeText(s)
      toast.success("Suggestion copied")
    } catch {
      toast.error("Copy failed")
    }
  }
  const list = suggestions?.length ? suggestions : [
    "Open with a stronger hook and a specific benefit.",
    "Add a concise CTA like ‘Try it free today’.",
    "Use 1–2 relevant hashtags and 1 link max.",
  ]
  return (
    <Card className="flex flex-col divide-y">
      {list.map((s, i) => (
        <div key={i} className="flex items-start justify-between gap-3 p-4">
          <p className="text-sm">{s}</p>
          <Button size="sm" variant="outline" onClick={() => copy(s)}>Copy</Button>
        </div>
      ))}
    </Card>
  )
}
