"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MyTasksHeader } from "@/components/my-tasks-header"
import { MyTasksList } from "@/components/my-tasks-list"
import { useData } from "@/contexts/data-context"

export default function MyTasksPage() {
  const { getCurrentUserTasks, updateTaskStatus, assignTaskToMember, updateTaskDueDate, deleteTask } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Get current user's tasks (for now, we'll simulate Ali Shabani as the current user)
  const userTasks = getCurrentUserTasks("Ali Shabani")

  // Filter tasks based on current filters
  const filteredTasks = userTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-6">
            <MyTasksHeader
              tasks={userTasks}
              filteredTasks={filteredTasks}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />
            
            <div className="px-4 lg:px-6">
              <MyTasksList
                tasks={filteredTasks}
                updateTaskStatus={updateTaskStatus}
                assignTaskToMember={assignTaskToMember}
                updateTaskDueDate={updateTaskDueDate}
                deleteTask={deleteTask}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}