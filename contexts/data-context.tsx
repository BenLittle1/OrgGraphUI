"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import initialData from "@/data.json"

export interface Task {
  id: number
  name: string
  status: string
  priority: string
  assignee: string | null
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
  updateTaskStatus: (taskId: number, newStatus: string) => void
  updateTaskAssignee: (taskId: number, assignee: string | null) => void
  updateTaskPriority: (taskId: number, priority: string) => void
  getTaskById: (taskId: number) => Task | null
  getCategoryProgress: (categoryId: number) => number
  getHighPriorityTasks: (limit?: number) => Array<Task & { category: string; subcategory: string }>
  resetAllTasks: () => void
  markCategoryComplete: (categoryId: number) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ChecklistData>(initialData as ChecklistData)

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

  const value: DataContextType = useMemo(() => ({
    data,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    getTaskById,
    getCategoryProgress,
    getHighPriorityTasks,
    resetAllTasks,
    markCategoryComplete
  }), [
    data,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    getTaskById,
    getCategoryProgress,
    getHighPriorityTasks,
    resetAllTasks,
    markCategoryComplete
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