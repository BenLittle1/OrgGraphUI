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
import { Task, Subtask } from "@/contexts/data-context"
import { useData } from "@/contexts/data-context"

// Combined type for calendar events
type CalendarEventItem = {
  id: string // 'task-123' or 'subtask-456'
  type: 'task' | 'subtask'
  name: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
  category: string
  subcategory: string
  parentTaskName?: string // For subtasks only
}
import { User, Clock, MoreHorizontal, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isValid, parseISO } from "date-fns"

interface CalendarEventProps {
  event: CalendarEventItem
  compact?: boolean
  className?: string
  // Legacy support for task prop (backward compatibility)
  task?: Task & { category: string; subcategory: string }
  // Subtask editing functions
  updateSubtaskStatus?: (subtaskId: number, status: string) => void
  updateSubtaskAssignee?: (subtaskId: number, assignee: string | null) => void
  updateSubtaskDueDate?: (subtaskId: number, dueDate: string | null) => void
  updateSubtaskName?: (subtaskId: number, name: string) => void
  updateSubtaskPriority?: (subtaskId: number, priority: string) => void
  getSubtaskById?: (subtaskId: number) => Subtask | null
}

export function CalendarEvent({ 
  event, 
  task, 
  compact = false, 
  className,
  updateSubtaskStatus,
  updateSubtaskAssignee,
  updateSubtaskDueDate,
  updateSubtaskName,
  updateSubtaskPriority,
  getSubtaskById
}: CalendarEventProps) {
  const { updateTaskStatus, assignTaskToMember, updateTaskDueDate } = useData()
  const [showDetails, setShowDetails] = useState(false)

  // Use event prop or fall back to task prop for backward compatibility
  const eventData = event || (task ? {
    id: `task-${task.id}`,
    type: 'task' as const,
    name: task.name,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    dueDate: task.dueDate,
    category: task.category,
    subcategory: task.subcategory
  } : null)

  if (!eventData) return null

  const isSubtask = eventData.type === 'subtask'
  const eventId = parseInt(eventData.id.split('-')[1]) // Extract numeric ID

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
    if (isSubtask && updateSubtaskStatus) {
      updateSubtaskStatus(eventId, newStatus)
    } else {
      updateTaskStatus(eventId, newStatus)
    }
  }

  const handleStatusSelect = (newStatus: string) => {
    if (isSubtask && updateSubtaskStatus) {
      updateSubtaskStatus(eventId, newStatus)
    } else {
      updateTaskStatus(eventId, newStatus)
    }
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

  const timeString = formatTime(eventData.dueDate)

  if (compact) {
    return (
      <>
        <div
          className={cn(
            "group relative p-1.5 rounded-md text-xs cursor-pointer transition-all hover:shadow-sm border",
            getPriorityColor(eventData.priority),
            eventData.status === "completed" && "opacity-60 line-through",
            isSubtask && "ml-2 border-l-2 border-l-blue-300 bg-blue-50/50 dark:bg-blue-950/50", // Subtask visual distinction
            className
          )}
          onClick={() => setShowDetails(true)}
        >
          <div className="flex items-center gap-1">
            <div 
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                getStatusColor(eventData.status)
              )}
            />
            {isSubtask && (
              <span className="text-[9px] bg-blue-600 text-white px-1 rounded font-bold mr-1">S</span>
            )}
            <span className="truncate font-medium flex-1">
              {eventData.name}
            </span>
          </div>
          {timeString && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-70">
              <Clock className="w-2.5 h-2.5" />
              <span>{timeString}</span>
            </div>
          )}
          {eventData.assignee && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-70">
              <User className="w-2.5 h-2.5" />
              <span className="truncate">{eventData.assignee}</span>
            </div>
          )}
          
          {/* Show parent task for subtasks */}
          {isSubtask && eventData.parentTaskName && (
            <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-50">
              <span className="truncate">↳ {eventData.parentTaskName}</span>
            </div>
          )}
        </div>

        {/* Task Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit {isSubtask ? 'Subtask' : 'Task'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Event Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{eventData.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{eventData.category}</span>
                  <span>→</span>
                  <span>{eventData.subcategory}</span>
                  {isSubtask && eventData.parentTaskName && (
                    <>
                      <span>→</span>
                      <span className="text-blue-600">{eventData.parentTaskName}</span>
                    </>
                  )}
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
                        id={`event-${eventData.id}`}
                        checked={eventData.status === "completed"}
                        onCheckedChange={handleStatusChange}
                      />
                      <label
                        htmlFor={`event-${eventData.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mark as completed
                      </label>
                    </div>
                    <Select value={eventData.status} onValueChange={handleStatusSelect}>
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
                    <Badge className={getPriorityColor(eventData.priority)}>
                      {eventData.priority}
                    </Badge>
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Assignee</label>
                  <AssigneeSelect
                    taskId={eventId}
                    currentAssignee={eventData.assignee}
                    assignTaskToMember={isSubtask ? 
                      (taskId, memberId) => updateSubtaskAssignee?.(taskId, memberId) :
                      assignTaskToMember
                    }
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Due Date</label>
                  <div className="pt-1">
                    <DatePicker
                      date={eventData.dueDate}
                      onDateChange={(date) => {
                        if (isSubtask && updateSubtaskDueDate) {
                          updateSubtaskDueDate(eventId, date)
                        } else {
                          updateTaskDueDate(eventId, date)
                        }
                      }}
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
        getPriorityColor(eventData.priority),
        eventData.status === "completed" && "opacity-60 line-through",
        isSubtask && "ml-2 border-l-2 border-l-blue-300 bg-blue-50/50 dark:bg-blue-950/50", // Subtask visual distinction
        className
      )}
      onClick={() => setShowDetails(true)}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "w-3 h-3 rounded-full flex-shrink-0",
              getStatusColor(eventData.status)
            )}
          />
          {isSubtask && (
            <span className="text-[9px] bg-blue-600 text-white px-1 rounded font-bold mr-1">S</span>
          )}
          <span className="font-medium flex-1 truncate">
            {eventData.name}
          </span>
          <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {timeString && (
              <div className="flex items-center gap-1 opacity-70">
                <Clock className="w-3 h-3" />
                <span>{timeString}</span>
              </div>
            )}
            {eventData.assignee && (
              <div className="flex items-center gap-1 opacity-70">
                <User className="w-3 h-3" />
                <span className="truncate">{eventData.assignee}</span>
              </div>
            )}
          </div>
          {isSubtask && eventData.parentTaskName && (
            <div className="text-[10px] opacity-50 truncate">
              ↳ {eventData.parentTaskName}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}