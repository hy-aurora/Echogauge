import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Suspense } from "react"
import { SessionsTable } from "./table"

export default async function SessionsPage() {
  const user = await currentUser()
  if (!user) redirect("/auth")
  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Sessions</h1>
      <Suspense fallback={<Card className="p-4 text-sm text-muted-foreground">Loading…</Card>}>
        <SessionsTable />
      </Suspense>
    </main>
  )
}
