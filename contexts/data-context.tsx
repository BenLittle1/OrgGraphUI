"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import { parseISO, isValid, differenceInDays } from "date-fns"
import initialData from "@/data.json"
import { teamData as initialTeamData, taskAssignments, TeamMember, TeamData } from "@/data/team-data"

export interface Subtask {
  id: number
  name: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
  tags?: string[]
}

export interface Task {
  id: number
  name: string
  status: string
  priority: string
  assignee: string | null
  dueDate: string | null
  subtasks: Subtask[]
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

export interface NewTaskData {
  name: string
  priority: "high" | "medium" | "low"
  assignee?: string | null
  dueDate?: string | null
}

export interface NewSubtaskData {
  name: string
  priority: "high" | "medium" | "low"
  assignee?: string | null
  dueDate?: string | null
  tags?: string[]
}

export interface NewTeamMemberData {
  name: string
  role: string
  email: string
  department: string
  hireDate: string
  bio?: string
  avatarUrl?: string
}

interface DataContextType {
  data: ChecklistData
  teamData: TeamData
  updateTaskStatus: (taskId: number, newStatus: string) => void
  updateTaskAssignee: (taskId: number, assignee: string | null) => void
  updateTaskPriority: (taskId: number, priority: string) => void
  updateTaskDueDate: (taskId: number, dueDate: string | null) => void
  updateTaskName: (taskId: number, name: string) => void
  deleteTask: (taskId: number) => void
  getTaskById: (taskId: number) => Task | null
  getCategoryProgress: (categoryId: number) => number
  getHighPriorityTasks: (limit?: number) => Array<Task & { category: string; subcategory: string }>
  getUpcomingTasksByDueDate: (limit?: number) => Array<Task & { category: string; subcategory: string }>
  resetAllTasks: () => void
  markCategoryComplete: (categoryId: number) => void
  getTeamMemberById: (memberId: string) => TeamMember | null
  getTasksForMember: (memberId: string) => Array<Task & { category: string; subcategory: string }>
  getMemberProgress: (memberId: string) => { completed: number; inProgress: number; total: number; percentage: number; pending: number }
  assignTaskToMember: (taskId: number, memberId: string | null) => void
  getTeamMembers: () => TeamMember[]
  getActiveMemberCount: () => number
  getMembersByDepartment: (department: string) => TeamMember[]
  addTask: (subcategoryId: number, taskData: NewTaskData) => void
  getNextTaskId: () => number
  getAllSubcategories: () => Array<{id: number, name: string, categoryName: string}>
  addCategory: (name: string) => number
  addSubcategory: (categoryId: number, name: string) => number
  getNextCategoryId: () => number
  getNextSubcategoryId: () => number
  updateCategoryName: (categoryId: number, name: string) => void
  deleteCategory: (categoryId: number) => void
  updateSubcategoryName: (subcategoryId: number, name: string) => void
  deleteSubcategory: (subcategoryId: number) => void
  addTeamMember: (memberData: NewTeamMemberData) => string
  updateTeamMember: (memberId: string, memberData: Partial<NewTeamMemberData>) => void
  deleteTeamMember: (memberId: string) => void
  getNextTeamMemberId: () => string
  addDepartment: (departmentName: string) => void
  getCurrentUserTasks: (userName: string) => Array<Task & { category: string; subcategory: string }>
  // Subtask management functions
  addSubtask: (taskId: number, subtaskData: NewSubtaskData) => void
  updateSubtaskStatus: (subtaskId: number, newStatus: string) => void
  updateSubtaskAssignee: (subtaskId: number, assignee: string | null) => void
  updateSubtaskPriority: (subtaskId: number, priority: string) => void
  updateSubtaskDueDate: (subtaskId: number, dueDate: string | null) => void
  updateSubtaskName: (subtaskId: number, name: string) => void
  updateSubtaskTags: (subtaskId: number, tags: string[]) => void
  deleteSubtask: (subtaskId: number) => void
  getSubtaskById: (subtaskId: number) => Subtask | null
  getNextSubtaskId: () => number
  getTaskCompletion: (taskId: number) => number
  getSubtasksForMember: (memberId: string) => Array<Subtask & { taskName: string; category: string; subcategory: string }>
  getUpcomingSubtasksByDueDate: (limit?: number) => Array<Subtask & { taskName: string; category: string; subcategory: string }>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Initialize reactive team data
  const [teamData, setTeamData] = useState<TeamData>(initialTeamData)
  
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
            
            // Add some sample due dates for demonstration with new task IDs
            let sampleDueDate = null
            if (task.id === 1) sampleDueDate = "2025-08-25" // Business Plan Creation
            if (task.id === 3) sampleDueDate = "2025-08-22" // Regulatory Compliance  
            if (task.id === 26) sampleDueDate = "2025-08-28" // Term Sheet
            if (task.id === 42) sampleDueDate = "2025-08-30" // Board Setup
            if (task.id === 54) sampleDueDate = "2025-08-20" // Bank Account - Due today
            if (task.id === 79) sampleDueDate = "2025-08-18" // Frontend Tech - Overdue
            if (task.id === 90) sampleDueDate = "2025-09-05" // Market Analysis - Future
            if (task.id === 102) sampleDueDate = "2025-08-24" // Brand Name

            // Process subtasks to assign them as well
            const processedSubtasks = task.subtasks.map(subtask => {
              // Check if any team member is assigned to this subtask specifically
              const subtaskAssignedMember = Object.entries(taskAssignments).find(
                ([memberId, taskIds]) => taskIds.includes(subtask.id)
              )
              const subtaskMemberName = subtaskAssignedMember ? 
                teamData.members.find(m => m.id === subtaskAssignedMember[0])?.name || memberName : memberName
              
              return {
                ...subtask,
                assignee: subtaskMemberName
              }
            })

            return {
              ...task,
              assignee: memberName,
              dueDate: sampleDueDate,
              subtasks: processedSubtasks // Preserve and process existing subtasks
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
    const allSubtasks = allTasks.flatMap(task => task.subtasks)
    
    // Combine tasks and subtasks for total counts
    const allItems = [...allTasks, ...allSubtasks]
    
    return {
      totalTasks: allItems.length, // Count both tasks and subtasks
      totalCategories: categories.length,
      totalSubcategories: categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
      statusCounts: {
        pending: allItems.filter(item => item.status === "pending").length,
        in_progress: allItems.filter(item => item.status === "in_progress").length,
        completed: allItems.filter(item => item.status === "completed").length,
      },
      priorityCounts: {
        high: allItems.filter(item => item.priority === "high").length,
        medium: allItems.filter(item => item.priority === "medium").length,
        low: allItems.filter(item => item.priority === "low").length,
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

  const updateTaskName = useCallback((taskId: number, name: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task =>
            task.id === taskId ? { ...task, name: name.trim() } : task
          )
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const deleteTask = useCallback((taskId: number) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.filter(task => task.id !== taskId)
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

  const getTaskCompletion = useCallback((taskId: number): number => {
    const task = getTaskById(taskId)
    if (!task) return 0

    // If no subtasks, calculate based on task status
    if (task.subtasks.length === 0) {
      switch (task.status) {
        case "completed": return 1.0
        case "in_progress": return 0.5
        case "pending": return 0.0
        default: return 0.0
      }
    }

    // If has subtasks, calculate based on subtask completion (ignore task status)
    const totalSubtasks = task.subtasks.length
    const completedSubtasks = task.subtasks.filter(st => st.status === "completed").length
    const inProgressSubtasks = task.subtasks.filter(st => st.status === "in_progress").length
    
    // Calculate weighted progress: completed = 1.0, in_progress = 0.5, pending = 0.0
    const weightedProgress = completedSubtasks + (inProgressSubtasks * 0.5)
    return weightedProgress / totalSubtasks
  }, [getTaskById])

  const getCategoryProgress = useCallback((categoryId: number): number => {
    const category = data.categories.find(c => c.id === categoryId)
    if (!category) return 0
    
    const allTasks = category.subcategories.flatMap(sub => sub.tasks)
    if (allTasks.length === 0) return 0
    
    // Use task-level completion that factors in subtasks
    const totalCompletion = allTasks.reduce((sum, task) => {
      return sum + getTaskCompletion(task.id)
    }, 0)
    
    return Math.round((totalCompletion / allTasks.length) * 100)
  }, [data.categories, getTaskCompletion])

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

  const getUpcomingTasksByDueDate = useCallback((limit = 20) => {
    const tasksWithDueDates: Array<Task & { category: string; subcategory: string; sortKey: number }> = []
    
    // Collect all tasks that have due dates
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          if (task.dueDate) {
            try {
              const parsedDate = parseISO(task.dueDate)
              if (isValid(parsedDate)) {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const due = new Date(parsedDate)
                due.setHours(0, 0, 0, 0)
                
                const daysUntilDue = differenceInDays(due, today)
                
                // Create sort key: overdue (-1000 + days), due today (0), future (positive days)
                const sortKey = daysUntilDue < 0 ? -1000 + daysUntilDue : daysUntilDue
                
                tasksWithDueDates.push({
                  ...task,
                  category: category.name,
                  subcategory: subcategory.name,
                  sortKey
                })
              }
            } catch {
              // Skip tasks with invalid dates
            }
          }
        }
      }
    }
    
    // Sort by due date: overdue first, then by chronological order
    tasksWithDueDates.sort((a, b) => a.sortKey - b.sortKey)
    
    // Remove sortKey and limit results
    return tasksWithDueDates.slice(0, limit).map(({ sortKey, ...task }) => task)
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

  const getSubtasksForMember = useCallback((memberId: string): Array<Subtask & { taskName: string; category: string; subcategory: string }> => {
    const member = getTeamMemberById(memberId)
    if (!member) return []

    const memberSubtasks: Array<Subtask & { taskName: string; category: string; subcategory: string }> = []
    
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          for (const subtask of task.subtasks) {
            if (subtask.assignee === member.name) {
              memberSubtasks.push({
                ...subtask,
                taskName: task.name,
                category: category.name,
                subcategory: subcategory.name
              })
            }
          }
        }
      }
    }
    
    return memberSubtasks
  }, [data.categories, getTeamMemberById])

  const getUpcomingSubtasksByDueDate = useCallback((limit = 20) => {
    const subtasksWithDueDates: Array<Subtask & { taskName: string; category: string; subcategory: string; sortKey: number }> = []
    
    // Collect all subtasks that have due dates
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          for (const subtask of task.subtasks) {
            if (subtask.dueDate) {
              try {
                const parsedDate = parseISO(subtask.dueDate)
                if (isValid(parsedDate)) {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const due = new Date(parsedDate)
                  due.setHours(0, 0, 0, 0)
                  
                  const daysUntilDue = differenceInDays(due, today)
                  
                  // Create sort key: overdue (-1000 + days), due today (0), future (positive days)
                  const sortKey = daysUntilDue < 0 ? -1000 + daysUntilDue : daysUntilDue
                  
                  subtasksWithDueDates.push({
                    ...subtask,
                    taskName: task.name,
                    category: category.name,
                    subcategory: subcategory.name,
                    sortKey
                  })
                }
              } catch {
                // Skip invalid dates
              }
            }
          }
        }
      }
    }
    
    // Sort by due date (overdue first, then by proximity)
    return subtasksWithDueDates
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, limit)
      .map(({ sortKey, ...subtask }) => subtask)
  }, [data.categories])

  const getMemberProgress = useCallback((memberId: string) => {
    const memberTasks = getTasksForMember(memberId)
    const memberSubtasks = getSubtasksForMember(memberId)
    
    // Count completed/in-progress items (tasks + subtasks)
    const completedTasks = memberTasks.filter(task => task.status === "completed").length
    const inProgressTasks = memberTasks.filter(task => task.status === "in_progress").length
    const completedSubtasks = memberSubtasks.filter(subtask => subtask.status === "completed").length
    const inProgressSubtasks = memberSubtasks.filter(subtask => subtask.status === "in_progress").length
    
    const completed = completedTasks + completedSubtasks
    const inProgress = inProgressTasks + inProgressSubtasks
    const total = memberTasks.length + memberSubtasks.length
    
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
  }, [getTasksForMember, getSubtasksForMember])

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

  const getCurrentUserTasks = useCallback((userName: string): Array<Task & { category: string; subcategory: string }> => {
    const userTasks: Array<Task & { category: string; subcategory: string }> = []
    
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          if (task.assignee === userName) {
            userTasks.push({
              ...task,
              category: category.name,
              subcategory: subcategory.name
            })
          }
        }
      }
    }
    
    // Sort by due date: overdue first, then by proximity to due date, then no due date last
    return userTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      
      const dateA = parseISO(a.dueDate)
      const dateB = parseISO(b.dueDate)
      const now = new Date()
      
      if (!isValid(dateA) && !isValid(dateB)) return 0
      if (!isValid(dateA)) return 1
      if (!isValid(dateB)) return -1
      
      const daysA = differenceInDays(dateA, now)
      const daysB = differenceInDays(dateB, now)
      
      return daysA - daysB
    })
  }, [data.categories])

  const getNextTaskId = useCallback((): number => {
    let maxId = 0
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          if (task.id > maxId) {
            maxId = task.id
          }
        }
      }
    }
    return maxId + 1
  }, [data.categories])

  const getAllSubcategories = useCallback(() => {
    const allSubcategories: Array<{id: number, name: string, categoryName: string}> = []
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        allSubcategories.push({
          id: subcategory.id,
          name: subcategory.name,
          categoryName: category.name
        })
      }
    }
    return allSubcategories
  }, [data.categories])

  const addTask = useCallback((subcategoryId: number, taskData: NewTaskData) => {
    const newTaskId = getNextTaskId()
    const newTask: Task = {
      id: newTaskId,
      name: taskData.name,
      status: "pending",
      priority: taskData.priority,
      assignee: taskData.assignee || null,
      dueDate: taskData.dueDate || null,
      subtasks: []
    }

    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => {
          if (subcategory.id === subcategoryId) {
            return {
              ...subcategory,
              tasks: [...subcategory.tasks, newTask]
            }
          }
          return subcategory
        })
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [getNextTaskId, recalculateSummary])

  const getNextCategoryId = useCallback((): number => {
    let maxId = 0
    for (const category of data.categories) {
      if (category.id > maxId) {
        maxId = category.id
      }
    }
    return maxId + 1
  }, [data.categories])

  const getNextSubcategoryId = useCallback((): number => {
    let maxId = 0
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        if (subcategory.id > maxId) {
          maxId = subcategory.id
        }
      }
    }
    return maxId + 1
  }, [data.categories])

  const addCategory = useCallback((name: string): number => {
    const newCategoryId = getNextCategoryId()
    const newCategory: Category = {
      id: newCategoryId,
      name: name.trim(),
      totalTasks: 0,
      subcategories: []
    }

    setData(prev => {
      const newCategories = [...prev.categories, newCategory]
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })

    return newCategoryId
  }, [getNextCategoryId, recalculateSummary])

  const addSubcategory = useCallback((categoryId: number, name: string): number => {
    const newSubcategoryId = getNextSubcategoryId()
    const newSubcategory: Subcategory = {
      id: newSubcategoryId,
      name: name.trim(),
      tasks: []
    }

    setData(prev => {
      const newCategories = prev.categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            subcategories: [...category.subcategories, newSubcategory]
          }
        }
        return category
      })
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })

    return newSubcategoryId
  }, [getNextSubcategoryId, recalculateSummary])

  const updateCategoryName = useCallback((categoryId: number, name: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category =>
        category.id === categoryId ? { ...category, name: name.trim() } : category
      )
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const deleteCategory = useCallback((categoryId: number) => {
    setData(prev => {
      const newCategories = prev.categories.filter(category => category.id !== categoryId)
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateSubcategoryName = useCallback((subcategoryId: number, name: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory =>
          subcategory.id === subcategoryId ? { ...subcategory, name: name.trim() } : subcategory
        )
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const deleteSubcategory = useCallback((subcategoryId: number) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.filter(subcategory => subcategory.id !== subcategoryId)
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  // Team member management functions
  const getNextTeamMemberId = useCallback((): string => {
    const existingIds = teamData.members.map(member => member.id)
    let nextNumber = 1
    let newId = `tm-${String(nextNumber).padStart(3, '0')}`
    
    while (existingIds.includes(newId)) {
      nextNumber++
      newId = `tm-${String(nextNumber).padStart(3, '0')}`
    }
    
    return newId
  }, [teamData.members])

  const addTeamMember = useCallback((memberData: NewTeamMemberData): string => {
    const newMemberId = getNextTeamMemberId()
    const newMember: TeamMember = {
      id: newMemberId,
      name: memberData.name.trim(),
      role: memberData.role.trim(),
      email: memberData.email.trim(),
      department: memberData.department,
      hireDate: memberData.hireDate,
      isActive: true,
      bio: memberData.bio?.trim() || undefined,
      avatarUrl: memberData.avatarUrl || undefined
    }

    setTeamData(prev => {
      const newMembers = [...prev.members, newMember]
      const newDepartments = prev.departments.includes(memberData.department) 
        ? prev.departments 
        : [...prev.departments, memberData.department]
      
      return {
        members: newMembers,
        departments: newDepartments,
        totalMembers: newMembers.length,
        activeMembers: newMembers.filter(m => m.isActive).length
      }
    })

    return newMemberId
  }, [getNextTeamMemberId])

  const updateTeamMember = useCallback((memberId: string, memberData: Partial<NewTeamMemberData>) => {
    setTeamData(prev => {
      const newMembers = prev.members.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            ...(memberData.name && { name: memberData.name.trim() }),
            ...(memberData.role && { role: memberData.role.trim() }),
            ...(memberData.email && { email: memberData.email.trim() }),
            ...(memberData.department && { department: memberData.department }),
            ...(memberData.hireDate && { hireDate: memberData.hireDate }),
            ...(memberData.bio !== undefined && { bio: memberData.bio?.trim() || undefined }),
            ...(memberData.avatarUrl !== undefined && { avatarUrl: memberData.avatarUrl || undefined })
          }
        }
        return member
      })
      
      // Update departments list if a new department was added
      const allDepartments = new Set([...prev.departments, ...newMembers.map(m => m.department)])
      
      return {
        members: newMembers,
        departments: Array.from(allDepartments),
        totalMembers: newMembers.length,
        activeMembers: newMembers.filter(m => m.isActive).length
      }
    })
  }, [])

  const deleteTeamMember = useCallback((memberId: string) => {
    setTeamData(prev => {
      const newMembers = prev.members.map(member => 
        member.id === memberId ? { ...member, isActive: false } : member
      )
      
      return {
        ...prev,
        members: newMembers,
        activeMembers: newMembers.filter(m => m.isActive).length
      }
    })

    // Also unassign all tasks from this member
    const memberToDelete = teamData.members.find(m => m.id === memberId)
    if (memberToDelete) {
      setData(prev => {
        const newCategories = prev.categories.map(category => ({
          ...category,
          subcategories: category.subcategories.map(subcategory => ({
            ...subcategory,
            tasks: subcategory.tasks.map(task => 
              task.assignee === memberToDelete.name ? { ...task, assignee: null } : task
            )
          }))
        }))
        
        return {
          categories: newCategories,
          summary: recalculateSummary(newCategories)
        }
      })
    }
  }, [teamData.members, recalculateSummary])

  const addDepartment = useCallback((departmentName: string) => {
    setTeamData(prev => {
      if (!prev.departments.includes(departmentName)) {
        return {
          ...prev,
          departments: [...prev.departments, departmentName]
        }
      }
      return prev
    })
  }, [])

  // Subtask management functions
  const getNextSubtaskId = useCallback((): number => {
    let maxId = 0
    // Find the highest subtask ID across all tasks and subtasks
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          for (const subtask of task.subtasks) {
            if (subtask.id > maxId) {
              maxId = subtask.id
            }
          }
        }
      }
    }
    return maxId + 1
  }, [data.categories])

  const getSubtaskById = useCallback((subtaskId: number): Subtask | null => {
    // Search through all tasks and their subtasks
    for (const category of data.categories) {
      for (const subcategory of category.subcategories) {
        for (const task of subcategory.tasks) {
          const subtask = task.subtasks.find(st => st.id === subtaskId)
          if (subtask) return subtask
        }
      }
    }
    return null
  }, [data.categories])

  const addSubtask = useCallback((taskId: number, subtaskData: NewSubtaskData) => {
    const newSubtaskId = getNextSubtaskId()
    const newSubtask: Subtask = {
      id: newSubtaskId,
      name: subtaskData.name,
      status: "pending",
      priority: subtaskData.priority,
      assignee: subtaskData.assignee || null,
      dueDate: subtaskData.dueDate || null,
      tags: subtaskData.tags || []
    }

    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: [...task.subtasks, newSubtask]
              }
            }
            return task
          })
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [getNextSubtaskId, recalculateSummary])

  const updateSubtaskStatus = useCallback((subtaskId: number, newStatus: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => {
            // Update the subtask status
            const updatedSubtasks = task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
            )
            
            // Only update parent task status if this task has subtasks and the updated subtask belongs to this task
            if (task.subtasks.length > 0 && task.subtasks.some(st => st.id === subtaskId)) {
              // Calculate new parent task status based on subtask completion
              const completedSubtasks = updatedSubtasks.filter(st => st.status === "completed").length
              const inProgressSubtasks = updatedSubtasks.filter(st => st.status === "in_progress").length
              const totalSubtasks = updatedSubtasks.length
              
              let parentTaskStatus = task.status
              if (completedSubtasks === totalSubtasks) {
                // All subtasks completed
                parentTaskStatus = "completed"
              } else if (completedSubtasks > 0 || inProgressSubtasks > 0) {
                // Some progress made
                parentTaskStatus = "in_progress"
              } else {
                // All subtasks pending
                parentTaskStatus = "pending"
              }
              
              return {
                ...task,
                status: parentTaskStatus,
                subtasks: updatedSubtasks
              }
            }
            
            return {
              ...task,
              subtasks: updatedSubtasks
            }
          })
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateSubtaskAssignee = useCallback((subtaskId: number, assignee: string | null) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => ({
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, assignee } : subtask
            )
          }))
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateSubtaskPriority = useCallback((subtaskId: number, priority: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => ({
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, priority } : subtask
            )
          }))
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateSubtaskDueDate = useCallback((subtaskId: number, dueDate: string | null) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => ({
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, dueDate } : subtask
            )
          }))
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateSubtaskName = useCallback((subtaskId: number, name: string) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => ({
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, name: name.trim() } : subtask
            )
          }))
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const updateSubtaskTags = useCallback((subtaskId: number, tags: string[]) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => ({
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, tags } : subtask
            )
          }))
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])

  const deleteSubtask = useCallback((subtaskId: number) => {
    setData(prev => {
      const newCategories = prev.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          tasks: subcategory.tasks.map(task => {
            // Remove the subtask
            const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId)
            
            // Only update parent task status if this task had the deleted subtask
            if (task.subtasks.some(st => st.id === subtaskId)) {
              // If no subtasks remain, keep current task status
              if (updatedSubtasks.length === 0) {
                return {
                  ...task,
                  subtasks: updatedSubtasks
                }
              }
              
              // Calculate new parent task status based on remaining subtask completion
              const completedSubtasks = updatedSubtasks.filter(st => st.status === "completed").length
              const inProgressSubtasks = updatedSubtasks.filter(st => st.status === "in_progress").length
              const totalSubtasks = updatedSubtasks.length
              
              let parentTaskStatus = task.status
              if (completedSubtasks === totalSubtasks) {
                // All remaining subtasks completed
                parentTaskStatus = "completed"
              } else if (completedSubtasks > 0 || inProgressSubtasks > 0) {
                // Some progress made
                parentTaskStatus = "in_progress"
              } else {
                // All remaining subtasks pending
                parentTaskStatus = "pending"
              }
              
              return {
                ...task,
                status: parentTaskStatus,
                subtasks: updatedSubtasks
              }
            }
            
            return {
              ...task,
              subtasks: updatedSubtasks
            }
          })
        }))
      }))
      
      return {
        categories: newCategories,
        summary: recalculateSummary(newCategories)
      }
    })
  }, [recalculateSummary])



  const value: DataContextType = useMemo(() => ({
    data,
    teamData,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    updateTaskDueDate,
    updateTaskName,
    deleteTask,
    getTaskById,
    getCategoryProgress,
    getHighPriorityTasks,
    getUpcomingTasksByDueDate,
    resetAllTasks,
    markCategoryComplete,
    getTeamMemberById,
    getTasksForMember,
    getMemberProgress,
    assignTaskToMember,
    getTeamMembers,
    getActiveMemberCount,
    getMembersByDepartment,
    addTask,
    getNextTaskId,
    getAllSubcategories,
    addCategory,
    addSubcategory,
    getNextCategoryId,
    getNextSubcategoryId,
    updateCategoryName,
    deleteCategory,
    updateSubcategoryName,
    deleteSubcategory,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getNextTeamMemberId,
    addDepartment,
    getCurrentUserTasks,
      // Subtask functions
    addSubtask,
    updateSubtaskStatus,
    updateSubtaskAssignee,
    updateSubtaskPriority,
    updateSubtaskDueDate,
    updateSubtaskName,
    updateSubtaskTags,
    deleteSubtask,
    getSubtaskById,
    getNextSubtaskId,
    getTaskCompletion,
    getSubtasksForMember,
    getUpcomingSubtasksByDueDate
  }), [
    data,
    teamData,
    updateTaskStatus,
    updateTaskAssignee,
    updateTaskPriority,
    updateTaskDueDate,
    updateTaskName,
    deleteTask,
    getTaskById,
    getCategoryProgress,
    getHighPriorityTasks,
    getUpcomingTasksByDueDate,
    resetAllTasks,
    markCategoryComplete,
    getTeamMemberById,
    getTasksForMember,
    getMemberProgress,
    assignTaskToMember,
    getTeamMembers,
    getActiveMemberCount,
    getMembersByDepartment,
    addTask,
    getNextTaskId,
    getAllSubcategories,
    addCategory,
    addSubcategory,
    getNextCategoryId,
    getNextSubcategoryId,
    updateCategoryName,
    deleteCategory,
    updateSubcategoryName,
    deleteSubcategory,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getNextTeamMemberId,
    addDepartment,
    getCurrentUserTasks,
    // Subtask functions
    addSubtask,
    updateSubtaskStatus,
    updateSubtaskAssignee,
    updateSubtaskPriority,
    updateSubtaskDueDate,
    updateSubtaskName,
    updateSubtaskTags,
    deleteSubtask,
    getSubtaskById,
    getNextSubtaskId,
    getTaskCompletion,
    getSubtasksForMember,
    getUpcomingSubtasksByDueDate
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