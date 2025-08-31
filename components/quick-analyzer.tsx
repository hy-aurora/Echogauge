"use client"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Zap, TrendingUp, Target } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const analyzeLocal = useMutation(api.analyze.run)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)
    try {
      // Create a temporary extraction record
      const tempExtraction = {
        _id: "temp-" + Date.now(),
        rawText: text,
        createdAt: Date.now(),
        uploadId: "quick-analysis",
        method: "quick",
        status: "done"
      }

      const analysisResult = await analyzeLocal({
        extractionId: tempExtraction._id as any
      })

      // Since we can't actually create a real extraction, let's simulate the analysis
      const wordCount = text.trim().split(/\s+/).length
      const charCount = text.length
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1)
      const readability = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 10))

      const suggestions = []
      if (avgWordsPerSentence > 20) suggestions.push("Shorten long sentences for clarity.")
      if (readability < 50) suggestions.push("Use simpler words and shorter sentences.")
      if (!/\b(call to action|sign up|learn more|contact|buy now)\b/i.test(text)) {
        suggestions.push("Add a clear call-to-action.")
      }
      if (wordCount < 50) suggestions.push("Consider expanding your content for better engagement.")

      setResults({
        metrics: { wordCount, charCount, readability },
        suggestions
      })
    } catch (error) {
      console.error("Analysis failed:", error)
      setResults({
        error: "Analysis failed. Please try again."
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getReadabilityLabel = (score: number) => {
    if (score >= 70) return "Excellent"
    if (score >= 50) return "Good"
    return "Needs Improvement"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Text Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste your text below for instant analysis without uploading files
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your social media post, article, or any text content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="resize-none"
        />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {text.length} characters
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze Text
              </>
            )}
          </Button>
        </div>

        {results && !results.error && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.metrics.wordCount}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.metrics.charCount}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${getReadabilityColor(results.metrics.readability)}`}>
                  {Math.round(results.metrics.readability)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getReadabilityLabel(results.metrics.readability)}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Suggestions
              </h4>
              <div className="space-y-2">
                {results.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
                {results.suggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Great job! Your content looks well-optimized.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setText("")
                  setResults(null)
                }}
              >
                Clear & Try Again
              </Button>
            </div>
          </div>
        )}

        {results?.error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{results.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
