export default function HelpPage() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Help</h1>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Upload a PDF or image. We extract text via parsing or OCR.</p>
        <p>Open a session from the Dashboard history to see insights and suggestions.</p>
        <p>Need more? Reach out via the repository issues page.</p>
      </div>
    </main>
  )
}
