"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CalendarView } from "@/components/calendar-view"
import { useData } from "@/contexts/data-context"

export default function CalendarPage() {
  const {
    // Subtask functions for CalendarView
    updateSubtaskStatus,
    updateSubtaskAssignee,
    updateSubtaskDueDate,
    updateSubtaskName,
    updateSubtaskPriority,
    getSubtaskById
  } = useData()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-6">
            {/* Calendar Content */}
            <div className="px-4 lg:px-6">
              <CalendarView 
                // Pass subtask functions for event editing
                updateSubtaskStatus={updateSubtaskStatus}
                updateSubtaskAssignee={updateSubtaskAssignee}
                updateSubtaskDueDate={updateSubtaskDueDate}
                updateSubtaskName={updateSubtaskName}
                updateSubtaskPriority={updateSubtaskPriority}
                getSubtaskById={getSubtaskById}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}