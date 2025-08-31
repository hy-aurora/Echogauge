"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExtractionView } from "@/components/extraction-view"
import { AnalysisSummary } from "@/components/analysis-summary"
import { SuggestionList } from "@/components/suggestion-list"
import { Button } from "@/components/ui/button"

export default function SessionClient({ id }: { id: string }) {
  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Session #{id}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportMarkdown(id)}>
            Export Markdown
          </Button>
          <Button onClick={() => exportPdf(id)}>Export PDF</Button>
        </div>
      </div>
      <Tabs defaultValue="text" className="w-full">
        <TabsList>
          <TabsTrigger value="text">Extracted Text</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <ExtractionView text="" />
        </TabsContent>
        <TabsContent value="insights">
          <AnalysisSummary metrics={{}} />
        </TabsContent>
        <TabsContent value="suggestions">
          <SuggestionList suggestions={[]} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

function exportMarkdown(id: string) {
  const md = `# EchoGauge Session ${id}\n\n- Generated: ${new Date().toISOString()}\n\n## Extracted Text\n\n(coming soon)\n\n## Insights\n\n(coming soon)\n\n## Suggestions\n\n- (coming soon)`
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `echogauge-${id}.md`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportPdf(id: string) {
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
    page.drawText(`EchoGauge Session ${id}`, {
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
    
    // Sections
    page.drawText('Extracted Text', {
      x: 50,
      y: yPosition,
      size: subtitleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 1.5
    
    page.drawText('(coming soon)', {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    yPosition -= lineHeight * 2
    
    page.drawText('Insights', {
      x: 50,
      y: yPosition,
      size: subtitleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 1.5
    
    page.drawText('(coming soon)', {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    yPosition -= lineHeight * 2
    
    page.drawText('Suggestions', {
      x: 50,
      y: yPosition,
      size: subtitleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })
    yPosition -= lineHeight * 1.5
    
    page.drawText('(coming soon)', {
      x: 50,
      y: yPosition,
      size: bodySize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
    
    // Generate and download PDF
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `echogauge-session-${id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('PDF export failed:', error)
    // Fallback to browser print method
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!doctype html><html><head><title>EchoGauge ${id}</title></head><body>`)
    w.document.write(`<h1>EchoGauge Session ${id}</h1>`)
    w.document.write(`<p>Generated: ${new Date().toLocaleString()}</p>`)
    w.document.write(`<h2>Extracted Text</h2><pre>(coming soon)</pre>`)
    w.document.write(`<h2>Insights</h2><pre>(coming soon)</pre>`)
    w.document.write(`<h2>Suggestions</h2><ul><li>(coming soon)</li></ul>`)
    w.document.write(`</body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }
}
