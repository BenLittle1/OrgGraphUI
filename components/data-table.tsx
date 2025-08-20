"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useData } from "@/contexts/data-context"
import { CheckSquare, ExternalLink, Calendar, Clock, AlertTriangle } from "lucide-react"
import { format, isValid, parseISO, differenceInDays } from "date-fns"
import Link from "next/link"

export function DataTable() {
  const { getUpcomingTasksByDueDate, updateTaskStatus } = useData()
  
  // Get first 15 upcoming tasks by due date for dashboard display
  const upcomingTasks = getUpcomingTasksByDueDate(15)

  const handleTaskComplete = (taskId: number, isCompleted: boolean) => {
    updateTaskStatus(taskId, isCompleted ? "completed" : "pending")
  }

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return null
    
    try {
      const parsedDate = parseISO(dueDate)
      if (!isValid(parsedDate)) return null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(parsedDate)
      due.setHours(0, 0, 0, 0)
      
      const daysUntilDue = differenceInDays(due, today)
      
      if (daysUntilDue < 0) {
        return {
          status: "overdue",
          text: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`,
          color: "text-red-800",
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          icon: AlertTriangle
        }
      } else if (daysUntilDue === 0) {
        return {
          status: "due-today",
          text: "Due today",
          color: "text-orange-800", 
          bgColor: "bg-orange-100",
          borderColor: "border-orange-200",
          icon: Clock
        }
      } else if (daysUntilDue <= 3) {
        return {
          status: "due-soon",
          text: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          color: "text-yellow-800",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200", 
          icon: Calendar
        }
      } else {
        return {
          status: "due-later",
          text: format(parsedDate, "MMM dd, yyyy"),
          color: "text-gray-800",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200", 
          icon: Calendar
        }
      }
    } catch {
      return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Tasks by Due Date</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Next {upcomingTasks.length} tasks organized by deadline - earliest due dates first
            </p>
          </div>
          <Link href="/checklist">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View All Tasks
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming tasks with due dates!</p>
              <p className="text-sm text-muted-foreground">All tasks are either unscheduled or completed.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Done</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingTasks.map((task) => {
                  const dueDateInfo = getDueDateInfo(task.dueDate)
                  const IconComponent = dueDateInfo?.icon
                  
                  return (
                    <TableRow 
                      key={task.id} 
                      className={task.status === "completed" ? "opacity-60 bg-green-50/50" : "hover:bg-muted/50"}
                    >
                      <TableCell>
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{task.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{task.subcategory}</TableCell>
                      <TableCell>
                        {dueDateInfo ? (
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent className="h-3 w-3" />}
                            <Badge variant="outline" className={`${dueDateInfo.bgColor} ${dueDateInfo.color} ${dueDateInfo.borderColor}`}>
                              {dueDateInfo.text}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{task.assignee || 'Unassigned'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}