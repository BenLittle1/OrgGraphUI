"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { organizationData } from "@/data/organization-data"
import { Plus, Building2 } from "lucide-react"

interface NewOrganizationData {
  name: string
  description: string
  industry: string
  website?: string
  location?: string
  logoUrl?: string
  plan: "free" | "pro" | "enterprise"
}

interface AddOrganizationDialogProps {
  children: React.ReactNode
  onAddOrganization?: (data: NewOrganizationData) => void
}

export function AddOrganizationDialog({ children, onAddOrganization }: AddOrganizationDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [newIndustry, setNewIndustry] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("free")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Organization name is required"
    } else if (name.trim().length > 100) {
      newErrors.name = "Organization name must be 100 characters or less"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    } else if (description.trim().length > 500) {
      newErrors.description = "Description must be 500 characters or less"
    }

    if (!industry && !newIndustry.trim()) {
      newErrors.industry = "Industry is required"
    }

    if (website && !/^https?:\/\/.+\..+/.test(website.trim())) {
      newErrors.website = "Please enter a valid website URL (e.g., https://example.com)"
    }

    if (logoUrl && !/^https?:\/\/.+\..+/.test(logoUrl.trim())) {
      newErrors.logoUrl = "Please enter a valid logo URL"
    }

    if (location.trim().length > 100) {
      newErrors.location = "Location must be 100 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setIndustry("")
    setNewIndustry("")
    setWebsite("")
    setLocation("")
    setLogoUrl("")
    setPlan("free")
    setErrors({})
    setIsSubmitting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const finalIndustry = newIndustry.trim() || industry

      const organizationData: NewOrganizationData = {
        name: name.trim(),
        description: description.trim(),
        industry: finalIndustry,
        website: website.trim() || undefined,
        location: location.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        plan
      }

      onAddOrganization?.(organizationData)
      
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Error adding organization:", error)
      setErrors({ submit: "Failed to add organization. Please try again." })
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Organization
          </DialogTitle>
          <DialogDescription>
            Create a new organization to manage your business processes and team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
              <span className="text-sm text-muted-foreground ml-2">
                {description.length}/500
              </span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of your organization and its purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">
                Industry <span className="text-red-500">*</span>
              </Label>
              <Select value={industry} onValueChange={(value) => {
                setIndustry(value)
                if (value !== "new") {
                  setNewIndustry("")
                }
              }}>
                <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {organizationData.industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Other (specify)</SelectItem>
                </SelectContent>
              </Select>
              
              {industry === "new" && (
                <Input
                  placeholder="Enter industry type"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  maxLength={50}
                  className={errors.industry ? "border-red-500" : ""}
                />
              )}
              
              {errors.industry && (
                <p className="text-sm text-red-500">{errors.industry}</p>
              )}
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={plan} onValueChange={(value) => setPlan(value as "free" | "pro" | "enterprise")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourcompany.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={errors.website ? "border-red-500" : ""}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={errors.logoUrl ? "border-red-500" : ""}
              />
              {errors.logoUrl && (
                <p className="text-sm text-red-500">{errors.logoUrl}</p>
              )}
            </div>
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
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}