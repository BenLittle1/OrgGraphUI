"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import initialData from "@/data.json"
import { teamData, taskAssignments, TeamMember, TeamData } from "@/data/team-data"

export interface Task {
  id: number
  name: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
}

export interface Subcategory {
  id: number
  name: string
  tasks: Task[]
}

export interface Category {
  id: number
  name: string
  totalTasks: number
  subcategories: Subcategory[]
}

export interface ChecklistData {
  categories: Category[]
  summary: {
    totalTasks: number
    totalCategories: number
    totalSubcategories: number
    statusCounts: {
      pending: number
      in_progress: number
      completed: number
    }
    priorityCounts: {
      high: number
      medium: number
      low: number
    }
  }
}

interface DataContextType {
  data: ChecklistData
  teamData: TeamData
  updateTaskStatus: (taskId: number, newStatus: string) => void
  updateTaskAssignee: (taskId: number, assignee: string | null) => void
  updateTaskPriority: (taskId: number, priority: string) => void
  updateTaskDueDate: (taskId: number, dueDate: string | null) => void
  getTaskById: (taskId: number) => Task | null
  getCategoryProgress: (categoryId: number) => number
  getHighPriorityTasks: (limit?: number) => Array<Task & { category: string; subcategory: string }>
  resetAllTasks: () => void
  markCategoryComplete: (categoryId: number) => void
  getTeamMemberById: (memberId: string) => TeamMember | null
  getTasksForMember: (memberId: string) => Array<Task & { category: string; subcategory: string }>
  getMemberProgress: (memberId: string) => { completed: number; inProgress: number; total: number; percentage: number; pending: number }
  assignTaskToMember: (taskId: number, memberId: string | null) => void
  getTeamMembers: () => TeamMember[]
  getActiveMemberCount: () => number
  getMembersByDepartment: (department: string) => TeamMember[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Initialize data with task assignments from team data
  const initializeDataWithAssignments = (): ChecklistData => {
    const baseData = initialData as ChecklistData
    const dataWithAssignments = {
      ...baseData,
      categories: baseData.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => {
            // Find which team member this task is assigned to
            const assignedMember = Object.entries(taskAssignments).find(
              ([memberId, taskIds]) => taskIds.includes(task.id)
            )
            const memberName = assignedMember ? 
              teamData.members.find(m => m.id === assignedMember[0])?.name || null : null
            
            return {
              ...task,
              assignee: memberName,
              dueDate: null
            }
          })
        }))
      }))
    }
    return dataWithAssignments
  }
  
  const [data, setData] = useState<ChecklistData>(initializeDataWithAssignments())

  // Calculate summary statistics
  const recalculateSummary = useCallback((categories: Category[]): ChecklistData['summary'] => {
    const allTasks = categories.flatMap(cat => 
      cat.subcategories.flatMap(sub => sub.tasks)
    )
    
    return {
      totalTasks: allTasks.length,
      totalCategories: categories.length,
      totalSubcategories: categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
      statusCounts: {
        pending: allTasks.filter(t => t.status === "pending").length,
        in_progress: allTasks.filter(t => t.status === "in_progress").length,
        completed: allTasks.filter(t => t.status === "completed").length,
      },
      priorityCounts: {
        high: allTasks.filter(t => t.priority === "high").length,
        medium: allTasks.filter(t => t.priority === "medium").length,
        low: allTasks.filter(t => t.priority === "low").length,
      }
    }
  }, [])

  const updateTaskStatus = useCallback((taskId: number, newStatus: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateTaskAssignee = useCallback((taskId: number, assignee: string | null) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task =>
            task.id === taskId ? { ...task, assignee } : task
          )
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateTaskPriority = useCallback((taskId: number, priority: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task =>
            task.id === taskId ? { ...task, priority } : task
          )
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateTaskDueDate = useCallback((taskId: number, dueDate: string | null) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task =>
            task.id === taskId ? { ...task, dueDate } : task
          )
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const getTaskById = useCallback((taskId: number): Task | null => {
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        const task = subcategory.tasks.find(t => t.id === taskId)
        if (task) return task
      }
    }
    return null
  }, [data.categories])

  const getCategoryProgress = useCallback((categoryId: number): number => {
    const category = data.categories.find(c => c.id === categoryId)
    if (!category) return 0
    
    const allTasks = category.subcategories.flatMap(sub => sub.tasks)
    const completedTasks = allTasks.filter(task => task.status === "completed")
    
    return allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0
  }, [data.categories])

  const getHighPriorityTasks = useCallback((limit = 20) => {
    const highPriorityTasks: Array<Task & { category: string; subcategory: string }> = []
    
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          if (task.priority === 'high' && highPriorityTasks.length < limit) {
            highPriorityTasks.push({
              ...task,
              category: category.name,
              subcategory: subcategory.name
            })
          }
        }
      }
    }
    
    return highPriorityTasks
  }, [data.categories])

  const resetAllTasks = useCallback(() => {
    setData(initialData as ChecklistData)
  }, [])

  const markCategoryComplete = useCallback((categoryId: number) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            subcategories: category.subcategories.map(subcategory => ({
              ...subcategory,
              tasks: subcategory.tasks.map(task => ({
                ...task,
                status: "completed"
              }))
            }))
          }
        }
        return category
      })
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  // Team member management functions
  const getTeamMemberById = useCallback((memberId: string): TeamMember | null => {
    return teamData.members.find(member => member.id === memberId) || null
  }, [])

  const getTasksForMember = useCallback((memberId: string) => {
    const member = getTeamMemberById(memberId)
    if (!member) return []

    const memberTasks: Array<Task & { category: string; subcategory: string }> = []
    
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          if (task.assignee === member.name) {
            memberTasks.push({
              ...task,
              category: category.name,
              subcategory: subcategory.name
            })
          }
        }
      }
    }
    
    return memberTasks
  }, [data.categories, getTeamMemberById])

  const getMemberProgress = useCallback((memberId: string) => {
    const memberTasks = getTasksForMember(memberId)
    const completed = memberTasks.filter(task => task.status === "completed").length
    const inProgress = memberTasks.filter(task => task.status === "in_progress").length
    const total = memberTasks.length
    
    // Calculate weighted progress: completed = 1.0, in_progress = 0.5, pending = 0.0
    const weightedProgress = completed + (inProgress * 0.5)
    const percentage = total > 0 ? Math.round((weightedProgress / total) * 100) : 0
    
    return { 
      completed, 
      inProgress,
      total, 
      percentage,
      pending: total - completed - inProgress
    }
  }, [getTasksForMember])

  const assignTaskToMember = useCallback((taskId: number, memberId: string | null) => {
    const memberName = memberId ? getTeamMemberById(memberId)?.name || null : null
    updateTaskAssignee(taskId, memberName)
  }, [getTeamMemberById, updateTaskAssignee])

  const getTeamMembers = useCallback((): TeamMember[] => {
    return teamData.members
  }, [])

  const getActiveMemberCount = useCallback((): number => {
    return teamData.members.filter(member => member.isActive).length
  }, [])

  const getMembersByDepartment = useCallback((department: string): TeamMember[] => {
    return teamData.members.filter(member => member.department === department)
  }, [])

  const value: DataContextType = useMemo(() => ({
    data,
    teamData,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    updateTaskDueDate,
    getTaskById,
    getCategoryProgress,
    getHighPriorityTasks,
    resetAllTasks,
    markCategoryComplete,
    getTeamMemberById,
    getTasksForMember,
    getMemberProgress,
    assignTaskToMember,
    getTeamMembers,
    getActiveMemberCount,
    getMembersByDepartment
  }), [
    data,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    updateTaskDueDate,
    getTaskById,
    getCategoryProgress,
    getHighPriorityTasks,
    resetAllTasks,
    markCategoryComplete,
    getTeamMemberById,
    getTasksForMember,
    getMemberProgress,
    assignTaskToMember,
    getTeamMembers,
    getActiveMemberCount,
    getMembersByDepartment
  ])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}