import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ComparisonsClient } from "@/components/comparisons-client"

export default async function ComparisonsPage() {
  const user = await currentUser()
  if (!user) redirect("/auth")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Content Comparisons
          </h1>
          <p className="text-lg text-muted-foreground">
            Compare multiple documents and analyze their differences
          </p>
        </div>

        {/* Comparisons Content */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        }>
          <ComparisonsClient />
        </Suspense>
      </div>
    </div>
  )
}
