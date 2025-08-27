"use client"
import { Card } from "@/components/ui/card"

export function GeminiWarning() {
  const hasGemini = Boolean(process.env.NEXT_PUBLIC_HAS_GEMINI || process.env.GEMINI_API_KEY)
  if (hasGemini) return null
  return (
    <div className="px-4 lg:px-6">
      <Card className="border-yellow-400/50 bg-yellow-500/5 p-3 text-sm">
        Gemini API key not set. Using local analysis only. Set GEMINI_API_KEY in .env.local.
      </Card>
    </div>
  )
}
