"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MyTasksHeader } from "@/components/my-tasks-header"
import { MyTasksList } from "@/components/my-tasks-list"
import { useData } from "@/contexts/data-context"

export default function MyTasksPage() {
  const { 
    getCurrentUserTasks,
    getSubtasksForMember,
    updateTaskStatus, 
    assignTaskToMember, 
    updateTaskDueDate, 
    deleteTask,
    addSubtask,
    updateSubtaskStatus,
    updateSubtaskAssignee,
    updateSubtaskDueDate,
    deleteSubtask,
    getTaskCompletion
  } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Get current user's tasks and subtasks (for now, we'll simulate Ali Shabani as the current user)
  const currentUser = "Ali Shabani"
  const currentUserId = "tm-002" // Ali Shabani's ID
  
  const userTasks = getCurrentUserTasks(currentUser)
  const userSubtasks = getSubtasksForMember(currentUserId)

  // Create mixed list of tasks and subtasks with proper typing
  const allItems = [
    ...userTasks.map(task => ({ type: 'task' as const, ...task })),
    ...userSubtasks.map(subtask => ({ type: 'subtask' as const, ...subtask }))
  ]

  // Filter both tasks and subtasks based on current filters
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter
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
              items={allItems}
              filteredItems={filteredItems}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />
            
            <div className="px-4 lg:px-6">
              <MyTasksList
                items={filteredItems}
                updateTaskStatus={updateTaskStatus}
                assignTaskToMember={assignTaskToMember}
                updateTaskDueDate={updateTaskDueDate}
                deleteTask={deleteTask}
                addSubtask={addSubtask}
                updateSubtaskStatus={updateSubtaskStatus}
                updateSubtaskAssignee={updateSubtaskAssignee}
                updateSubtaskDueDate={updateSubtaskDueDate}
                deleteSubtask={deleteSubtask}
                getTaskCompletion={getTaskCompletion}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}