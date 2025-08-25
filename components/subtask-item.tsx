"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { AssigneeSelect } from "@/components/assignee-select"
import { DatePicker } from "@/components/date-picker"
import { EditSubtaskDialog } from "@/components/edit-subtask-dialog"
import { Subtask, useData } from "@/contexts/data-context"
import { MoreHorizontal, Edit, Calendar, Clock, AlertTriangle, Hash, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isValid, parseISO, differenceInDays } from "date-fns"

interface SubtaskItemProps {
  subtask: Subtask
  taskId: number // Parent task ID for context
  updateSubtaskStatus: (subtaskId: number, newStatus: string) => void
  updateSubtaskAssignee: (subtaskId: number, assignee: string | null) => void
  updateSubtaskDueDate: (subtaskId: number, dueDate: string | null) => void
  deleteSubtask: (subtaskId: number) => void
}

export function SubtaskItem({ 
  subtask, 
  taskId,
  updateSubtaskStatus, 
  updateSubtaskAssignee, 
  updateSubtaskDueDate, 
  deleteSubtask 
}: SubtaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { getTeamMemberById } = useData()

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? "completed" : "pending"
    updateSubtaskStatus(subtask.id, newStatus)
  }

  const handleStatusSelect = (newStatus: string) => {
    updateSubtaskStatus(subtask.id, newStatus)
  }

  const handleAssigneeChange = (assignee: string | null) => {
    updateSubtaskAssignee(subtask.id, assignee)
  }

  // Wrapper function to match AssigneeSelect's expected signature
  const handleAssigneeSelect = (taskId: number, memberId: string | null) => {
    // Find member by ID and get their name
    const member = memberId ? getTeamMemberById(memberId) : null
    const memberName = member ? member.name : null
    updateSubtaskAssignee(subtask.id, memberName)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getDueDateInfo = () => {
    if (!subtask.dueDate) return null
    
    try {
      const dueDate = parseISO(subtask.dueDate)
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
    updateSubtaskDueDate(subtask.id, newDueDate)
  }

  const handleDeleteConfirm = () => {
    deleteSubtask(subtask.id)
    setShowDeleteConfirm(false)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 ml-4 rounded-md border transition-all hover:bg-muted/30",
        "bg-slate-50/50 dark:bg-slate-800/30 border-l-2 border-l-blue-200 dark:border-l-blue-700",
        subtask.status === "completed" && "opacity-70 bg-green-50/30 dark:bg-green-900/20",
        dueDateInfo && dueDateInfo.status === "overdue" && "border-red-200 bg-red-50/20 dark:border-red-800 dark:bg-red-900/20",
        dueDateInfo && dueDateInfo.status === "due-today" && "border-orange-200 bg-orange-50/20 dark:border-orange-800 dark:bg-orange-900/20"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={subtask.status === "completed"}
        onCheckedChange={handleStatusChange}
        className="shrink-0"
      />

      {/* Subtask Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "text-sm font-medium",
            subtask.status === "completed" && "line-through text-muted-foreground"
          )}>
            {subtask.name}
          </div>
          
          {/* Priority Badge - Smaller */}
          <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 h-5", getPriorityColor(subtask.priority))}>
            {subtask.priority}
          </Badge>

          {/* Tags Display */}
          {subtask.tags && subtask.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {subtask.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5 h-5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <Hash className="h-2.5 w-2.5 mr-0.5" />
                  {tag}
                </Badge>
              ))}
              {subtask.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{subtask.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 mt-1">
          {/* Due Date Picker - Compact */}
          <DatePicker
            date={subtask.dueDate}
            onDateChange={handleDueDateChange}
            placeholder="Set due date"
            className="!h-7 text-xs min-w-[110px]"
          />
          
          {/* Assignee - Compact */}
          <AssigneeSelect
            taskId={subtask.id}
            currentAssignee={subtask.assignee}
            assignTaskToMember={handleAssigneeSelect}
            compact
          />
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Status Select - Compact */}
        <Select value={subtask.status} onValueChange={handleStatusSelect}>
          <SelectTrigger className="w-auto h-7 text-xs border-none shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-xs">Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="in_progress">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs">In Progress</span>
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs">Completed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Subtask Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <EditSubtaskDialog subtask={subtask} taskId={taskId}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit Subtask
              </DropdownMenuItem>
            </EditSubtaskDialog>
            <DropdownMenuItem 
              onSelect={() => setShowDeleteConfirm(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete Subtask
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Delete Subtask
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subtask? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium text-sm">{subtask.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(subtask.priority))}>
                    {subtask.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{subtask.id}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}