import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const user = await currentUser()
  if (!user) redirect("/auth")

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Manage your account preferences. More settings coming soon.
      </p>
    </main>
  )
}
