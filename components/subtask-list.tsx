"use client"

import { SubtaskItem } from "@/components/subtask-item"
import { Subtask } from "@/contexts/data-context"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, ListTodo, Plus } from "lucide-react"

interface SubtaskListProps {
  taskId: number
  subtasks: Subtask[]
  isExpanded: boolean
  updateSubtaskStatus: (subtaskId: number, newStatus: string) => void
  updateSubtaskAssignee: (subtaskId: number, assignee: string | null) => void
  updateSubtaskDueDate: (subtaskId: number, dueDate: string | null) => void
  deleteSubtask: (subtaskId: number) => void
}

export function SubtaskList({ 
  taskId,
  subtasks, 
  isExpanded, 
  updateSubtaskStatus, 
  updateSubtaskAssignee, 
  updateSubtaskDueDate, 
  deleteSubtask 
}: SubtaskListProps) {
  // Don't render anything if not expanded
  if (!isExpanded) {
    return null
  }

  return (
    <div className={cn(
      "transition-all duration-200 ease-in-out",
      "border-t border-border bg-muted/20 rounded-b-lg"
    )}>
      {subtasks.length === 0 ? (
        // Empty state
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ListTodo className="h-8 w-8 opacity-50" />
            <p className="text-sm font-medium">No subtasks yet</p>
            <p className="text-xs">Break this task down into smaller steps</p>
          </div>
        </div>
      ) : (
        // Subtask list
        <div className="space-y-1 p-3 pl-6">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              taskId={taskId}
              updateSubtaskStatus={updateSubtaskStatus}
              updateSubtaskAssignee={updateSubtaskAssignee}
              updateSubtaskDueDate={updateSubtaskDueDate}
              deleteSubtask={deleteSubtask}
            />
          ))}
        </div>
      )}
    </div>
  )
}