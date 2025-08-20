"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChecklistHeader } from "@/components/checklist-header"
import { CategorySection } from "@/components/category-section"
import { useData, type Category, type Subcategory } from "@/contexts/data-context"

export default function ChecklistPage() {
  const { data, updateTaskStatus, assignTaskToMember, updateTaskDueDate } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Filter categories based on current filters
  const filteredCategories = data.categories.map(category => {
    if (categoryFilter !== "all" && category.name !== categoryFilter) {
      return null
    }

    const filteredSubcategories = category.subcategories.map(subcategory => {
      const filteredTasks = subcategory.tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || task.status === statusFilter
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
        return matchesSearch && matchesStatus && matchesPriority
      })

      return filteredTasks.length > 0 ? { ...subcategory, tasks: filteredTasks } : null
    }).filter(Boolean) as Subcategory[]

    return filteredSubcategories.length > 0 ? { ...category, subcategories: filteredSubcategories } : null
  }).filter(Boolean) as Category[]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-6">
            <ChecklistHeader
              data={data}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
            
            <div className="px-4 lg:px-6">
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    updateTaskStatus={updateTaskStatus}
                    assignTaskToMember={assignTaskToMember}
                    updateTaskDueDate={updateTaskDueDate}
                  />
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No tasks match your current filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}