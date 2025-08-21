"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, User, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  const pathname = usePathname()
  
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Overview'
      case '/checklist':
        return 'Checklist'
      case '/graph':
        return 'Graph'
      case '/team':
        return 'Team'
      case '/calendar':
        return 'Calendar'
      case '/settings':
        return 'Settings'
      default:
        return 'CodeAid'
    }
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:text-primary transition-colors lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Zap className="h-3 w-3" />
            </div>
            <span className="font-semibold">CodeAid</span>
          </Link>
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  )
}