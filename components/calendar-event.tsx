"use client"

import * as React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AssigneeSelect } from "@/components/assignee-select"
import { DatePicker } from "@/components/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/contexts/data-context"
import { useData } from "@/contexts/data-context"
import { User, Clock, MoreHorizontal, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isValid, parseISO } from "date-fns"

interface CalendarEventProps {
  task: Task & { category: string; subcategory: string }
  compact?: boolean
  className?: string
}

export function CalendarEvent({ task, compact = false, className }: CalendarEventProps) {
  const { updateTaskStatus, assignTaskToMember, updateTaskDueDate } = useData()
  const [showDetails, setShowDetails] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600"
      case "in_progress":
        return "bg-blue-500 hover:bg-blue-600"
      case "pending":
        return "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
      default:
        return "bg-gray-300 hover:bg-gray-400"
    }
  }

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? "completed" : "pending"
    updateTaskStatus(task.id, newStatus)
  }

  const handleStatusSelect = (newStatus: string) => {
    updateTaskStatus(task.id, newStatus)
  }

  const formatTime = (dueDate: string | null) => {
    if (!dueDate) return null
    try {
      const date = parseISO(dueDate)
      if (isValid(date)) {
        return format(date, "MMM d")
      }
    } catch {
      return null
    }
    return null
  }

  const timeString = formatTime(task.dueDate)

  if (compact) {
    return (
      <>
        <div
          className={cn(
            "group relative p-1.5 rounded-md text-xs cursor-pointer transition-all hover:shadow-sm border",
            getPriorityColor(task.priority),
            task.status === "completed" && "opacity-60 line-through",
            className
          )}
          onClick={() => setShowDetails(true)}
        >
          <div className="flex items-center gap-1">
            <div 
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                getStatusColor(task.status)
              )}
            />
            <span className="truncate font-medium flex-1">
              {task.name}
            </span>
          </div>
          {timeString && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-70">
              <Clock className="w-2.5 h-2.5" />
              <span>{timeString}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-70">
              <User className="w-2.5 h-2.5" />
              <span className="truncate">{task.assignee}</span>
            </div>
          )}
        </div>

        {/* Task Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Task Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{task.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{task.category}</span>
                  <span>→</span>
                  <span>{task.subcategory}</span>
                </div>
              </div>

              {/* Task Controls */}
              <div className="grid gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.status === "completed"}
                        onCheckedChange={handleStatusChange}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mark as completed
                      </label>
                    </div>
                    <Select value={task.status} onValueChange={handleStatusSelect}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Priority</label>
                  <div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Assignee</label>
                  <AssigneeSelect
                    currentAssignee={task.assignee}
                    onAssigneeChange={(memberId) => assignTaskToMember(task.id, memberId)}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Due Date</label>
                  <div className="pt-1">
                    <DatePicker
                      date={task.dueDate}
                      onDateChange={(date) => updateTaskDueDate(task.id, date)}
                      placeholder="Set due date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Non-compact version for larger calendar views
  return (
    <div
      className={cn(
        "p-2 rounded-md text-sm cursor-pointer transition-all hover:shadow-sm border",
        getPriorityColor(task.priority),
        task.status === "completed" && "opacity-60 line-through",
        className
      )}
      onClick={() => setShowDetails(true)}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "w-3 h-3 rounded-full flex-shrink-0",
              getStatusColor(task.status)
            )}
          />
          <span className="font-medium flex-1 truncate">
            {task.name}
          </span>
          <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          {timeString && (
            <div className="flex items-center gap-1 opacity-70">
              <Clock className="w-3 h-3" />
              <span>{timeString}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1 opacity-70">
              <User className="w-3 h-3" />
              <span className="truncate">{task.assignee}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}