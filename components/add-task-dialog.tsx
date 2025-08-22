"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AssigneeSelect } from "@/components/assignee-select"
import { DatePicker } from "@/components/date-picker"
import { CategoryCombobox } from "@/components/category-combobox"
import { SubcategoryCombobox } from "@/components/subcategory-combobox"
import { useData, type NewTaskData } from "@/contexts/data-context"
import { Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddTaskDialogProps {
  children?: React.ReactNode
  preselectedSubcategoryId?: number
  onTaskAdded?: () => void
}

interface FormData {
  name: string
  priority: "high" | "medium" | "low"
  categoryId: number | null
  subcategoryId: number | null
  assignee: string | null
  dueDate: string | null
}

interface FormErrors {
  name?: string
  priority?: string
  categoryId?: string
  subcategoryId?: string
  general?: string
}

export function AddTaskDialog({ children, preselectedSubcategoryId, onTaskAdded }: AddTaskDialogProps) {
  const { data, addTask, getAllSubcategories, assignTaskToMember, addCategory, addSubcategory } = useData()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get the category and subcategory for preselected subcategory
  const preselectedCategory = preselectedSubcategoryId 
    ? data.categories.find(cat => 
        cat.subcategories.some(sub => sub.id === preselectedSubcategoryId)
      )
    : null
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    priority: "medium",
    categoryId: preselectedCategory?.id || null,
    subcategoryId: preselectedSubcategoryId || null,
    assignee: null,
    dueDate: null
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const categories = data.categories
  const subcategories = formData.categoryId 
    ? categories.find(cat => cat.id === formData.categoryId)?.subcategories || []
    : []

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate task name
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      newErrors.name = "Task name is required"
    } else if (trimmedName.length > 100) {
      newErrors.name = "Task name must be 100 characters or less"
    }

    // Validate category
    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category"
    }

    // Validate subcategory
    if (!formData.subcategoryId) {
      newErrors.subcategoryId = "Please select a subcategory"
    }

    // Validate priority (should always be valid due to dropdown, but safety check)
    if (!["high", "medium", "low"].includes(formData.priority)) {
      newErrors.priority = "Please select a valid priority"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle category change and reset subcategory
  const handleCategoryChange = (categoryId: number) => {
    setFormData(prev => ({ 
      ...prev, 
      categoryId,
      subcategoryId: null // Reset subcategory when category changes
    }))
    // Clear any existing errors
    if (errors.categoryId || errors.subcategoryId) {
      setErrors(prev => ({
        ...prev,
        categoryId: undefined,
        subcategoryId: undefined
      }))
    }
  }

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: number) => {
    setFormData(prev => ({ ...prev, subcategoryId }))
    // Clear subcategory error if exists
    if (errors.subcategoryId) {
      setErrors(prev => ({ ...prev, subcategoryId: undefined }))
    }
  }

  // Handle creating new category
  const handleCreateCategory = (name: string): number => {
    return addCategory(name)
  }

  // Handle creating new subcategory
  const handleCreateSubcategory = (name: string): number => {
    if (!formData.categoryId) {
      throw new Error("Category must be selected before creating subcategory")
    }
    return addSubcategory(formData.categoryId, name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const taskData: NewTaskData = {
        name: formData.name.trim(),
        priority: formData.priority,
        assignee: formData.assignee,
        dueDate: formData.dueDate
      }

      addTask(formData.subcategoryId!, taskData)
      
      // Reset form
      setFormData({
        name: "",
        priority: "medium",
        categoryId: preselectedCategory?.id || null,
        subcategoryId: preselectedSubcategoryId || null,
        assignee: null,
        dueDate: null
      })
      
      setOpen(false)
      onTaskAdded?.()
    } catch (error) {
      setErrors({ general: "Failed to create task. Please try again." })
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
        categoryId: preselectedCategory?.id || null,
        subcategoryId: preselectedSubcategoryId || null,
        assignee: null,
        dueDate: null
      })
      setErrors({})
    }
  }

  const handleAssigneeChange = (taskId: number, memberId: string | null) => {
    // For the form, we don't have a task ID yet, so we'll handle this differently
    setFormData(prev => ({ ...prev, assignee: memberId }))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </DialogTitle>
          <DialogDescription>
            Create a new task and assign it to a subcategory. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <CategoryCombobox
              categories={categories}
              value={formData.categoryId}
              onValueChange={handleCategoryChange}
              onCreateCategory={handleCreateCategory}
              placeholder="Select a category..."
              error={!!errors.categoryId}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          {/* Subcategory Selection */}
          <div className="space-y-2">
            <Label htmlFor="subcategory">
              Subcategory <span className="text-red-500">*</span>
            </Label>
            <SubcategoryCombobox
              subcategories={subcategories}
              value={formData.subcategoryId}
              onValueChange={handleSubcategoryChange}
              onCreateSubcategory={handleCreateSubcategory}
              categoryId={formData.categoryId}
              placeholder="Select a subcategory..."
              error={!!errors.subcategoryId}
            />
            {errors.subcategoryId && (
              <p className="text-sm text-red-600">{errors.subcategoryId}</p>
            )}
          </div>

          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="task-name">
              Task Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="task-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name"
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
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    High Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Low Priority
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
              taskId={0} // Temporary - not used in form context
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
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}