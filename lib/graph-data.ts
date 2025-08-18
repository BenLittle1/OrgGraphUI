// Data transformation utilities for converting hierarchical business process data to D3 graph format
import * as d3 from 'd3';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;              // Unique identifier
  name: string;            // Display name
  level: number;           // Hierarchy level (0 = root, 1 = category, 2 = subcategory, 3 = task)
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
interface Task {
  id: number;
  name: string;
  status: string; // Allow any status string from JSON
  priority: string; // Allow any priority string from JSON
  assignee: string | null;
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

// Calculate completion percentage for a set of tasks
function calculateTaskCompletion(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;
  
  // Completed tasks = 1.0, in progress = 0.5, pending = 0.0
  return (completedTasks + inProgressTasks * 0.5) / tasks.length;
}

// Calculate weight based on task count and priority distribution
function calculateWeight(
  taskCount: number, 
  tasks?: Task[], 
  level: number = 1
): number {
  const baseWeight = Math.max(1, taskCount);
  
  if (!tasks || tasks.length === 0) {
    return baseWeight;
  }
  
  // Priority multiplier: high = 1.5, medium = 1.2, low = 1.0
  const priorityMultiplier = tasks.reduce((sum, task) => {
    switch (task.priority.toLowerCase()) {
      case "high": return sum + 1.5;
      case "medium": return sum + 1.2;
      case "low": return sum + 1.0;
      default: return sum + 1.0;
    }
  }, 0) / tasks.length;
  
  // Level multiplier: higher level = more important
  const levelMultiplier = Math.max(1, 4 - level);
  
  return baseWeight * priorityMultiplier * levelMultiplier;
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
    weight: calculateWeight(data.summary.totalTasks, [], 0),
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
      weight: calculateWeight(category.totalTasks, categoryTasks, 1),
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
        weight: calculateWeight(subcategory.tasks.length, subcategory.tasks, 2),
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
        const taskCompletion = task.status.toLowerCase() === "completed" ? 1.0 : 
                              task.status.toLowerCase() === "in_progress" ? 0.5 : 0.0;
        
        const taskNode: GraphNode = {
          id: `task-${task.id}`,
          name: task.name,
          level: 3,
          completion: taskCompletion,
          weight: calculateWeight(1, [task], 3),
          isLeaf: true,
          originalNode: task,
        };
        nodes.push(taskNode);
        
        // Link subcategory to task
        links.push({
          source: subcategoryNode.id,
          target: taskNode.id,
          strength: 1 / 3, // Weaker links for deeper levels
        });
      });
    });
  });
  
  return { nodes, links };
}

// Helper function to get completion color based on percentage
export function getCompletionColor(percentage: number): string {
  if (percentage === 0) return '#ef4444'; // Red for 0%
  if (percentage === 1) return '#10b981'; // Green for 100%
  
  // HSL gradient from red (0°) to green (120°) through yellow
  const hue = percentage * 120;
  return `hsl(${hue}, 70%, 50%)`;
}

// Helper function to calculate node radius
export function getNodeRadius(node: GraphNode): number {
  return Math.max(12, Math.sqrt(node.weight) * 6);
}

// Helper function to calculate collision radius (slightly larger than visual)
export function getCollisionRadius(node: GraphNode): number {
  return Math.max(15, Math.sqrt(node.weight) * 6 + 4);
}