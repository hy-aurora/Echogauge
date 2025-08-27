import { notFound, redirect } from "next/navigation"
import SessionClient from "@/components/session-client"

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) notFound()
  // Server protection
  const { auth } = await import("@clerk/nextjs/server")
  const { userId } = await auth()
  if (!userId) redirect("/auth")

  return <SessionClient id={id} />
}
