"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AssigneeSelect } from "@/components/assignee-select"
import { DatePicker } from "@/components/date-picker"
import { useData, type Subtask } from "@/contexts/data-context"
import { Edit, Loader2, X, Plus, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditSubtaskDialogProps {
  children?: React.ReactNode
  subtask: Subtask
  taskId: number
  onSubtaskUpdated?: () => void
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

export function EditSubtaskDialog({ children, subtask, taskId, onSubtaskUpdated }: EditSubtaskDialogProps) {
  const { 
    updateSubtaskName, 
    updateSubtaskPriority, 
    updateSubtaskDueDate,
    updateSubtaskAssignee,
    updateSubtaskTags
  } = useData()

  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [formData, setFormData] = useState<FormData>({
    name: subtask.name,
    priority: subtask.priority as "high" | "medium" | "low",
    assignee: subtask.assignee,
    dueDate: subtask.dueDate,
    tags: subtask.tags || []
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset form when dialog opens or subtask changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: subtask.name,
        priority: subtask.priority as "high" | "medium" | "low",
        assignee: subtask.assignee,
        dueDate: subtask.dueDate,
        tags: subtask.tags || []
      })
      setErrors({})
      setNewTag("")
    }
  }, [isOpen, subtask])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Subtask name is required"
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Subtask name must be 100 characters or less"
    }
    
    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsSaving(true)
    
    try {
      // Update subtask details
      updateSubtaskName(subtask.id, formData.name.trim())
      updateSubtaskPriority(subtask.id, formData.priority)
      updateSubtaskAssignee(subtask.id, formData.assignee)
      updateSubtaskDueDate(subtask.id, formData.dueDate)
      updateSubtaskTags(subtask.id, formData.tags)
      
      setIsOpen(false)
      onSubtaskUpdated?.()
    } catch (error) {
      console.error("Error updating subtask:", error)
      setErrors({ general: "Failed to update subtask. Please try again." })
    } finally {
      setIsSaving(false)
    }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Subtask
          </DialogTitle>
          <DialogDescription>
            Update the subtask details below.
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSave(); }} 
          className="space-y-4"
        >
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {errors.general}
            </div>
          )}

          {/* Subtask Name */}
          <div className="space-y-2">
            <Label htmlFor="subtask-name">Subtask Name *</Label>
            <Input
              id="subtask-name"
              placeholder="Enter subtask name..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
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
            <Label htmlFor="priority">Priority *</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value: "high" | "medium" | "low") => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger id="priority" className={cn(errors.priority && "border-red-500")}>
                <SelectValue placeholder="Select priority" />
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
            <Label htmlFor="assignee">Assignee</Label>
            <AssigneeSelect
              taskId={subtask.id}
              currentAssignee={formData.assignee}
              assignTaskToMember={(taskId, assignee) => 
                setFormData(prev => ({ ...prev, assignee }))
              }
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <DatePicker
              date={formData.dueDate}
              onDateChange={(dueDate) => 
                setFormData(prev => ({ ...prev, dueDate }))
              }
              placeholder="Select due date"
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
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
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}