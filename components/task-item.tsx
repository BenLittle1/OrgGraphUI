"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AssigneeSelect } from "@/components/assignee-select"
import { DatePicker } from "@/components/date-picker"
import { Task } from "@/contexts/data-context"
import { User, MoreHorizontal, Edit, Calendar, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isValid, parseISO, differenceInDays } from "date-fns"

interface TaskItemProps {
  task: Task
  updateTaskStatus: (taskId: number, newStatus: string) => void
  assignTaskToMember: (taskId: number, memberId: string | null) => void
  updateTaskDueDate: (taskId: number, dueDate: string | null) => void
}

export function TaskItem({ task, updateTaskStatus, assignTaskToMember, updateTaskDueDate }: TaskItemProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? "completed" : "pending"
    updateTaskStatus(task.id, newStatus)
  }

  const handleStatusSelect = (newStatus: string) => {
    updateTaskStatus(task.id, newStatus)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDueDateInfo = () => {
    if (!task.dueDate) return null
    
    try {
      const dueDate = parseISO(task.dueDate)
      if (!isValid(dueDate)) return null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(dueDate)
      due.setHours(0, 0, 0, 0)
      
      const daysUntilDue = differenceInDays(due, today)
      
      if (daysUntilDue < 0) {
        return {
          status: "overdue",
          text: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: AlertTriangle
        }
      } else if (daysUntilDue === 0) {
        return {
          status: "due-today",
          text: "Due today",
          color: "text-orange-600", 
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          icon: Clock
        }
      } else if (daysUntilDue <= 3) {
        return {
          status: "due-soon",
          text: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50", 
          borderColor: "border-yellow-200",
          icon: Calendar
        }
      } else {
        return {
          status: "due-later",
          text: format(dueDate, "MMM dd"),
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200", 
          icon: Calendar
        }
      }
    } catch {
      return null
    }
  }

  const dueDateInfo = getDueDateInfo()

  const handleDueDateChange = (newDueDate: string | null) => {
    updateTaskDueDate(task.id, newDueDate)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50",
        task.status === "completed" && "opacity-75 bg-green-50/50",
        dueDateInfo && dueDateInfo.status === "overdue" && "border-red-200 bg-red-50/30",
        dueDateInfo && dueDateInfo.status === "due-today" && "border-orange-200 bg-orange-50/30"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.status === "completed"}
        onCheckedChange={handleStatusChange}
        className="shrink-0"
      />

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            "font-medium",
            task.status === "completed" && "line-through text-muted-foreground"
          )}>
            {task.name}
          </div>
          
          {/* Priority Badge */}
          <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
            {task.priority}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {/* Due Date Picker */}
          <DatePicker
            date={task.dueDate}
            onDateChange={handleDueDateChange}
            placeholder="Set due date"
            className="h-6 text-xs min-w-[120px]"
          />
          
          {/* Assignee */}
          <AssigneeSelect
            taskId={task.id}
            currentAssignee={task.assignee}
            assignTaskToMember={assignTaskToMember}
          />
        </div>
      </div>

      {/* Status Quick Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Select value={task.status} onValueChange={handleStatusSelect}>
          <SelectTrigger className="w-auto h-8 text-xs border-none shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                Pending
              </div>
            </SelectItem>
            <SelectItem value="in_progress">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                In Progress
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Completed
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Task Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Task Name</label>
                <p className="mt-1 text-sm">{task.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                <div className="mt-1">
                  <AssigneeSelect
                    taskId={task.id}
                    currentAssignee={task.assignee}
                    assignTaskToMember={assignTaskToMember}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <div className="mt-1">
                  <DatePicker
                    date={task.dueDate}
                    onDateChange={handleDueDateChange}
                    placeholder="Set due date"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Task ID</label>
                <p className="mt-1 text-sm text-muted-foreground">#{task.id}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}