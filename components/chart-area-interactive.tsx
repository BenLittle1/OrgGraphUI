"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useData } from "@/contexts/data-context"
import { TrendingUp, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export function ChartAreaInteractive() {
  const { data, getCategoryProgress } = useData()

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
            const completedTasks = allTasks.filter(task => task.status === "completed")
            const inProgressTasks = allTasks.filter(task => task.status === "in_progress")
            const progressPercentage = getCategoryProgress(category.id)
            
            return (
              <div key={category.id} className="space-y-3 p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">{category.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {completedTasks.length} completed
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        {inProgressTasks.length} in progress
                      </div>
                      <span>{allTasks.length} total</span>
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
                    const subCompleted = sub.tasks.filter(task => task.status === "completed").length
                    const subProgress = Math.round((subCompleted / sub.tasks.length) * 100)
                    
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-2 rounded bg-background/50">
                        <span className="truncate pr-2 text-muted-foreground">{sub.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs">{subCompleted}/{sub.tasks.length}</span>
                          {subProgress === 100 && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
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