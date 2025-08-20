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
        <div className="flex flex-1 flex-col">
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
            <div className="flex flex-1 gap-4">
              {/* Graph Visualization */}
              <div className="flex-1 rounded-lg border bg-card text-card-foreground shadow-sm">
                <GraphVisualization 
                  data={graphData}
                  onNodeClick={handleNodeClick}
                />
              </div>

              {/* Side Panel for Selected Node Details */}
              {selectedNode && (
                <div className="w-80 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold">{selectedNode.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedNode.level === 0 && "Root Process"}
                        {selectedNode.level === 1 && "Category"}
                        {selectedNode.level === 2 && "Subcategory"}
                        {selectedNode.level === 3 && "Task"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Completion</span>
                        <span className="text-sm font-semibold">
                          {Math.round(selectedNode.completion * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedNode.completion * 100}%` }}
                        />
                      </div>


                      {/* Task-specific details */}
                      {selectedNode.level === 3 && selectedNode.originalNode && (
                        <div className="space-y-2 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Status</span>
                            <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${
                              selectedNode.originalNode.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : selectedNode.originalNode.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedNode.originalNode.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Priority</span>
                            <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${
                              selectedNode.originalNode.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : selectedNode.originalNode.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {selectedNode.originalNode.priority}
                            </span>
                          </div>

                          {selectedNode.originalNode.assignee && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Assignee</span>
                              <span className="text-sm">
                                {selectedNode.originalNode.assignee}
                              </span>
                            </div>
                          )}

                          {selectedNode.originalNode.dueDate && (() => {
                            const dueDateInfo = getDueDateInfo(selectedNode.originalNode.dueDate)
                            const IconComponent = dueDateInfo?.icon
                            return dueDateInfo ? (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Due Date</span>
                                <div className="flex items-center gap-1">
                                  {IconComponent && <IconComponent className="h-3 w-3" />}
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                                    {dueDateInfo.text}
                                  </span>
                                </div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}

                      {/* Category-specific details */}
                      {selectedNode.level === 1 && selectedNode.originalNode && (
                        <div className="space-y-2 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Tasks</span>
                            <span className="text-sm font-semibold">
                              {selectedNode.originalNode.totalTasks}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Subcategories</span>
                            <span className="text-sm font-semibold">
                              {selectedNode.originalNode.subcategories.length}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Subcategory-specific details */}
                      {selectedNode.level === 2 && selectedNode.originalNode && (
                        <div className="space-y-2 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Tasks</span>
                            <span className="text-sm font-semibold">
                              {selectedNode.originalNode.tasks.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Close Details
                    </button>
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