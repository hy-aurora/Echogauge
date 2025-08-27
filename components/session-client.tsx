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

export default function SessionClient({ id }: { id: string }) {
  const data = useQuery(api.history.get, { analysisId: id as unknown as Id<"analyses"> })

  const text = data?.extraction?.rawText ?? ""
  const metrics = (data?.analysis?.metrics as any) || {}
  const suggestions = (data?.analysis?.suggestions as any) || []

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Session #{id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-semibold">Session #{id}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportMarkdown(id, text, metrics, suggestions)}>
            Export Markdown
          </Button>
          <Button onClick={() => exportPdf(id, text, metrics, suggestions)}>Export PDF</Button>
        </div>
      </div>
      <Tabs defaultValue="text" className="w-full">
        <TabsList>
          <TabsTrigger value="text">Extracted Text</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <ExtractionView text={text} />
        </TabsContent>
        <TabsContent value="insights">
          <AnalysisSummary metrics={metrics} />
        </TabsContent>
        <TabsContent value="suggestions">
          <SuggestionList suggestions={suggestions} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function exportMarkdown(id: string, text: string, metrics: any, suggestions: string[]) {
  const md = `# EchoGauge Session ${id}\n\n- Generated: ${new Date().toISOString()}\n\n## Extracted Text\n\n${text || '(empty)'}\n\n## Insights\n\n${JSON.stringify(metrics, null, 2)}\n\n## Suggestions\n\n${suggestions.map(s => `- ${s}`).join('\n') || '(none)'}`
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `echogauge-${id}.md`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportPdf(id: string, text: string, metrics: any, suggestions: string[]) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!doctype html><html><head><title>EchoGauge ${id}</title></head><body>`)
  w.document.write(`<h1>EchoGauge Session ${id}</h1>`)
  w.document.write(`<p>Generated: ${new Date().toLocaleString()}</p>`)
  w.document.write(`<h2>Extracted Text</h2><pre>${escapeHtml(text || '(empty)')}</pre>`)
  w.document.write(`<h2>Insights</h2><pre>${escapeHtml(JSON.stringify(metrics, null, 2))}</pre>`)
  w.document.write(`<h2>Suggestions</h2><ul>${suggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>(none)</li>'}</ul>`)
  w.document.write(`</body></html>`)
  w.document.close()
  w.focus()
  w.print()
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as any)[c] || c)
}
