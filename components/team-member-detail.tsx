"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useData } from "@/contexts/data-context"
import { TeamMember } from "@/data/team-data"
import { 
  Mail, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Briefcase,
  Building,
  Search,
  Filter,
  X
} from "lucide-react"

interface TeamMemberDetailProps {
  member: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamMemberDetail({ member, open, onOpenChange }: TeamMemberDetailProps) {
  const { getMemberProgress, getTasksForMember } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Reset filters when modal opens or member changes
  useEffect(() => {
    if (open && member) {
      setSearchQuery("")
      setStatusFilter("all")
    }
  }, [open, member?.id])
  
  if (!member) return null
  
  const progress = getMemberProgress(member.id)
  const memberTasks = getTasksForMember(member.id)
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Executive': 'bg-purple-100 text-purple-800 border-purple-200',
      'Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Product': 'bg-orange-100 text-orange-800 border-orange-200',
      'Marketing': 'bg-pink-100 text-pink-800 border-pink-200',
      'Sales': 'bg-red-100 text-red-800 border-red-200',
      'Legal': 'bg-gray-100 text-gray-800 border-gray-200',
      'Human Resources': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatHireDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Filter tasks based on search query and status
  const filteredTasks = memberTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = []
    }
    acc[task.category].push(task)
    return acc
  }, {} as Record<string, typeof filteredTasks>)

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg md:max-w-3xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Member Details</DialogTitle>
          <DialogDescription>
            Complete overview of {member.name}'s profile and assigned tasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="flex flex-col items-center md:items-start space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 space-y-4 mt-4 md:mt-0">
                  <div>
                    <h2 className="text-2xl font-bold">{member.name}</h2>
                    <p className="text-lg text-muted-foreground">{member.role}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <Badge 
                        variant="outline" 
                        className={getDepartmentColor(member.department)}
                      >
                        {member.department}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatHireDate(member.hireDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Task Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {progress.total}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Assigned</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {progress.completed}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {progress.inProgress}
                  </div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {progress.pending}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Assigned Tasks by Category */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assigned Tasks</CardTitle>
                  <DialogDescription>
                    Tasks organized by business category
                  </DialogDescription>
                </div>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks, categories, or subcategories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Pending
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            In Progress
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Summary */}
              {(searchQuery || statusFilter !== "all") && (
                <div className="text-sm text-muted-foreground mt-2">
                  Showing {filteredTasks.length} of {memberTasks.length} tasks
                  <Badge variant="secondary" className="ml-2">
                    Filtered
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(tasksByCategory).length > 0 ? (
                Object.entries(tasksByCategory).map(([category, tasks]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold text-base border-b border-border pb-2">
                      {category} ({tasks.length} tasks)
                    </h3>
                    <div className="grid gap-2">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{task.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.subcategory}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(task.priority)}
                            >
                              {task.priority}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(task.status)}
                            >
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    No tasks match your current search criteria
                  </p>
                  {(searchQuery || statusFilter !== "all") && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}