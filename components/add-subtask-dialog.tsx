"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AssigneeSelect } from "@/components/assignee-select"
import { DatePicker } from "@/components/date-picker"
import { useData, type NewSubtaskData } from "@/contexts/data-context"
import { Plus, Loader2, X, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddSubtaskDialogProps {
  taskId: number
  taskName: string  // For display context ("Add subtask to: {taskName}")
  trigger: React.ReactNode  // Button or element that opens dialog
  addSubtask: (taskId: number, subtaskData: NewSubtaskData) => void
}

interface FormData {
  name: string
  priority: "high" | "medium" | "low"
  assignee: string | null
  dueDate: string | null
  tags: string[]
}

interface FormErrors {
  name?: string
  priority?: string
  general?: string
}

export function AddSubtaskDialog({ taskId, taskName, trigger, addSubtask }: AddSubtaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    priority: "medium",
    assignee: null,
    dueDate: null,
    tags: []
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate subtask name
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      newErrors.name = "Subtask name is required"
    } else if (trimmedName.length > 100) {
      newErrors.name = "Subtask name must be 100 characters or less"
    }

    // Validate priority (should always be valid due to dropdown, but safety check)
    if (!["high", "medium", "low"].includes(formData.priority)) {
      newErrors.priority = "Please select a valid priority"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const subtaskData: NewSubtaskData = {
        name: formData.name.trim(),
        priority: formData.priority,
        assignee: formData.assignee,
        dueDate: formData.dueDate,
        tags: formData.tags
      }

      addSubtask(taskId, subtaskData)
      
      // Reset form
      setFormData({
        name: "",
        priority: "medium",
        assignee: null,
        dueDate: null,
        tags: []
      })
      setNewTag("")
      
      setOpen(false)
    } catch (error) {
      setErrors({ general: "Failed to create subtask. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && !isSubmitting) {
      // Reset form when closing
      setFormData({
        name: "",
        priority: "medium",
        assignee: null,
        dueDate: null,
        tags: []
      })
      setNewTag("")
      setErrors({})
    }
  }

  const handleAssigneeChange = (taskId: number, memberId: string | null) => {
    // For the form, we don't use the taskId parameter
    setFormData(prev => ({ ...prev, assignee: memberId }))
  }

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Subtask
          </DialogTitle>
          <DialogDescription>
            Add subtask to: <span className="font-medium text-foreground">{taskName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Subtask Name */}
          <div className="space-y-2">
            <Label htmlFor="subtask-name">
              Subtask Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subtask-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter subtask name"
              className={cn(errors.name && "border-red-500")}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "high" | "medium" | "low") => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className={cn(errors.priority && "border-red-500")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor("high")}>
                      High
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor("medium")}>
                      Medium
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor("low")}>
                      Low
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-red-600">{errors.priority}</p>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee (Optional)</Label>
            <AssigneeSelect
              taskId={taskId} // Pass the actual taskId for context
              currentAssignee={formData.assignee}
              assignTaskToMember={handleAssigneeChange}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <DatePicker
              date={formData.dueDate}
              onDateChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
              placeholder="Select due date"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="space-y-2">
              {/* Existing Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-blue-100 text-blue-700 border-blue-200 pr-1"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 rounded-full"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subtask
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}