"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExtractionView } from "@/components/extraction-view"
import { AnalysisSummary } from "@/components/analysis-summary"
import { SuggestionList } from "@/components/suggestion-list"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBanner } from "@/components/error-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Sparkles, TrendingUp, Clock, Tag, MessageSquare } from "lucide-react"

export default function SessionClient({ id }: { id: string }) {
  const isLikelyConvexId = typeof id === "string" && id.length > 10
  const data = useQuery(
    api.history.get,
    isLikelyConvexId ? ({ analysisId: id as unknown as Id<"analyses"> }) : ("skip" as any)
  )
  if (!isLikelyConvexId) {
    return (
      <main className="flex flex-col gap-6 p-6">
        <ErrorBanner message="Invalid session id. Open a session from your dashboard history." />
      </main>
    )
  }

  const text = data?.extraction?.rawText ?? ""
  const metrics = (data?.analysis?.metrics as any) || {}
  const suggestions = (data?.analysis?.suggestions as any) || []
  const metadata = (data?.analysis?.metadata as any) || {}

  if (!data) {
    return (
      <main className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-6 p-6 min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analysis Session</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Content Analysis</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportMarkdown(id, text, metrics, suggestions, metadata)}>
            Export Markdown
          </Button>
          <Button onClick={() => exportPdf(id, text, metrics, suggestions, metadata)}>Export PDF</Button>
        </div>
      </div>

      {/* Enhanced Analysis Overview */}
      {(metadata.summary || metadata.keyTopics || metadata.tone || metadata.estimatedReadingTime) && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Analysis Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metadata.summary && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Summary
                </h3>
                <p className="text-muted-foreground">{metadata.summary}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metadata.tone && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tone:</span>
                  <Badge variant="secondary">{metadata.tone}</Badge>
                </div>
              )}
              
              {metadata.estimatedReadingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Reading Time:</span>
                  <Badge variant="outline">{metadata.estimatedReadingTime} min</Badge>
                </div>
              )}
              
              {metrics.readability !== undefined && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Readability:</span>
                  <Badge variant={metrics.readability > 70 ? "default" : metrics.readability > 40 ? "secondary" : "destructive"}>
                    {metrics.readability}/100
                  </Badge>
                </div>
              )}
            </div>

            {metadata.keyTopics && metadata.keyTopics.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Key Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {metadata.keyTopics.map((topic: string, index: number) => (
                    <Badge key={index} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/50">
        <CardContent className="p-0">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Extracted Text
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Suggestions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="p-6">
              <ExtractionView text={text} />
            </TabsContent>
            <TabsContent value="insights" className="p-6">
              <AnalysisSummary metrics={metrics} />
            </TabsContent>
            <TabsContent value="suggestions" className="p-6">
              <SuggestionList suggestions={suggestions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}

function exportMarkdown(id: string, text: string, metrics: any, suggestions: string[], metadata: any) {
  const md = `# EchoGauge Analysis Session ${id}

Generated: ${new Date().toISOString()}

## AI Analysis Overview

${metadata.summary ? `**Summary:** ${metadata.summary}\n\n` : ''}
${metadata.tone ? `**Tone:** ${metadata.tone}\n\n` : ''}
${metadata.estimatedReadingTime ? `**Estimated Reading Time:** ${metadata.estimatedReadingTime} minutes\n\n` : ''}
${metadata.keyTopics && metadata.keyTopics.length > 0 ? `**Key Topics:** ${metadata.keyTopics.join(', ')}\n\n` : ''}

## Extracted Text

${text || '(empty)'}

## Insights

- **Word Count:** ${metrics.wordCount || 'N/A'}
- **Character Count:** ${metrics.charCount || 'N/A'}
- **Readability Score:** ${metrics.readability || 'N/A'}/100

## Suggestions

${suggestions.map(s => `- ${s}`).join('\n') || '(none)'}`
  
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `echogauge-analysis-${id}.md`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportPdf(id: string, text: string, metrics: any, suggestions: string[], metadata: any) {
  try {
    // Import pdf-lib dynamically to avoid SSR issues
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    let yPosition = height - 50
    const lineHeight = 14
    const titleSize = 16
    const subtitleSize = 12
    const bodySize = 10
    
    // Title
    page.drawText(`EchoGauge Analysis Session ${id}`, {
      x: 50,
      y: yPosition,
      size: titleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 2
    
    // Generated date
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    yPosition -= lineHeight * 2
    
    // AI Analysis Overview
    if (metadata.summary || metadata.tone || metadata.estimatedReadingTime || metadata.keyTopics) {
      page.drawText('AI Analysis Overview', {
        x: 50,
        y: yPosition,
        size: subtitleSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      yPosition -= lineHeight * 1.5
      
      if (metadata.summary) {
        page.drawText(`Summary: ${metadata.summary}`, {
          x: 50,
          y: yPosition,
          size: bodySize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
      }
      
      if (metadata.tone) {
        page.drawText(`Tone: ${metadata.tone}`, {
          x: 50,
          y: yPosition,
          size: bodySize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
      }
      
      if (metadata.estimatedReadingTime) {
        page.drawText(`Estimated Reading Time: ${metadata.estimatedReadingTime} minutes`, {
          x: 50,
          y: yPosition,
          size: bodySize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
      }
      
      if (metadata.keyTopics && metadata.keyTopics.length > 0) {
        page.drawText(`Key Topics: ${metadata.keyTopics.join(', ')}`, {
          x: 50,
          y: yPosition,
          size: bodySize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight * 2
      }
    }
    
    // Insights
    page.drawText('Insights', {
      x: 50,
      y: yPosition,
      size: subtitleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 1.5
    
    page.drawText(`Word Count: ${metrics.wordCount || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight
    
    page.drawText(`Character Count: ${metrics.charCount || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight
    
    page.drawText(`Readability Score: ${metrics.readability || 'N/A'}/100`, {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 2
    
    // Suggestions
    page.drawText('Suggestions', {
      x: 50,
      y: yPosition,
      size: subtitleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 1.5
    
    if (suggestions && suggestions.length > 0) {
      suggestions.forEach((suggestion: string) => {
        page.drawText(`• ${suggestion}`, {
          x: 50,
          y: yPosition,
          size: bodySize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
      })
    } else {
      page.drawText('(none)', {
        x: 50,
        y: yPosition,
        size: bodySize,
        font,
        color: rgb(0.5, 0.5, 0.5),
      })
    }
    
    // Generate and download PDF
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `echogauge-analysis-${id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('PDF export failed:', error)
    // Fallback to browser print method
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!doctype html><html><head><title>EchoGauge Analysis ${id}</title></head><body>`)
    w.document.write(`<h1>EchoGauge Analysis Session ${id}</h1>`)
    w.document.write(`<p>Generated: ${new Date().toLocaleString()}</p>`)
    
    if (metadata.summary || metadata.tone || metadata.estimatedReadingTime || metadata.keyTopics) {
      w.document.write(`<h2>AI Analysis Overview</h2>`)
      if (metadata.summary) w.document.write(`<p><strong>Summary:</strong> ${escapeHtml(metadata.summary)}</p>`)
      if (metadata.tone) w.document.write(`<p><strong>Tone:</strong> ${escapeHtml(metadata.tone)}</p>`)
      if (metadata.estimatedReadingTime) w.document.write(`<p><strong>Estimated Reading Time:</strong> ${metadata.estimatedReadingTime} minutes</p>`)
      if (metadata.keyTopics && metadata.keyTopics.length > 0) w.document.write(`<p><strong>Key Topics:</strong> ${escapeHtml(metadata.keyTopics.join(', '))}</p>`)
    }
    
    w.document.write(`<h2>Extracted Text</h2><pre>${escapeHtml(text || '(empty)')}</pre>`)
    w.document.write(`<h2>Insights</h2><ul><li>Word Count: ${metrics.wordCount || 'N/A'}</li><li>Character Count: ${metrics.charCount || 'N/A'}</li><li>Readability Score: ${metrics.readability || 'N/A'}/100</li></ul>`)
    w.document.write(`<h2>Suggestions</h2><ul>${suggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>(none)</li>'}</ul>`)
    w.document.write(`</body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as any)[c] || c)
}
