"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useData, type Subcategory } from "@/contexts/data-context"
import { Edit, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditSubcategoryDialogProps {
  children?: React.ReactNode
  subcategory: Subcategory
  categoryId: number
  categoryName: string
  onSubcategoryUpdated?: () => void
}

interface FormData {
  name: string
}

interface FormErrors {
  name?: string
  general?: string
}

export function EditSubcategoryDialog({ children, subcategory, categoryId, categoryName, onSubcategoryUpdated }: EditSubcategoryDialogProps) {
  const { 
    data, 
    updateSubcategoryName,
    deleteSubcategory
  } = useData()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    name: subcategory.name
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset form data when subcategory changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: subcategory.name
      })
      setErrors({})
    }
  }, [open, subcategory])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate subcategory name
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      newErrors.name = "Subcategory name is required"
    } else if (trimmedName.length > 100) {
      newErrors.name = "Subcategory name must be 100 characters or less"
    } else {
      // Check for duplicate names within the same category (excluding current subcategory)
      const parentCategory = data.categories.find(cat => cat.id === categoryId)
      if (parentCategory) {
        const duplicateSubcategory = parentCategory.subcategories.find(sub => 
          sub.id !== subcategory.id && sub.name.toLowerCase() === trimmedName.toLowerCase()
        )
        if (duplicateSubcategory) {
          newErrors.name = "A subcategory with this name already exists in this category"
        }
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
      updateSubcategoryName(subcategory.id, formData.name.trim())
      setOpen(false)
      onSubcategoryUpdated?.()
    } catch (error) {
      setErrors({ general: "Failed to update subcategory. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = () => {
    try {
      deleteSubcategory(subcategory.id)
      setShowDeleteConfirm(false)
      setOpen(false)
      onSubcategoryUpdated?.()
    } catch (error) {
      setErrors({ general: "Failed to delete subcategory. Please try again." })
      setShowDeleteConfirm(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen && !isSubmitting) {
      // Reset form when closing
      setFormData({
        name: subcategory.name
      })
      setErrors({})
      setShowDeleteConfirm(false)
    }
  }

  // Calculate if subcategory has content
  const totalTasks = subcategory.tasks.length
  const hasContent = totalTasks > 0

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
                Edit Subcategory
              </DialogTitle>
              <DialogDescription>
                Update the subcategory name or delete the subcategory below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {errors.general}
                </div>
              )}

              {/* Subcategory Name */}
              <div className="space-y-2">
                <Label htmlFor="subcategory-name">
                  Subcategory Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subcategory-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter subcategory name"
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

              {/* Subcategory Info */}
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">Subcategory Information</p>
                <div className="text-xs text-muted-foreground mt-1">
                  Category: {categoryName} • {totalTasks} tasks
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
                  Delete Subcategory
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
                        Update Subcategory
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
                Delete Subcategory
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subcategory? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="font-medium text-sm text-red-800">{subcategory.name}</p>
                <div className="text-xs text-red-600 mt-1">
                  Category: {categoryName} • This will permanently delete {totalTasks} tasks
                </div>
              </div>

              {hasContent && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                  <p className="text-sm text-amber-800 font-medium">⚠️ Warning</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This subcategory contains tasks that will be permanently deleted.
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
                  Delete Subcategory
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}