"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrganizationCard } from "@/components/organization-card"
import { AddOrganizationDialog } from "@/components/add-organization-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { Organization, organizationData } from "@/data/organization-data"
import { Building2, Search, Filter, TrendingUp, Plus, Users, Calendar } from "lucide-react"

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState(organizationData.organizations)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all")
  const [selectedPlan, setSelectedPlan] = useState<string>("all")

  // Filter organizations based on search query, industry, and plan
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.industry.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesIndustry = selectedIndustry === "all" || org.industry === selectedIndustry
    const matchesPlan = selectedPlan === "all" || org.plan === selectedPlan
    
    return matchesSearch && matchesIndustry && matchesPlan && org.isActive
  })

  // Calculate organization statistics
  const industryStats = organizations.reduce((stats, org) => {
    if (org.isActive) {
      stats[org.industry] = (stats[org.industry] || 0) + 1
    }
    return stats
  }, {} as Record<string, number>)

  const planStats = organizations.reduce((stats, org) => {
    if (org.isActive) {
      stats[org.plan] = (stats[org.plan] || 0) + 1
    }
    return stats
  }, {} as Record<string, number>)

  const totalMembers = organizations.reduce((total, org) => {
    return org.isActive ? total + org.memberCount : total
  }, 0)

  const handleViewDetails = (organization: Organization) => {
    // TODO: Navigate to organization dashboard
    console.log("View details for:", organization.name)
    // This would redirect to the main dashboard with organization context
    window.location.href = "/"
  }

  const handleEditOrganization = (organization: Organization) => {
    // TODO: Open edit dialog
    console.log("Edit organization:", organization.name)
  }

  const handleDeleteOrganization = (organization: Organization) => {
    // TODO: Open confirmation dialog and delete
    console.log("Delete organization:", organization.name)
  }

  const handleAddOrganization = (newOrgData: any) => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      ...newOrgData,
      memberCount: 1, // Start with the creator as first member
      createdDate: new Date().toISOString().split('T')[0],
      isActive: true
    }

    setOrganizations([...organizations, newOrg])
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedIndustry("all")
    setSelectedPlan("all")
  }

  const hasFilters = searchQuery || selectedIndustry !== "all" || selectedPlan !== "all"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
              <p className="text-muted-foreground">
                Manage your organizations and access their dashboards
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <AddOrganizationDialog onAddOrganization={handleAddOrganization}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Organization
                </Button>
              </AddOrganizationDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizations.filter(org => org.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                Active organizations
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Across all organizations
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enterprise Plans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planStats.enterprise || 0}</div>
              <p className="text-xs text-muted-foreground">
                Premium subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Industries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(industryStats).length}</div>
              <p className="text-xs text-muted-foreground">
                Different sectors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, description, or industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {organizationData.industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredOrganizations.length} of {organizations.filter(org => org.isActive).length} organizations
            {hasFilters && (
              <Badge variant="secondary" className="ml-2">
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Organizations Grid */}
        {filteredOrganizations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrganizations.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                onViewDetails={handleViewDetails}
                onEditOrganization={handleEditOrganization}
                onDeleteOrganization={handleDeleteOrganization}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {organizations.length === 0 ? "No organizations yet" : "No organizations found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {organizations.length === 0 
                  ? "Get started by creating your first organization to manage business processes and team members."
                  : "Try adjusting your search criteria or clearing filters to find organizations."
                }
              </p>
              {organizations.length === 0 ? (
                <AddOrganizationDialog onAddOrganization={handleAddOrganization}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Organization
                  </Button>
                </AddOrganizationDialog>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}