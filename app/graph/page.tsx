"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import GraphVisualization from "@/components/graph-visualization"
import { convertToGraphData, GraphNode } from "@/lib/graph-data"
import { useData } from "@/contexts/data-context"
import { useState, useMemo, useCallback } from "react"
import { format, isValid, parseISO, differenceInDays } from "date-fns"
import { Calendar, Clock, AlertTriangle } from "lucide-react"

export default function GraphPage() {
  const { data } = useData()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  
  // Transform business process data to graph format
  const graphData = useMemo(() => convertToGraphData(data), [data])
  
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const getDueDateInfo = useCallback((dueDate: string | null) => {
    if (!dueDate) return null
    
    try {
      const parsedDate = parseISO(dueDate)
      if (!isValid(parsedDate)) return null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(parsedDate)
      due.setHours(0, 0, 0, 0)
      
      const daysUntilDue = differenceInDays(due, today)
      
      if (daysUntilDue < 0) {
        return {
          status: "overdue",
          text: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`,
          color: "text-red-700",
          bgColor: "bg-red-100",
          icon: AlertTriangle
        }
      } else if (daysUntilDue === 0) {
        return {
          status: "due-today",
          text: "Due today",
          color: "text-orange-700", 
          bgColor: "bg-orange-100",
          icon: Clock
        }
      } else if (daysUntilDue <= 3) {
        return {
          status: "due-soon",
          text: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
          color: "text-yellow-700",
          bgColor: "bg-yellow-100", 
          icon: Calendar
        }
      } else {
        return {
          status: "due-later",
          text: format(parsedDate, "MMM dd, yyyy"),
          color: "text-gray-700",
          bgColor: "bg-gray-100", 
          icon: Calendar
        }
      }
    } catch {
      return null
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Process Graph</h1>
                <p className="text-muted-foreground">
                  Interactive visualization of all business processes and their relationships
                </p>
              </div>
              
              {/* Stats Summary */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.summary.totalCategories}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data.summary.totalSubcategories}</div>
                  <div className="text-sm text-muted-foreground">Subcategories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.summary.totalTasks}</div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 relative min-h-0">
              {/* Graph Visualization - Full Width */}
              <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm min-h-0">
                <GraphVisualization 
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  onClearSelection={handleClearSelection}
                />
              </div>

              {/* Minimal Node Details Card - Bottom Left Corner */}
              {selectedNode && (
                <div className="absolute bottom-4 left-4 w-72 rounded-lg border bg-card text-card-foreground shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate" title={selectedNode.name}>
                          {selectedNode.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedNode.level === 0 && "Root Process"}
                          {selectedNode.level === 1 && "Category"}
                          {selectedNode.level === 2 && "Subcategory"}
                          {selectedNode.level === 3 && "Task"}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedNode(null)}
                        className="ml-2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>

                    {/* Completion Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs font-semibold">
                          {Math.round(selectedNode.completion * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${selectedNode.completion * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Details */}
                    {selectedNode.level === 3 && selectedNode.originalNode && (
                      <div className="space-y-2">
                        {/* Status and Priority Badges */}
                        <div className="flex flex-wrap gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            selectedNode.originalNode.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : selectedNode.originalNode.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedNode.originalNode.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            selectedNode.originalNode.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : selectedNode.originalNode.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedNode.originalNode.priority}
                          </span>
                        </div>

                        {/* Assignee and Due Date */}
                        <div className="space-y-1">
                          {selectedNode.originalNode.assignee && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Assignee:</span>
                              <span className="font-medium">{selectedNode.originalNode.assignee}</span>
                            </div>
                          )}
                          {selectedNode.originalNode.dueDate && (() => {
                            const dueDateInfo = getDueDateInfo(selectedNode.originalNode.dueDate)
                            const IconComponent = dueDateInfo?.icon
                            return dueDateInfo ? (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">Due:</span>
                                <div className="flex items-center gap-1">
                                  {IconComponent && <IconComponent className="h-3 w-3" />}
                                  <span className={`px-2 py-0.5 rounded-full font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                                    {dueDateInfo.text}
                                  </span>
                                </div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Category/Subcategory Stats */}
                    {selectedNode.level === 1 && selectedNode.originalNode && (
                      <div className="text-xs text-muted-foreground">
                        {selectedNode.originalNode.totalTasks} tasks • {selectedNode.originalNode.subcategories.length} subcategories
                      </div>
                    )}
                    {selectedNode.level === 2 && selectedNode.originalNode && (
                      <div className="text-xs text-muted-foreground">
                        {selectedNode.originalNode.tasks.length} tasks
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}