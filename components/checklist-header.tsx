"use client"

import { Search, Activity, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { ChecklistData } from "@/contexts/data-context"

interface ChecklistHeaderProps {
  data: ChecklistData
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  priorityFilter: string
  setPriorityFilter: (priority: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
}

export function ChecklistHeader({
  data,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
}: ChecklistHeaderProps) {
  const completionPercentage = Math.round(
    (data.summary.statusCounts.completed / data.summary.totalTasks) * 100
  )

  // Calculate high priority task statistics
  const highPriorityTasks = data.categories.flatMap(category => 
    category.subcategories.flatMap(sub => 
      sub.tasks.filter(task => task.priority === "high")
    )
  )
  const highPriorityCompleted = highPriorityTasks.filter(task => task.status === "completed").length
  const highPriorityPercentage = highPriorityTasks.length > 0 
    ? Math.round((highPriorityCompleted / highPriorityTasks.length) * 100)
    : 0

  // Calculate category completion statistics
  const completedCategories = data.categories.filter(category => {
    const allTasks = category.subcategories.flatMap(sub => sub.tasks)
    return allTasks.length > 0 && allTasks.every(task => task.status === "completed")
  }).length
  const categoryCompletionPercentage = data.categories.length > 0 
    ? Math.round((completedCategories / data.categories.length) * 100)
    : 0

  // Calculate active tasks progress (in_progress relative to incomplete tasks)
  const incompleteTasks = data.summary.statusCounts.pending + data.summary.statusCounts.in_progress
  const activeTasksPercentage = incompleteTasks > 0 
    ? Math.round((data.summary.statusCounts.in_progress / incompleteTasks) * 100)
    : 0

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.summary.statusCounts.completed} of {data.summary.totalTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-red-600">{highPriorityPercentage}%</div>
            <Progress value={highPriorityPercentage} className="h-2 bg-red-100 [&>div]:bg-red-500" />
            <p className="text-xs text-muted-foreground mt-2">
              {highPriorityCompleted} of {highPriorityTasks.length} high priority completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-blue-600">{categoryCompletionPercentage}%</div>
            <Progress value={categoryCompletionPercentage} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedCategories} of {data.categories.length} categories completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-blue-600">{activeTasksPercentage}%</div>
            <Progress value={activeTasksPercentage} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.summary.statusCounts.in_progress} of {incompleteTasks} incomplete items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search & Filter Items
            </CardTitle>
            <AddTaskDialog>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </AddTaskDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search bar on the left */}
            <div className="flex-1">
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filter buttons grouped together on the right */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
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

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        High
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Medium
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Low
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data.categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="outline" className="gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priorityFilter !== "all" && (
                <Badge variant="outline" className="gap-1">
                  Priority: {priorityFilter}
                  <button
                    onClick={() => setPriorityFilter("all")}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="outline" className="gap-1">
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setCategoryFilter("all")
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}