'use client'
import ConvexClientProvider from "./ConvexClientProvider"
import { ThemeProvider } from "./theme-provider"

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ConvexClientProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </ConvexClientProvider>
    )
}
