"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useData, NewTeamMemberData } from "@/contexts/data-context"
import { Plus, Calendar } from "lucide-react"

interface AddTeamMemberDialogProps {
  children: React.ReactNode
}

export function AddTeamMemberDialog({ children }: AddTeamMemberDialogProps) {
  const { teamData, addTeamMember, addDepartment } = useData()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("")
  const [newDepartment, setNewDepartment] = useState("")
  const [hireDate, setHireDate] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    } else if (name.trim().length > 50) {
      newErrors.name = "Name must be 50 characters or less"
    }

    if (!role.trim()) {
      newErrors.role = "Role is required"
    } else if (role.trim().length > 60) {
      newErrors.role = "Role must be 60 characters or less"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!department && !newDepartment.trim()) {
      newErrors.department = "Department is required"
    }

    if (!hireDate) {
      newErrors.hireDate = "Hire date is required"
    } else {
      const selectedDate = new Date(hireDate)
      const today = new Date()
      const minDate = new Date()
      minDate.setFullYear(today.getFullYear() - 20) // 20 years ago
      const maxDate = new Date()
      maxDate.setFullYear(today.getFullYear() + 1) // 1 year future

      if (selectedDate < minDate || selectedDate > maxDate) {
        newErrors.hireDate = "Hire date must be within the last 20 years or up to 1 year in the future"
      }
    }

    if (bio.trim().length > 500) {
      newErrors.bio = "Bio must be 500 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setName("")
    setRole("")
    setEmail("")
    setDepartment("")
    setNewDepartment("")
    setHireDate("")
    setBio("")
    setAvatarUrl("")
    setErrors({})
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Add new department if specified
      const finalDepartment = newDepartment.trim() || department
      if (newDepartment.trim()) {
        addDepartment(newDepartment.trim())
      }

      const memberData: NewTeamMemberData = {
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        department: finalDepartment,
        hireDate,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined
      }

      addTeamMember(memberData)
      
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Error adding team member:", error)
      setErrors({ submit: "Failed to add team member. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    setOpen(newOpen)
  }

  // Set default hire date to today when dialog opens
  const handleDialogOpen = () => {
    if (!hireDate) {
      const today = new Date().toISOString().split('T')[0]
      setHireDate(today)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={handleDialogOpen}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Add a new team member to your organization. Fill in their details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-500">*</span>
            </Label>
            <Input
              id="role"
              placeholder="e.g., Senior Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              maxLength={60}
              className={errors.role ? "border-red-500" : ""}
            />
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select value={department} onValueChange={(value) => {
              setDepartment(value)
              if (value !== "new") {
                setNewDepartment("")
              }
            }}>
              <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {teamData.departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Create new department</SelectItem>
              </SelectContent>
            </Select>
            
            {department === "new" && (
              <Input
                placeholder="Enter new department name"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                maxLength={30}
                className={errors.department ? "border-red-500" : ""}
              />
            )}
            
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department}</p>
            )}
          </div>

          {/* Hire Date */}
          <div className="space-y-2">
            <Label htmlFor="hireDate">
              Hire Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="hireDate"
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className={errors.hireDate ? "border-red-500" : ""}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {errors.hireDate && (
              <p className="text-sm text-red-500">{errors.hireDate}</p>
            )}
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio (optional)
              <span className="text-sm text-muted-foreground ml-2">
                {bio.length}/500
              </span>
            </Label>
            <Textarea
              id="bio"
              placeholder="Brief description of the team member's background and experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className={errors.bio ? "border-red-500" : ""}
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Team Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}