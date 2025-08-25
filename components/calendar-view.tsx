"use client"

import * as React from "react"
import { useState, useMemo, useCallback } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO, isValid } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, BarChart3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useData } from "@/contexts/data-context"
import { CalendarEvent } from "@/components/calendar-event"
import { Task, Subtask } from "@/contexts/data-context"

// Combined type for calendar events (both tasks and subtasks)
type CalendarEventItem = {
  id: string // 'task-123' or 'subtask-456'
  type: 'task' | 'subtask'
  name: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
  category: string
  subcategory: string
  parentTaskName?: string // For subtasks only
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  events: CalendarEventItem[] // Now contains both tasks and subtasks
}

interface CalendarViewProps {
  // Props from parent component for subtask editing
  updateSubtaskStatus?: (subtaskId: number, status: string) => void
  updateSubtaskAssignee?: (subtaskId: number, assignee: string | null) => void
  updateSubtaskDueDate?: (subtaskId: number, dueDate: string | null) => void
  updateSubtaskName?: (subtaskId: number, name: string) => void
  updateSubtaskPriority?: (subtaskId: number, priority: string) => void
  getSubtaskById?: (subtaskId: number) => Subtask | null
}

export function CalendarView({
  updateSubtaskStatus,
  updateSubtaskAssignee,
  updateSubtaskDueDate,
  updateSubtaskName,
  updateSubtaskPriority,
  getSubtaskById
}: CalendarViewProps = {}) {
  const { getUpcomingTasksByDueDate, getUpcomingSubtasksByDueDate, getTeamMembers } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [showCompleted, setShowCompleted] = useState(true)
  
  // Get all tasks and subtasks with due dates and apply filters
  const allEventsWithDueDates = useMemo(() => {
    const allTasks = getUpcomingTasksByDueDate(1000) // Get all tasks with due dates
    const allSubtasks = getUpcomingSubtasksByDueDate(1000) // Get all subtasks with due dates
    
    // Convert tasks to CalendarEventItem format
    const taskEvents: CalendarEventItem[] = allTasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      name: task.name,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      category: task.category,
      subcategory: task.subcategory
    }))
    
    // Convert subtasks to CalendarEventItem format
    const subtaskEvents: CalendarEventItem[] = allSubtasks.map(subtask => ({
      id: `subtask-${subtask.id}`,
      type: 'subtask' as const,
      name: subtask.name,
      status: subtask.status,
      priority: subtask.priority,
      assignee: subtask.assignee,
      dueDate: subtask.dueDate,
      category: subtask.category,
      subcategory: subtask.subcategory,
      parentTaskName: subtask.taskName
    }))
    
    // Combine and filter
    const allEvents = [...taskEvents, ...subtaskEvents]
    
    return allEvents.filter(event => {
      // Status filter
      if (statusFilter !== "all" && event.status !== statusFilter) return false
      
      // Priority filter
      if (priorityFilter !== "all" && event.priority !== priorityFilter) return false
      
      // Assignee filter
      if (assigneeFilter !== "all") {
        if (assigneeFilter === "unassigned" && event.assignee !== null) return false
        if (assigneeFilter !== "unassigned" && event.assignee !== assigneeFilter) return false
      }
      
      // Show completed filter
      if (!showCompleted && event.status === "completed") return false
      
      return true
    })
  }, [getUpcomingTasksByDueDate, getUpcomingSubtasksByDueDate, statusFilter, priorityFilter, assigneeFilter, showCompleted])

  // Group events (tasks + subtasks) by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEventItem[]> = {}
    
    allEventsWithDueDates.forEach(event => {
      if (event.dueDate) {
        try {
          const date = parseISO(event.dueDate)
          if (isValid(date)) {
            const dateKey = format(date, "yyyy-MM-dd")
            if (!grouped[dateKey]) {
              grouped[dateKey] = []
            }
            grouped[dateKey].push(event)
          }
        } catch {
          // Skip invalid dates
        }
      }
    })
    
    return grouped
  }, [allEventsWithDueDates])

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    
    const days: CalendarDay[] = []
    let day = calendarStart
    
    while (day <= calendarEnd) {
      const dateKey = format(day, "yyyy-MM-dd")
      const dayEvents = eventsByDate[dateKey] || []
      
      days.push({
        date: new Date(day),
        isCurrentMonth: isSameMonth(day, currentDate),
        events: dayEvents
      })
      
      day = addDays(day, 1)
    }
    
    return days
  }, [currentDate, eventsByDate])

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1))
  }, [])
  
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1))
  }, [])
  
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Filter helpers
  const clearFilters = useCallback(() => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setAssigneeFilter("all")
    setShowCompleted(true)
  }, [])

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || !showCompleted

  // Get unique assignees for filter dropdown
  const teamMembers = useMemo(() => getTeamMembers(), [getTeamMembers])
  const uniqueAssignees = useMemo(() => {
    const assignees = new Set(allEventsWithDueDates.map(e => e.assignee).filter(Boolean) as string[])
    return Array.from(assignees).sort()
  }, [allEventsWithDueDates])

  // Calculate weeks for the grid
  const weeks = useMemo(() => {
    const result: CalendarDay[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7))
    }
    return result
  }, [calendarDays])

  // Summary statistics for current month (tasks + subtasks)
  const monthStats = useMemo(() => {
    const currentMonthEvents = calendarDays
      .filter(day => day.isCurrentMonth)
      .flatMap(day => day.events)
    
    return {
      total: currentMonthEvents.length,
      completed: currentMonthEvents.filter(e => e.status === "completed").length,
      inProgress: currentMonthEvents.filter(e => e.status === "in_progress").length,
      pending: currentMonthEvents.filter(e => e.status === "pending").length,
      overdue: currentMonthEvents.filter(e => {
        if (!e.dueDate) return false
        try {
          const dueDate = parseISO(e.dueDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return isValid(dueDate) && dueDate < today && e.status !== "completed"
        } catch {
          return false
        }
      }).length
    }
  }, [calendarDays])

  const monthYear = format(currentDate, "MMMM yyyy")

  return (
    <div className="space-y-4">
      {/* Compact Calendar Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold">{monthYear}</h2>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={goToToday}
                className="text-sm h-8"
              >
                Today
              </Button>
            </div>

            {/* Compact Stats and Filters */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-6 text-sm border rounded-md px-3 py-1.5">
                <div className="flex items-center gap-1">
                  <span className="font-medium">{monthStats.total}</span>
                  <span className="text-muted-foreground">items</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-green-600">{monthStats.completed}</span>
                  <span className="text-muted-foreground">done</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-blue-600">{monthStats.inProgress}</span>
                  <span className="text-muted-foreground">active</span>
                </div>
                {monthStats.overdue > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-red-600">{monthStats.overdue}</span>
                    <span className="text-muted-foreground">overdue</span>
                  </div>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="h-6 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">Active</SelectItem>
                            <SelectItem value="completed">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Priority</label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Assignee</label>
                      <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {uniqueAssignees.map(assignee => (
                            <SelectItem key={assignee} value={assignee}>
                              {assignee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Show Completed</label>
                      <Button
                        variant={showCompleted ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="h-6 px-2 text-xs"
                      >
                        {showCompleted ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0 bg-muted/30"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const isCurrentDay = isToday(day.date)
                const hasEvents = day.events.length > 0
                const visibleEvents = day.events.slice(0, 3) // Show max 3 events
                const hiddenCount = Math.max(0, day.events.length - 3)
                
                // Group events by type for display
                const taskEvents = day.events.filter(e => e.type === 'task')
                const subtaskEvents = day.events.filter(e => e.type === 'subtask')

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b last:border-r-0",
                      !day.isCurrentMonth && "bg-muted/20 text-muted-foreground",
                      isCurrentDay && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="space-y-1">
                      {/* Date number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isCurrentDay && "flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs",
                            !day.isCurrentMonth && "text-muted-foreground"
                          )}
                        >
                          {format(day.date, "d")}
                        </span>
                        {hasEvents && (
                          <Badge variant="secondary" className="h-5 text-xs px-1.5">
                            {taskEvents.length > 0 && subtaskEvents.length > 0
                              ? `${taskEvents.length}t, ${subtaskEvents.length}s`
                              : day.events.length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Calendar events (tasks + subtasks) */}
                      <div className="space-y-1">
                        {visibleEvents.map((event, index) => (
                          <CalendarEvent
                            key={`${event.id}-${index}`}
                            event={event}
                            compact={true}
                            // Pass subtask functions for editing
                            updateSubtaskStatus={updateSubtaskStatus}
                            updateSubtaskAssignee={updateSubtaskAssignee}
                            updateSubtaskDueDate={updateSubtaskDueDate}
                            updateSubtaskName={updateSubtaskName}
                            updateSubtaskPriority={updateSubtaskPriority}
                            getSubtaskById={getSubtaskById}
                          />
                        ))}
                        
                        {hiddenCount > 0 && (
                          <div className="text-xs text-muted-foreground font-medium px-2 py-1">
                            +{hiddenCount} more...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}