"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Activity } from "lucide-react"
import { useData } from "@/contexts/data-context"

export function SectionCards() {
  const { data } = useData()
  
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

  const stats = [
    { 
      name: "Overall Progress", 
      value: data.summary.statusCounts.completed.toString(), 
      icon: CheckCircle, 
      change: `${data.summary.statusCounts.in_progress} in progress`,
      color: "text-green-600",
      isProgress: true
    },
    { 
      name: "High Priority Progress", 
      value: data.summary.priorityCounts.high.toString(), 
      icon: AlertTriangle, 
      change: "needs immediate attention",
      color: "text-red-600",
      isProgress: true,
      isHighPriority: true
    },
    { 
      name: "Business Categories", 
      value: data.summary.totalCategories.toString(), 
      icon: TrendingUp, 
      change: "business areas covered",
      color: "text-blue-600",
      isProgress: true,
      isCategoryProgress: true
    },
    { 
      name: "Active Tasks", 
      value: data.summary.statusCounts.in_progress.toString(), 
      icon: Activity, 
      change: "currently in progress",
      color: "text-blue-600",
      isProgress: true,
      isActiveProgress: true
    },
  ]

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {stats.map((stat) => (
        <Card key={stat.name} className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            {!stat.isProgress && <stat.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            {stat.isProgress ? (
              <>
                {stat.isHighPriority ? (
                  <>
                    <div className="text-2xl font-bold mb-2 text-red-600">{highPriorityPercentage}%</div>
                    <Progress value={highPriorityPercentage} className="h-2 bg-red-100 [&>div]:bg-red-500" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {highPriorityCompleted} of {highPriorityTasks.length} high priority completed
                    </p>
                  </>
                ) : stat.isCategoryProgress ? (
                  <>
                    <div className="text-2xl font-bold mb-2 text-blue-600">{categoryCompletionPercentage}%</div>
                    <Progress value={categoryCompletionPercentage} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {completedCategories} of {data.categories.length} categories completed
                    </p>
                  </>
                ) : stat.isActiveProgress ? (
                  <>
                    <div className="text-2xl font-bold mb-2 text-blue-600">{activeTasksPercentage}%</div>
                    <Progress value={activeTasksPercentage} className="h-2 bg-blue-100 [&>div]:bg-blue-500" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.summary.statusCounts.in_progress} of {incompleteTasks} incomplete tasks
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold mb-2">{completionPercentage}%</div>
                    <Progress value={completionPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {data.summary.statusCounts.completed} of {data.summary.totalTasks} completed
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}