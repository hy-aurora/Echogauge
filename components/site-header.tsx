"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./theme-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { usePathname } from "next/navigation"

type SiteHeaderProps = { title?: string }

export function SiteHeader({ title }: SiteHeaderProps) {
  const pathname = usePathname()
  const computed = getTitleFromPath(pathname)
  const heading = title ?? computed

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{heading}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Help</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How EchoGauge works</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1) Upload a PDF or image. We validate size/type and show progress.</p>
                <p>2) We extract text (PDF parse or OCR) with clear loading states.</p>
                <p>3) You&apos;ll see metrics and suggestions you can copy or export.</p>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <ModeToggle />
          </Button>
        </div>
      </div>
    </header>
  )
}

function getTitleFromPath(pathname: string | null): string {
  if (!pathname) return "EchoGauge"
  const path = pathname.split("?")[0]
  if (path === "/" || path.length === 0) return "Welcome"
  if (path.startsWith("/dashboard")) return "Dashboard"
  if (path === "/sessions") return "Sessions"
  if (path.startsWith("/session/")) return "Session"
  if (path.startsWith("/settings")) return "Settings"
  if (path.startsWith("/help")) return "Help"
  if (path.startsWith("/search")) return "Search"
  if (path.startsWith("/auth")) return "Sign in"
  return "EchoGauge"
}
