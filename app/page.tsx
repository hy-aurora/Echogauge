import { SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Landing() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-20 text-center">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          EchoGauge
        </h1>
        <p className="text-pretty text-muted-foreground">
          A fast, serverless social-content analyzer. Upload PDFs or images, extract text, and get actionable suggestions to boost engagement.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SignedOut>
          <Button asChild size="lg">
            <Link href="/auth">Sign in to start</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </SignedIn>
        <Button variant="outline" asChild size="lg">
          <a href="#how">How it works</a>
        </Button>
      </div>
      <section id="how" className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {["Upload", "Extract", "Improve"].map((step, i) => (
          <div key={step} className="rounded-lg border p-6 text-left">
            <div className="mb-2 text-sm text-muted-foreground">Step {i + 1}</div>
            <h3 className="text-lg font-medium">{step}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {i === 0 && "Drag-and-drop PDFs or images, with size and type checks."}
              {i === 1 && "We parse PDFs and run OCR for images with clear loading states."}
              {i === 2 && "See metrics and suggestions you can copy and apply quickly."}
            </p>
          </div>
        ))}
      </section>
    </main>
  )
}
