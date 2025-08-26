"use client"

import { Organization } from "@/data/organization-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, Users, Calendar, MapPin, Globe, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

interface OrganizationCardProps {
  organization: Organization
  onViewDetails?: (organization: Organization) => void
  onEditOrganization?: (organization: Organization) => void
  onDeleteOrganization?: (organization: Organization) => void
}

export function OrganizationCard({ 
  organization, 
  onViewDetails,
  onEditOrganization,
  onDeleteOrganization
}: OrganizationCardProps) {
  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "default"
      case "pro":
        return "secondary"
      case "free":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className="group transition-all hover:shadow-md border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {organization.logoUrl ? (
                <img 
                  src={organization.logoUrl} 
                  alt={`${organization.name} logo`}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {organization.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getPlanBadgeVariant(organization.plan)} className="text-xs">
                  {organization.plan.charAt(0).toUpperCase() + organization.plan.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {organization.industry}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails?.(organization)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditOrganization?.(organization)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteOrganization?.(organization)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {organization.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {organization.memberCount} {organization.memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {formatDate(organization.createdDate)}
            </span>
          </div>
          
          {organization.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {organization.location}
              </span>
            </div>
          )}
          
          {organization.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate text-sm"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${organization.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {organization.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails?.(organization)}
            className="text-xs"
          >
            Enter Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}