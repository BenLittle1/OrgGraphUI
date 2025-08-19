"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, User, Zap } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:text-primary transition-colors lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Zap className="h-3 w-3" />
            </div>
            <span className="font-semibold">CodeAid</span>
          </Link>
          <h1 className="text-xl font-semibold">Dashboard</h1>
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