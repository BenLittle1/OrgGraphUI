"use client"

import * as React from "react"
import { PanelLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SidebarProvider = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex min-h-screen w-full bg-background", className)}
      {...props}
    >
      {children}
    </div>
  )
}

const Sidebar = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-sidebar",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const SidebarInset = ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
  return (
    <main
      className={cn("flex w-full flex-1 flex-col", className)}
      {...props}
    >
      {children}
    </main>
  )
}

const SidebarTrigger = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger }