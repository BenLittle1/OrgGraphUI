"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamMemberCard } from "@/components/team-member-card"
import { TeamMemberDetail } from "@/components/team-member-detail"
import { useData } from "@/contexts/data-context"
import { TeamMember } from "@/data/team-data"
import { Users, Search, Filter, TrendingUp } from "lucide-react"

export default function TeamPage() {
  const { teamData, getActiveMemberCount } = useData()
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  
  // Filter members based on search query and department
  const filteredMembers = teamData.members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || member.department === selectedDepartment
    
    return matchesSearch && matchesDepartment && member.isActive
  })

  // Calculate team statistics
  const departmentCounts = teamData.members.reduce((counts, member) => {
    if (member.isActive) {
      counts[member.department] = (counts[member.department] || 0) + 1
    }
    return counts
  }, {} as Record<string, number>)

  const totalActiveMembers = getActiveMemberCount()

  const handleViewMemberDetails = (member: TeamMember) => {
    setSelectedMember(member)
  }

  const handleCloseDetails = () => {
    setSelectedMember(null)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDepartment("all")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-6">
            <div className="px-4 lg:px-6">
              {/* Team Statistics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {teamData.departments.map((department) => {
                  const count = departmentCounts[department] || 0
                  return (
                    <Card key={department} className="transition-all hover:shadow-md">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{department}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{count}</div>
                        <p className="text-xs text-muted-foreground">
                          {count === 1 ? 'member' : 'members'}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
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
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, role, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {teamData.departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(searchQuery || selectedDepartment !== "all") && (
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
                  Showing {filteredMembers.length} of {totalActiveMembers} team members
                  {(searchQuery || selectedDepartment !== "all") && (
                    <Badge variant="secondary" className="ml-2">
                      Filtered
                    </Badge>
                  )}
                </div>
              </div>

              {/* Team Members Grid */}
              {filteredMembers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {filteredMembers.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onViewDetails={handleViewMemberDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or clearing filters
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Team Member Detail Modal */}
        <TeamMemberDetail
          member={selectedMember}
          open={!!selectedMember}
          onOpenChange={(open) => {
            if (!open) handleCloseDetails()
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}