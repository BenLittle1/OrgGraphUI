"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { TaskItem } from "@/components/task-item"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditCategoryDialog } from "@/components/edit-category-dialog"
import { EditSubcategoryDialog } from "@/components/edit-subcategory-dialog"
import { Category, NewSubtaskData } from "@/contexts/data-context"
import { CheckCircle, Clock, AlertTriangle, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface CategorySectionProps {
  category: Category
  updateTaskStatus: (taskId: number, newStatus: string) => void
  assignTaskToMember: (taskId: number, memberId: string | null) => void
  updateTaskDueDate: (taskId: number, dueDate: string | null) => void
  deleteTask: (taskId: number) => void
  addSubtask: (taskId: number, subtaskData: NewSubtaskData) => void
  updateSubtaskStatus: (subtaskId: number, newStatus: string) => void
  updateSubtaskAssignee: (subtaskId: number, assignee: string | null) => void  
  updateSubtaskDueDate: (subtaskId: number, dueDate: string | null) => void
  deleteSubtask: (subtaskId: number) => void
  getTaskCompletion: (taskId: number) => number
}

export function CategorySection({ 
  category, 
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
}: CategorySectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate category progress
  const allTasks = category.subcategories.flatMap(sub => sub.tasks)
  const completedTasks = allTasks.filter(task => task.status === "completed")
  const inProgressTasks = allTasks.filter(task => task.status === "in_progress")
  const highPriorityTasks = allTasks.filter(task => task.priority === "high")
  const progressPercentage = Math.round((completedTasks.length / allTasks.length) * 100)

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{category.name}</CardTitle>
                {/* Category Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <EditCategoryDialog category={category}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Category
                      </DropdownMenuItem>
                    </EditCategoryDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {completedTasks.length} completed
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  {inProgressTasks.length} in progress
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  {highPriorityTasks.length} high priority
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right space-y-2">
                <div className="text-2xl font-bold">{progressPercentage}%</div>
                <Progress value={progressPercentage} className="h-2 w-20" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{subcategory.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {subcategory.tasks.length} tasks
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{category.name}</CardTitle>
              {/* Category Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <EditCategoryDialog category={category}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Category
                    </DropdownMenuItem>
                  </EditCategoryDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {completedTasks.length} completed
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-600" />
                {inProgressTasks.length} in progress
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                {highPriorityTasks.length} high priority
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="h-2 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {category.subcategories.map((subcategory) => {
            const subTasks = subcategory.tasks
            const subCompletedTasks = subTasks.filter(task => task.status === "completed")
            const subProgressPercentage = Math.round((subCompletedTasks.length / subTasks.length) * 100)
            
            return (
              <AccordionItem key={subcategory.id} value={subcategory.id.toString()}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{subcategory.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {subTasks.length} tasks
                      </Badge>
                      {/* Subcategory Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <EditSubcategoryDialog 
                            subcategory={subcategory} 
                            categoryId={category.id}
                            categoryName={category.name}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Subcategory
                            </DropdownMenuItem>
                          </EditSubcategoryDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {subCompletedTasks.length === subTasks.length && subTasks.length > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {subCompletedTasks.length}/{subTasks.length}
                      </span>
                      <div className="w-16">
                        <Progress value={subProgressPercentage} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 space-y-2">
                    {subTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
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
                    ))}
                    
                    {/* Add Task Button */}
                    <div className="pt-2">
                      <AddTaskDialog preselectedSubcategoryId={subcategory.id}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-2 text-muted-foreground hover:text-foreground border-dashed"
                        >
                          <Plus className="h-3 w-3" />
                          Add task to {subcategory.name}
                        </Button>
                      </AddTaskDialog>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}