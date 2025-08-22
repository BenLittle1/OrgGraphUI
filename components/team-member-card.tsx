"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditTeamMemberDialog } from "@/components/edit-team-member-dialog"
import { useData } from "@/contexts/data-context"
import { TeamMember } from "@/data/team-data"
import { Mail, Calendar, CheckCircle, Clock, AlertTriangle, MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface TeamMemberCardProps {
  member: TeamMember
  onViewDetails: (member: TeamMember) => void
}

export function TeamMemberCard({ member, onViewDetails }: TeamMemberCardProps) {
  const { getMemberProgress, getTasksForMember, deleteTeamMember } = useData()
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  const progress = getMemberProgress(member.id)
  const memberTasks = getTasksForMember(member.id)
  
  // Calculate task priority distribution for this member
  const priorityCounts = memberTasks.reduce(
    (counts, task) => {
      counts[task.priority as keyof typeof counts]++
      return counts
    },
    { high: 0, medium: 0, low: 0 }
  )

  // Calculate status distribution
  const statusCounts = memberTasks.reduce(
    (counts, task) => {
      counts[task.status as keyof typeof counts]++
      return counts
    },
    { pending: 0, in_progress: 0, completed: 0 }
  )

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

  const formatHireDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const handleCardClick = () => {
    onViewDetails(member)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when button is clicked
    onViewDetails(member)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowEditDialog(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to remove ${member.name} from the team? This will unassign all their tasks.`)) {
      deleteTeamMember(member.id)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when menu is clicked
  }

  return (
    <Card 
      className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {member.role}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getDepartmentColor(member.department)}`}
          >
            {member.department}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact & Hire Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Joined {formatHireDate(member.hireDate)}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Task Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.completed}/{progress.total} tasks
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress.percentage}% complete
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                {statusCounts.completed}
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500">Done</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center justify-center space-x-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                {statusCounts.in_progress}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500">Active</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                {priorityCounts.high}
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-500">High Priority</p>
          </div>
        </div>

        {/* View Details Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4" 
          onClick={handleButtonClick}
        >
          View Details
        </Button>
      </CardContent>

      {/* Edit Team Member Dialog */}
      <EditTeamMemberDialog
        member={showEditDialog ? member : null}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </Card>
  )
}