import type { Metadata } from "next"
import "./globals.css"
import { DataProvider } from "@/contexts/data-context"

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
    <html lang="en">
      <body>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  )
}