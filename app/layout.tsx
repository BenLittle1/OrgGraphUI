import type { Metadata } from "next"
import "./globals.css"
import { DataProvider } from "@/contexts/data-context"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "CodeAid Dashboard",
  description: "A bare bones dashboard based on shadcn dashboard-01",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DataProvider>
            {children}
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}