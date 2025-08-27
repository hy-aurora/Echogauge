import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Input } from "@/components/ui/input"

export default async function SearchPage() {
  const user = await currentUser()
  if (!user) redirect("/auth")

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Search</h1>
      <div className="max-w-xl">
        <Input placeholder="Search your analyses..." />
      </div>
    </main>
  )
}
