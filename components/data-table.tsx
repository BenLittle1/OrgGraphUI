"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useData } from "@/contexts/data-context"
import { CheckSquare, ExternalLink } from "lucide-react"
import Link from "next/link"

export function DataTable() {
  const { getHighPriorityTasks, updateTaskStatus } = useData()
  
  // Get first 15 high-priority tasks for dashboard display
  const highPriorityTasks = getHighPriorityTasks(15)

  const handleTaskComplete = (taskId: number, isCompleted: boolean) => {
    updateTaskStatus(taskId, isCompleted ? "completed" : "pending")
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

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>High Priority Business Process Tasks</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Top {highPriorityTasks.length} critical tasks requiring immediate attention
            </p>
          </div>
          <Link href="/checklist">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View All Tasks
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {highPriorityTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No high priority tasks remaining!</p>
              <p className="text-sm text-muted-foreground">Great job on completing critical items.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Done</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highPriorityTasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className={task.status === "completed" ? "opacity-60 bg-green-50/50" : "hover:bg-muted/50"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={(checked) => handleTaskComplete(task.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.subcategory}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{task.assignee || 'Unassigned'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}