"use client"

import { Search, User, Clock, AlertTriangle, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Task } from "@/contexts/data-context"
import { parseISO, isValid, differenceInDays } from "date-fns"

interface MyTasksHeaderProps {
  tasks: Array<Task & { category: string; subcategory: string }>
  filteredTasks: Array<Task & { category: string; subcategory: string }>
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  priorityFilter: string
  setPriorityFilter: (priority: string) => void
}

export function MyTasksHeader({
  tasks,
  filteredTasks,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}: MyTasksHeaderProps) {
  // Calculate task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === "completed").length
  const inProgressTasks = tasks.filter(task => task.status === "in_progress").length
  const highPriorityTasks = tasks.filter(task => task.priority === "high").length
  
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0

  // Calculate overdue tasks
  const now = new Date()
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = parseISO(task.dueDate)
    return isValid(dueDate) && differenceInDays(dueDate, now) < 0 && task.status !== "completed"
  }).length

  // Calculate due today tasks
  const dueTodayTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = parseISO(task.dueDate)
    return isValid(dueDate) && differenceInDays(dueDate, now) === 0 && task.status !== "completed"
  }).length

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Progress value={completionPercentage} className="flex-1" />
                <span>{completionPercentage}% complete</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">
                Active tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highPriorityTasks}</div>
              <p className="text-xs text-muted-foreground">
                Urgent tasks
              </p>
            </CardContent>
          </Card>

          {overdueTasks > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          )}

          {dueTodayTasks > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{dueTodayTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Due today
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Finished tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {filteredTasks.length} of {totalTasks} tasks</span>
              {(statusFilter !== "all" || priorityFilter !== "all" || searchTerm) && (
                <Badge variant="secondary" className="ml-2">
                  Filtered
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}