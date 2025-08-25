"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useData } from "@/contexts/data-context"
import { TrendingUp, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export function ChartAreaInteractive() {
  const { data, getCategoryProgress, getTaskCompletion } = useData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Business Process Categories</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Progress overview across all business areas
          </p>
        </div>
        <Link href="/checklist">
          <Button variant="ghost" size="sm" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Manage Tasks
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.categories.map((category) => {
            const allTasks = category.subcategories.flatMap(sub => sub.tasks)
            const allSubtasks = allTasks.flatMap(task => task.subtasks)
            const allItems = [...allTasks, ...allSubtasks]
            
            const completedItems = allItems.filter(item => item.status === "completed")
            const inProgressItems = allItems.filter(item => item.status === "in_progress")
            const progressPercentage = getCategoryProgress(category.id)
            
            return (
              <div key={category.id} className="space-y-3 p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{category.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        {completedItems.length} completed
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        {inProgressItems.length} in progress
                      </div>
                      <span>{allItems.length} total items</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold">{progressPercentage}%</div>
                    {progressPercentage === 100 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>
                    )}
                  </div>
                </div>
                
                <Progress value={progressPercentage} className="h-2" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {category.subcategories.map((sub) => {
                    const subTasks = sub.tasks
                    const subSubtasks = subTasks.flatMap(task => task.subtasks)
                    const subAllItems = [...subTasks, ...subSubtasks]
                    const subCompleted = subAllItems.filter(item => item.status === "completed").length
                    const subProgress = subAllItems.length > 0 ? Math.round((subCompleted / subAllItems.length) * 100) : 0
                    
                    return (
                      <div key={sub.id} className="p-3 rounded bg-background/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="truncate pr-2 text-muted-foreground font-medium">{sub.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold">{subCompleted}/{subAllItems.length}</span>
                            {subProgress === 100 && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-muted-foreground">{subProgress}%</span>
                          </div>
                          <Progress value={subProgress} className="h-1.5" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}