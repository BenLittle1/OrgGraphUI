import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "WarpDrive - Business Process Management",
  description: "Comprehensive business process checklist dashboard with team collaboration and analytics",
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
          <AuthProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}