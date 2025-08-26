'use client';
import ConvexClientProvider from "./ConvexClientProvider";
import { ThemeProvider } from "./theme-provider";


export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
        <ConvexClientProvider>
        <html lang="en" suppressHydrationWarning>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <body>
                    {children}
                </body>
            </ThemeProvider>
        </html>
        </ConvexClientProvider>
        </>
    );
}
