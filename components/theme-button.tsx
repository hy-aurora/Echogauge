"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MoonFilledIcon, SunFilledIcon } from "./icons"

export function ModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const current = (theme === "system" ? systemTheme : theme) ?? "light"
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      title={`Switch theme (${next})`}
      onClick={() => setTheme(next)}
    >
      <SunFilledIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <MoonFilledIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
