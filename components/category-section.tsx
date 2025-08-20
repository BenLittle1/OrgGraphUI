"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TaskItem } from "@/components/task-item"
import { Category } from "@/contexts/data-context"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface CategorySectionProps {
  category: Category
  updateTaskStatus: (taskId: number, newStatus: string) => void
  assignTaskToMember: (taskId: number, memberId: string | null) => void
  updateTaskDueDate: (taskId: number, dueDate: string | null) => void
}

export function CategorySection({ category, updateTaskStatus, assignTaskToMember, updateTaskDueDate }: CategorySectionProps) {
  // Calculate category progress
  const allTasks = category.subcategories.flatMap(sub => sub.tasks)
  const completedTasks = allTasks.filter(task => task.status === "completed")
  const inProgressTasks = allTasks.filter(task => task.status === "in_progress")
  const highPriorityTasks = allTasks.filter(task => task.priority === "high")
  const progressPercentage = Math.round((completedTasks.length / allTasks.length) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{category.name}</CardTitle>
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
                      />
                    ))}
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