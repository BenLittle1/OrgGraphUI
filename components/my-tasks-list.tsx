"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TaskItem } from "@/components/task-item"
import { Task } from "@/contexts/data-context"
import { parseISO, isValid, differenceInDays, format } from "date-fns"
import { AlertTriangle, Clock, Calendar, User, AlertCircle } from "lucide-react"

interface MyTasksListProps {
  tasks: Array<Task & { category: string; subcategory: string }>
  updateTaskStatus: (taskId: number, newStatus: string) => void
  assignTaskToMember: (taskId: number, memberId: string | null) => void
  updateTaskDueDate: (taskId: number, dueDate: string | null) => void
  deleteTask: (taskId: number) => void
}

export function MyTasksList({
  tasks,
  updateTaskStatus,
  assignTaskToMember,
  updateTaskDueDate,
  deleteTask,
}: MyTasksListProps) {
  // Group tasks by due date categories
  const now = new Date()
  
  const groupedTasks = {
    overdue: [] as Array<Task & { category: string; subcategory: string }>,
    today: [] as Array<Task & { category: string; subcategory: string }>,
    thisWeek: [] as Array<Task & { category: string; subcategory: string }>,
    future: [] as Array<Task & { category: string; subcategory: string }>,
    noDueDate: [] as Array<Task & { category: string; subcategory: string }>,
  }

  tasks.forEach(task => {
    if (!task.dueDate) {
      groupedTasks.noDueDate.push(task)
      return
    }

    const dueDate = parseISO(task.dueDate)
    if (!isValid(dueDate)) {
      groupedTasks.noDueDate.push(task)
      return
    }

    const daysDiff = differenceInDays(dueDate, now)

    if (daysDiff < 0) {
      groupedTasks.overdue.push(task)
    } else if (daysDiff === 0) {
      groupedTasks.today.push(task)
    } else if (daysDiff <= 7) {
      groupedTasks.thisWeek.push(task)
    } else {
      groupedTasks.future.push(task)
    }
  })

  const TaskGroup = ({ 
    title, 
    icon: Icon, 
    tasks: groupTasks, 
    color,
    description 
  }: {
    title: string
    icon: any
    tasks: Array<Task & { category: string; subcategory: string }>
    color: string
    description: string
  }) => {
    if (groupTasks.length === 0) return null

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {groupTasks.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {groupTasks.map((task, index) => (
            <div key={task.id}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{task.category}</Badge>
                  <span>•</span>
                  <span>{task.subcategory}</span>
                  {task.dueDate && (
                    <>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
                      </span>
                    </>
                  )}
                </div>
                <TaskItem
                  task={task}
                  updateTaskStatus={updateTaskStatus}
                  assignTaskToMember={assignTaskToMember}
                  updateTaskDueDate={updateTaskDueDate}
                  deleteTask={deleteTask}
                />
              </div>
              {index < groupTasks.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
        <p className="text-muted-foreground">
          You don't have any tasks assigned to you yet. Check back later or contact your team lead.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TaskGroup
        title="Overdue"
        icon={AlertTriangle}
        tasks={groupedTasks.overdue}
        color="text-red-500"
        description="Past due date"
      />

      <TaskGroup
        title="Due Today"
        icon={AlertCircle}
        tasks={groupedTasks.today}
        color="text-orange-500"
        description="Due by end of day"
      />

      <TaskGroup
        title="This Week"
        icon={Clock}
        tasks={groupedTasks.thisWeek}
        color="text-blue-500"
        description="Due within 7 days"
      />

      <TaskGroup
        title="Future"
        icon={Calendar}
        tasks={groupedTasks.future}
        color="text-purple-500"
        description="Due in more than a week"
      />

      <TaskGroup
        title="No Due Date"
        icon={User}
        tasks={groupedTasks.noDueDate}
        color="text-gray-500"
        description="No deadline set"
      />
    </div>
  )
}