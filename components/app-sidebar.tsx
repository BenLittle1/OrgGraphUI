"use client"

import { Home, Settings, Users, BarChart3, CheckSquare, Network } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Checklist", href: "/checklist", icon: CheckSquare },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Team", href: "#", icon: Users },
  { name: "Settings", href: "#", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="text-lg font-semibold hover:text-primary">
            CodeAid
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href === "/" && pathname === "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </Sidebar>
  )
}