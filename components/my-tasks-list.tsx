"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TaskItem } from "@/components/task-item"
import { SubtaskItem } from "@/components/subtask-item"
import { Task, Subtask, NewSubtaskData } from "@/contexts/data-context"
import { parseISO, isValid, differenceInDays, format } from "date-fns"
import { AlertTriangle, Clock, Calendar, User, AlertCircle } from "lucide-react"

// Mixed item type for tasks and subtasks
type TaskWithContext = Task & { category: string; subcategory: string; type: 'task' }
type SubtaskWithContext = Subtask & { taskName: string; category: string; subcategory: string; type: 'subtask' }
type MixedItem = TaskWithContext | SubtaskWithContext

interface MyTasksListProps {
  items: MixedItem[]
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

export function MyTasksList({
  items,
  updateTaskStatus,
  assignTaskToMember,
  updateTaskDueDate,
  deleteTask,
  addSubtask,
  updateSubtaskStatus,
  updateSubtaskAssignee,
  updateSubtaskDueDate,
  deleteSubtask,
  getTaskCompletion,
}: MyTasksListProps) {
  // Group items by due date categories
  const now = new Date()
  
  const groupedItems = {
    overdue: [] as MixedItem[],
    today: [] as MixedItem[],
    thisWeek: [] as MixedItem[],
    future: [] as MixedItem[],
    noDueDate: [] as MixedItem[],
  }

  items.forEach(item => {
    if (!item.dueDate) {
      groupedItems.noDueDate.push(item)
      return
    }

    const dueDate = parseISO(item.dueDate)
    if (!isValid(dueDate)) {
      groupedItems.noDueDate.push(item)
      return
    }

    const daysDiff = differenceInDays(dueDate, now)

    if (daysDiff < 0) {
      groupedItems.overdue.push(item)
    } else if (daysDiff === 0) {
      groupedItems.today.push(item)
    } else if (daysDiff <= 7) {
      groupedItems.thisWeek.push(item)
    } else {
      groupedItems.future.push(item)
    }
  })

  // Sort items within each group by due date
  Object.values(groupedItems).forEach(group => {
    group.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  })

  const ItemGroup = ({ 
    title, 
    icon: Icon, 
    items: groupItems, 
    color,
    description 
  }: {
    title: string
    icon: any
    items: MixedItem[]
    color: string
    description: string
  }) => {
    if (groupItems.length === 0) return null

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {groupItems.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {groupItems.map((item, index) => (
            <div key={`${item.type}-${item.id}`}>
              <div className="space-y-2">
                {/* Context information */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {item.type === 'subtask' ? (
                    <>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Subtask
                      </Badge>
                      <span>•</span>
                      <span className="font-medium">Task: {(item as SubtaskWithContext).taskName}</span>
                      <span>•</span>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline">Task</Badge>
                      <span>•</span>
                    </>
                  )}
                  <Badge variant="outline">{item.category}</Badge>
                  <span>•</span>
                  <span>{item.subcategory}</span>
                  {item.dueDate && (
                    <>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(parseISO(item.dueDate), "MMM d, yyyy")}</span>
                      </span>
                    </>
                  )}
                </div>
                
                {/* Render appropriate item component */}
                {item.type === 'task' ? (
                  <TaskItem
                    task={item as TaskWithContext}
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
                ) : (
                  <SubtaskItem
                    subtask={item as SubtaskWithContext}
                    taskId={0} // We don't need the parent task ID for standalone display
                    updateSubtaskStatus={updateSubtaskStatus}
                    updateSubtaskAssignee={updateSubtaskAssignee}
                    updateSubtaskDueDate={updateSubtaskDueDate}
                    deleteSubtask={deleteSubtask}
                  />
                )}
              </div>
              {index < groupItems.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No items assigned</h3>
        <p className="text-muted-foreground">
          You don't have any tasks or subtasks assigned to you yet. Check back later or contact your team lead.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ItemGroup
        title="Overdue"
        icon={AlertTriangle}
        items={groupedItems.overdue}
        color="text-red-500"
        description="Past due date"
      />

      <ItemGroup
        title="Due Today"
        icon={AlertCircle}
        items={groupedItems.today}
        color="text-orange-500"
        description="Due by end of day"
      />

      <ItemGroup
        title="This Week"
        icon={Clock}
        items={groupedItems.thisWeek}
        color="text-blue-500"
        description="Due within 7 days"
      />

      <ItemGroup
        title="Future"
        icon={Calendar}
        items={groupedItems.future}
        color="text-purple-500"
        description="Due in more than a week"
      />

      <ItemGroup
        title="No Due Date"
        icon={User}
        items={groupedItems.noDueDate}
        color="text-gray-500"
        description="No deadline set"
      />
    </div>
  )
}