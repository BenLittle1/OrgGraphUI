"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import { parseISO, isValid, differenceInDays } from "date-fns"
import initialData from "@/data.json"
import { teamData as initialTeamData, taskAssignments, TeamMember, TeamData } from "@/data/team-data"

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

export interface NewTaskData {
  name: string
  priority: "high" | "medium" | "low"
  assignee?: string | null
  dueDate?: string | null
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
            
            // Add some sample due dates for demonstration
            let sampleDueDate = null
            if (task.id === 1) sampleDueDate = "2025-08-25" // Business Plan Creation
            if (task.id === 3) sampleDueDate = "2025-08-22" // Name Registration  
            if (task.id === 15) sampleDueDate = "2025-08-28" // Product Design
            if (task.id === 22) sampleDueDate = "2025-08-30" // Technical Architecture
            if (task.id === 35) sampleDueDate = "2025-08-20" // Due today
            if (task.id === 42) sampleDueDate = "2025-08-18" // Overdue
            if (task.id === 50) sampleDueDate = "2025-09-05" // Future task
            if (task.id === 8) sampleDueDate = "2025-08-24" // Another task

            return {
              ...task,
              assignee: memberName,
              dueDate: sampleDueDate
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
      dueDate: taskData.dueDate || null
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
    getCurrentUserTasks
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
    getCurrentUserTasks
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