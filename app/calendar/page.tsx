"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-6">
            {/* Calendar Content */}
            <div className="px-4 lg:px-6">
              <CalendarView />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}