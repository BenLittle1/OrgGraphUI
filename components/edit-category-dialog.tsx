"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useData, type Category } from "@/contexts/data-context"
import { Edit, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditCategoryDialogProps {
  children?: React.ReactNode
  category: Category
  onCategoryUpdated?: () => void
}

interface FormData {
  name: string
}

interface FormErrors {
  name?: string
  general?: string
}

export function EditCategoryDialog({ children, category, onCategoryUpdated }: EditCategoryDialogProps) {
  const { 
    data, 
    updateCategoryName,
    deleteCategory
  } = useData()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    name: category.name
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset form data when category changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: category.name
      })
      setErrors({})
    }
  }, [open, category])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate category name
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      newErrors.name = "Category name is required"
    } else if (trimmedName.length > 100) {
      newErrors.name = "Category name must be 100 characters or less"
    } else {
      // Check for duplicate names (excluding current category)
      const duplicateCategory = data.categories.find(cat => 
        cat.id !== category.id && cat.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (duplicateCategory) {
        newErrors.name = "A category with this name already exists"
      }
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
      updateCategoryName(category.id, formData.name.trim())
      setOpen(false)
      onCategoryUpdated?.()
    } catch (error) {
      setErrors({ general: "Failed to update category. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = () => {
    try {
      deleteCategory(category.id)
      setShowDeleteConfirm(false)
      setOpen(false)
      onCategoryUpdated?.()
    } catch (error) {
      setErrors({ general: "Failed to delete category. Please try again." })
      setShowDeleteConfirm(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && !isSubmitting) {
      // Reset form when closing
      setFormData({
        name: category.name
      })
      setErrors({})
      setShowDeleteConfirm(false)
    }
  }

  // Calculate if category has content
  const totalTasks = category.subcategories.reduce((sum, sub) => sum + sub.tasks.length, 0)
  const hasContent = category.subcategories.length > 0 || totalTasks > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {!showDeleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Category
              </DialogTitle>
              <DialogDescription>
                Update the category name or delete the category below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="category-name">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
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

              {/* Category Info */}
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">Category Information</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {category.subcategories.length} subcategories • {totalTasks} tasks
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                >
                  Delete Category
                </Button>
                <div className="flex gap-3">
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Category
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Edit className="h-5 w-5" />
                Delete Category
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this category? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="font-medium text-sm text-red-800">{category.name}</p>
                <div className="text-xs text-red-600 mt-1">
                  This will permanently delete {category.subcategories.length} subcategories and {totalTasks} tasks
                </div>
              </div>

              {hasContent && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                  <p className="text-sm text-amber-800 font-medium">⚠️ Warning</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This category contains subcategories and tasks that will be permanently deleted.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                >
                  Delete Category
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}