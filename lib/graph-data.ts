// Data transformation utilities for converting hierarchical business process data to D3 graph format
import * as d3 from 'd3';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;              // Unique identifier
  name: string;            // Display name
  level: number;           // Hierarchy level (0 = root, 1 = category, 2 = subcategory, 3 = task, 4 = subtask)
  completion: number;      // Progress value (0.0 to 1.0)
  weight: number;          // Node importance/size factor
  isLeaf: boolean;         // Whether this is a leaf node
  originalNode?: any;      // Reference to source data
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;  // Source node ID or node
  target: string | GraphNode;  // Target node ID or node
  strength?: number;           // Link strength (optional)
}

export interface GraphData {
  nodes: GraphNode[];      // All graph nodes
  links: GraphLink[];      // All connections
}

// Business process data interfaces
interface Subtask {
  id: number;
  name: string;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
  tags?: string[];
}

interface Task {
  id: number;
  name: string;
  status: string; // Allow any status string from JSON
  priority: string; // Allow any priority string from JSON
  assignee: string | null;
  subtasks: Subtask[];
}

interface Subcategory {
  id: number;
  name: string;
  tasks: Task[];
}

interface Category {
  id: number;
  name: string;
  totalTasks: number;
  subcategories: Subcategory[];
}

interface BusinessProcessData {
  categories: Category[];
  summary: {
    totalTasks: number;
    totalCategories: number;
    totalSubcategories: number;
    statusCounts: {
      pending: number;
      in_progress: number;
      completed: number;
    };
    priorityCounts: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

// Calculate completion percentage for a set of subtasks
function calculateSubtaskCompletion(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  
  const completedSubtasks = subtasks.filter(subtask => subtask.status === "completed").length;
  const inProgressSubtasks = subtasks.filter(subtask => subtask.status === "in_progress").length;
  
  // Completed subtasks = 1.0, in progress = 0.5, pending = 0.0
  return (completedSubtasks + inProgressSubtasks * 0.5) / subtasks.length;
}

// Calculate completion percentage for a set of tasks (with subtask-aware logic)
function calculateTaskCompletion(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  let totalCompletion = 0;
  
  tasks.forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      // If task has subtasks, calculate completion from subtasks
      totalCompletion += calculateSubtaskCompletion(task.subtasks);
    } else {
      // If task has no subtasks, use task status
      const taskCompletion = task.status === "completed" ? 1.0 : 
                            task.status === "in_progress" ? 0.5 : 0.0;
      totalCompletion += taskCompletion;
    }
  });
  
  return totalCompletion / tasks.length;
}

// Simple weight calculation - fixed value per level
function calculateWeight(level: number = 1): number {
  // Fixed weights by level for consistent sizing
  switch (level) {
    case 0: return 16; // Root
    case 1: return 12; // Category
    case 2: return 8;  // Subcategory
    case 3: return 6;  // Task
    case 4: return 4;  // Subtask
    default: return 6;
  }
}

// Get all tasks from a category (flattened)
function getAllTasksFromCategory(category: Category): Task[] {
  return category.subcategories.reduce((allTasks, subcategory) => {
    return allTasks.concat(subcategory.tasks);
  }, [] as Task[]);
}

// Transform hierarchical data to graph format
export function convertToGraphData(data: BusinessProcessData): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  
  // Create root node representing the entire business process system
  const rootNode: GraphNode = {
    id: "root",
    name: "CodeAid Business Processes",
    level: 0,
    completion: data.summary.statusCounts.completed / data.summary.totalTasks,
    weight: calculateWeight(0),
    isLeaf: false,
    originalNode: data.summary,
  };
  nodes.push(rootNode);
  
  // Process each category
  data.categories.forEach(category => {
    const categoryTasks = getAllTasksFromCategory(category);
    const categoryCompletion = calculateTaskCompletion(categoryTasks);
    
    const categoryNode: GraphNode = {
      id: `category-${category.id}`,
      name: category.name,
      level: 1,
      completion: categoryCompletion,
      weight: calculateWeight(1),
      isLeaf: false,
      originalNode: category,
    };
    nodes.push(categoryNode);
    
    // Link root to category
    links.push({
      source: "root",
      target: categoryNode.id,
      strength: 1.0,
    });
    
    // Process each subcategory
    category.subcategories.forEach(subcategory => {
      const subcategoryCompletion = calculateTaskCompletion(subcategory.tasks);
      
      const subcategoryNode: GraphNode = {
        id: `subcategory-${subcategory.id}`,
        name: subcategory.name,
        level: 2,
        completion: subcategoryCompletion,
        weight: calculateWeight(2),
        isLeaf: subcategory.tasks.length === 0,
        originalNode: subcategory,
      };
      nodes.push(subcategoryNode);
      
      // Link category to subcategory
      links.push({
        source: categoryNode.id,
        target: subcategoryNode.id,
        strength: 1 / 2, // Weaker links for deeper levels
      });
      
      // Process each task
      subcategory.tasks.forEach(task => {
        let taskCompletion: number;
        
        if (task.subtasks && task.subtasks.length > 0) {
          // If task has subtasks, calculate completion from subtasks
          taskCompletion = calculateSubtaskCompletion(task.subtasks);
        } else {
          // If task has no subtasks, use task status
          taskCompletion = task.status.toLowerCase() === "completed" ? 1.0 : 
                          task.status.toLowerCase() === "in_progress" ? 0.5 : 0.0;
        }
        
        const taskNode: GraphNode = {
          id: `task-${task.id}`,
          name: task.name,
          level: 3,
          completion: taskCompletion,
          weight: calculateWeight(3),
          isLeaf: !task.subtasks || task.subtasks.length === 0,
          originalNode: task,
        };
        nodes.push(taskNode);
        
        // Link subcategory to task
        links.push({
          source: subcategoryNode.id,
          target: taskNode.id,
          strength: 1 / 3, // Weaker links for deeper levels
        });
        
        // Process each subtask
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            const subtaskCompletion = subtask.status.toLowerCase() === "completed" ? 1.0 : 
                                     subtask.status.toLowerCase() === "in_progress" ? 0.5 : 0.0;
            
            const subtaskNode: GraphNode = {
              id: `subtask-${subtask.id}`,
              name: subtask.name,
              level: 4,
              completion: subtaskCompletion,
              weight: calculateWeight(4),
              isLeaf: true,
              originalNode: subtask,
            };
            nodes.push(subtaskNode);
            
            // Link task to subtask
            links.push({
              source: taskNode.id,
              target: subtaskNode.id,
              strength: 1 / 4, // Weaker links for deeper levels
            });
          });
        }
      });
    });
  });
  
  return { nodes, links };
}

// Helper function to get completion color based on percentage
export function getCompletionColor(percentage: number): string {
  // Check if we're in dark mode by looking at the computed background color
  const isDarkMode = typeof window !== 'undefined' && 
    getComputedStyle(document.documentElement).getPropertyValue('--background').includes('4.9%');

  if (percentage === 0) {
    return isDarkMode ? '#f87171' : '#ef4444'; // Brighter red in dark mode
  }
  if (percentage === 1) {
    return isDarkMode ? '#4ade80' : '#10b981'; // Brighter green in dark mode
  }
  
  // HSL gradient from red (0°) to green (120°) through yellow
  const hue = percentage * 120;
  const lightness = isDarkMode ? 65 : 50; // Brighter in dark mode
  return `hsl(${hue}, 70%, ${lightness}%)`;
}

// Helper function to calculate node radius - fixed sizes by level
export function getNodeRadius(node: GraphNode): number {
  switch (node.level) {
    case 0: return 20; // Root
    case 1: return 16; // Category
    case 2: return 12; // Subcategory
    case 3: return 10; // Task
    case 4: return 8;  // Subtask
    default: return 10;
  }
}

// Helper function to calculate collision radius - fixed sizes by level
export function getCollisionRadius(node: GraphNode): number {
  switch (node.level) {
    case 0: return 25; // Root
    case 1: return 12; // Category - moderate for balanced clustering
    case 2: return 10; // Subcategory - moderate for balanced clustering  
    case 3: return 14; // Task
    case 4: return 12; // Subtask
    default: return 14;
  }
}