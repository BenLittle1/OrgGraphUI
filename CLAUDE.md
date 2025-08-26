# CLAUDE.md

## Project Overview

WarpDrive is a business process checklist dashboard built with Next.js 14, TypeScript, and shadcn/ui. Displays 113+ business processes and subtasks across 7 categories with real-time statistics, interactive visualizations, and collaborative task management.

**Core Features:**
- **Organizations**: Multi-organization management page with card layout, filtering, and organization creation (primary entry point)
- **Overview**: Summary cards, progress charts, high-priority task/subtask table, upcoming items
- **Checklist**: Filterable task/subtask management with nested displays, status updates, assignment, due dates, item creation
- **My Tasks**: Personal view with mixed task/subtask items, due date prioritization, smart grouping (overdue, today, this week, future)
- **Graph**: D3.js force-directed visualization with 5-level hierarchy (Root→Category→Subcategory→Task→Subtask)
- **Team**: Full CRUD team management, progress tracking with subtask support, horizontal three-dot menus
- **Calendar**: Monthly view with task/subtask events, advanced filtering, item editing
- **Authentication**: Placeholder signin/signup/forgot-password pages for future user management
- **Subtasks**: Granular task breakdown with full CRUD, due dates, assignments, tags, progress tracking
- **5-Level Hierarchy**: Root → Category → Subcategory → Task → **Subtask** with visual hierarchy
- **Mixed Displays**: Tasks and subtasks appear together in My Tasks and Calendar views with parent-child context
- **Unified State**: Cross-view reactivity with instant synchronization across all 6 views including subtasks
- **Theme Support**: Persistent light/dark mode

## Technology Stack

**Core:** Next.js 14.0.0 (App Router), React 18.2.0, TypeScript 5.2.2
**UI:** shadcn/ui (Radix primitives), Tailwind CSS 3.3.5, Lucide React 0.294.0, next-themes 0.4.6, cmdk 1.1.1
**Visualization:** D3.js 7.9.0, custom multi-force physics engine
**Date/Time:** react-day-picker 9.x, date-fns, ISO 8601 format
**Dev Tools:** ESLint, PostCSS + Autoprefixer, Class Variance Authority

## Project Structure

```
├── app/                          # Next.js 14 app directory
│   ├── organizations/page.tsx   # Organization management (primary entry point)
│   ├── calendar/page.tsx        # Calendar view
│   ├── checklist/page.tsx       # Checklist view
│   ├── my-tasks/page.tsx        # Personal task view
│   ├── graph/page.tsx           # Graph visualization
│   ├── team/page.tsx            # Team management
│   ├── signin/page.tsx          # User authentication signin page
│   ├── signup/page.tsx          # User registration page
│   ├── forgot-password/page.tsx # Password reset page
│   ├── globals.css              # CSS variables, theme tokens
│   ├── layout.tsx               # Root layout with DataProvider
│   └── page.tsx                 # Root redirect to organizations
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── task-item.tsx            # Individual task component with subtask support
│   ├── subtask-item.tsx         # Individual subtask management with compact design
│   ├── subtask-list.tsx         # Expandable subtask lists with animations
│   ├── assignee-select.tsx      # Task/subtask assignment dropdown
│   ├── date-picker.tsx          # Due date picker with indicators
│   ├── add-task-dialog.tsx      # Task creation with validation
│   ├── add-subtask-dialog.tsx   # Subtask creation with parent context
│   ├── organization-card.tsx    # Individual organization card component
│   ├── add-organization-dialog.tsx # Organization creation dialog
│   ├── graph-visualization.tsx  # D3.js force-directed graph (5-level hierarchy)
│   └── [other components...]
├── contexts/data-context.tsx    # Unified reactive state management
├── data/team-data.ts           # Team member data
├── data/organization-data.ts   # Organization data and interfaces
├── lib/[graph-data.ts, utils.ts] # Utilities
└── data.json                   # Business process data
```

## Development Commands

- `npm run dev` - Development server (localhost:3000)
- `npm run build` - Production build with optimizations
- `npm run start` - Production server
- `npm run lint` - ESLint code quality checks

## Data Architecture

**Unified State Management:** All views share single reactive data source via `DataContext` (`contexts/data-context.tsx`). DataProvider wraps app in `layout.tsx`, all views use `useData()` hook. Cross-view reactivity ensures task changes instantly update all views (statistics, UI, graph colors, progress, calendar events).

**Data Sources:**
- **Organization Data** (`data/organization-data.ts`): Sample organizations with card-based management, filtering, search, and creation capabilities. Industries include Technology, Healthcare, Finance, etc.
- **Business Process Data** (`data.json`): 7 categories, 20+ subcategories, 94+ tasks with 19+ subtasks (113+ total items) with status/priority/assignee/tags. Dynamic task/subtask creation with auto ID generation.
- **Team Data** (`data/team-data.ts`): 3 members - Majeed Kazemi (CEO), Ali Shabani (Senior Engineer), Jack Fan (Engineer). Executive/Engineering departments. Progress calculations include subtask completion.

**TypeScript Interfaces:**

```typescript
interface Subtask {
  id: number; name: string; status: "pending" | "in_progress" | "completed"
  priority: "high" | "medium" | "low"; assignee: string | null
  dueDate: string | null; tags?: string[]  // ISO 8601 format (YYYY-MM-DD)
}
interface Task {
  id: number; name: string; status: "pending" | "in_progress" | "completed"
  priority: "high" | "medium" | "low"; assignee: string | null
  dueDate: string | null; subtasks: Subtask[]  // ISO 8601 format (YYYY-MM-DD)
}
interface Subcategory { id: number; name: string; tasks: Task[] }
interface Category { id: number; name: string; totalTasks: number; subcategories: Subcategory[] }
interface ChecklistData {
  categories: Category[]
  summary: { totalTasks: number; totalCategories: number; totalSubcategories: number; totalItems: number
    statusCounts: { pending: number; in_progress: number; completed: number }
    priorityCounts: { high: number; medium: number; low: number }
    itemCounts: { tasks: number; subtasks: number } }
}
interface Organization {
  id: string; name: string; description: string; industry: string
  plan: "Free" | "Pro" | "Enterprise"; memberCount: number; createdAt: string
  location: string; website: string; logoUrl: string | null; isActive: boolean
}
interface TeamMember {
  id: string; name: string; email: string; role: string; department: string
  hireDate: string; avatarUrl: string | null; isActive: boolean; bio?: string
}
interface GraphNode extends d3.SimulationNodeDatum {
  id: string; name: string; level: number // 0=root, 1=category, 2=subcategory, 3=task, 4=subtask
  completion: number // 0.0 to 1.0; weight: number; isLeaf: boolean; originalNode?: any
}
```

## Key Components

- `TaskItem` - Individual task component with subtask support, status management, due dates
- `SubtaskItem` - Individual subtask management with compact design  
- `SubtaskList` - Expandable subtask lists with animations, auto-display
- `AssigneeSelect` - Team member assignment dropdown with avatars
- `DatePicker` - Due date picker with visual indicators (overdue, due today, etc.)
- `AddTaskDialog` / `AddSubtaskDialog` - Task/subtask creation with dynamic category creation
- `CategoryCombobox` / `SubcategoryCombobox` - Dynamic creation using Command component
- `OrganizationCard` - Individual organization display with actions and status
- `AddOrganizationDialog` - Organization creation dialog with form validation
- `GraphVisualization` - D3.js force-directed graph with 5-level hierarchy
- `CalendarView` - Monthly calendar grid with task/subtask events
- `DataTable` - High-priority task/subtask table with sorting/filtering
- `SectionCards` - Live statistics including subtask counts

## Critical Fixes & Solutions

**Dynamic Category/Subcategory Creation Fix:**
- **Issue:** "Create new..." options not appearing when typing non-matching names in comboboxes
- **Root Cause:** shadcn Command component's automatic filtering (`shouldFilter={true}` default) filtered out "Create new..." options
- **Solution:** Set `shouldFilter={false}` on Command components in `CategoryCombobox`/`SubcategoryCombobox`
- **Result:** Users can create new categories/subcategories by typing in task creation dialog

**Subtask Auto-Expansion (2025):**
- Subtasks automatically display when category is opened (`isSubtasksExpanded = task.subtasks.length > 0`)
- Removed manual expand/collapse buttons for cleaner UI
- Parent task status syncs automatically with subtask completion in `updateSubtaskStatus()`

**Layout Fixes (2025):**
- Fixed subtask container overlap issues with proper CSS containment in `TaskItem`
- Improved button height consistency (DatePicker vs AssigneeSelect) with `!h-7` and `leading-none`
- Subtasks now contained within parent task borders

## Component Architecture

**Layout Components:**
- `AppSidebar` - Navigation with active states, responsive collapse
- `SiteHeader` - Top navigation, theme toggle
- `DataProvider` - Wraps app in `layout.tsx`, provides unified state

**Data Display Components:**
- `SectionCards` - Live statistics with subtask counts
- `ChartAreaInteractive` - Progress charts with subtask support
- `TeamMemberCard` - Progress visualization including subtasks
- `TeamMemberDetail` - Modal with task/subtask breakdown/editing
- `CalendarEvent` - Task/subtask rendering with visual distinction, edit modes

**Form & Input Components:**
- `CategoryCombobox` / `SubcategoryCombobox` - Dynamic creation using Command component (`shouldFilter={false}`)
- `AssigneeSelect` - Avatar-based team member selection
- `DatePicker` - Calendar dropdown with visual indicators

**Architecture Patterns:**
- **Context Provider:** Centralized state via DataProvider, custom `useData()` hook
- **Memoized Context:** Prevents cascade re-renders with `useMemo`
- **Cross-view Reactivity:** Task changes instantly update all 6 views
- **Component Composition:** shadcn/ui patterns with compound components

## View-Specific Systems

**Organizations View:**
- Card-based layout with responsive grid (1-4 columns based on screen size)
- Statistics cards showing total organizations, members, enterprise plans, and industries
- Search functionality with real-time filtering
- Industry and plan-based filtering with filter indicators
- "Add New Organization" dialog with comprehensive form validation
- Empty state handling with appropriate messaging
- Action dropdown menus for each organization card

**Calendar View:**
- 7-column monthly grid using date-fns
- Up to 3 visible task/subtask items/day with "+X more" overflow
- Responsive (80px mobile, 120px desktop)
- Priority color-coded cards with status dots
- Real-time metrics including tasks and subtasks

**My Tasks View:**
- User-centric interface with due date prioritization (overdue first)
- Smart grouping: Overdue, Due Today, This Week, Future, No Due Date
- Mixed task/subtask line items with parent-child context
- Ready for user authentication with `getCurrentUserTasks(userName)`

**Team View:**
- Full CRUD team management with validation
- Dynamic assignment to tasks and subtasks
- Progress calculation: completed=1.0, in_progress=0.5, pending=0.0
- Interactive cards with three-dot menus

## Performance Optimizations

**React Performance (Critical 2025 Fixes):**
- DataContext memoization prevents cascade re-renders
- `useMemo` for `convertToGraphData` and expensive calculations
- `useCallback` for event handlers to prevent unnecessary re-renders
- Refs eliminate D3 closure dependencies

**Graph Performance:**
- Separated D3 creation from selection - `selectedNode` removed from `createVisualization` dependencies
- Created separate `updateSelection()` function for visual-only updates
- Incremental DOM updates instead of full graph recreation
- ~90% reduction in graph recreations

**General Performance:**
- Memoized calculations in Calendar and My Tasks views
- React.memo for expensive components
- Next.js code splitting and Image optimization

## Import Paths

**Path Mapping:** `@/*` configured in tsconfig.json
Examples: `import { Button } from "@/components/ui/button"`

## Graph Visualization System

**D3.js Force Layout:** Multi-force physics simulation with 5-level hierarchy:
- **Root (0)** → **Category (1)** → **Subcategory (2)** → **Task (3)** → **Subtask (4)**

**Key Configuration:**
- Distance: Category→Subcategory: 10, Subcategory→Task: 40, Task→Subtask: 25
- Categories positioned in radial pattern around center (400px radius)
- Fixed node sizes by level (no weight-based sizing)
- Reduced collision radii for tight clustering (Category: 8px, Subcategory: 6px)
- Node colors update with task/subtask status changes
- ~141 total nodes with subtasks

**Performance:** Memoized `convertToGraphData`, separated D3 creation from selection updates, incremental DOM updates

**Known Issue:** Fullscreen node interaction broken - hover works, click events fail. Normal mode works perfectly.

## Key useData() Hook Functions

**Task/Subtask Management:**
- `updateTaskStatus` / `updateSubtaskStatus` - Status updates (auto-syncs parent/child)
- `addTask` / `addSubtask` - Create new items with auto ID generation
- `deleteTask` / `deleteSubtask` - Remove items with parent status recalculation
- `updateTaskDueDate` / `updateSubtaskDueDate` - Due date management (ISO 8601)
- `updateSubtaskTags` - Tag management for subtasks
- `assignTaskToMember` - Team member assignment

**Structure Management:**
- `addCategory` / `addSubcategory` - Dynamic structure expansion
- `getNextTaskId` / `getNextSubtaskId` / `getNextCategoryId` / `getNextSubcategoryId` - Auto ID generation
- `getAllSubcategories()` - Get all subcategories for dropdown
- `getTaskById` / `getSubtaskById` - Retrieve specific items

**Analytics:**
- `getTaskCompletion(taskId)` - Calculate completion (0.0-1.0) based on subtasks
- `getMemberProgress` - Team member progress including subtasks
- `getTasksForMember` / `getSubtasksForMember` - Get assigned items
- `getCurrentUserTasks(userName)` - Get user's mixed task/subtask items

## Task & Subtask Management System

**Status/Priority System:**
- Status: `"pending" | "in_progress" | "completed"`
- Priority: `"high" | "medium" | "low"`
- Parent task status auto-syncs with subtask completion
- Weighted progress: completed=1.0, in_progress=0.5, pending=0.0

**Due Date Management:**
- ISO 8601 format (YYYY-MM-DD) with date-fns
- Visual indicators: overdue (red), due today (orange), due soon (yellow), future (gray)
- shadcn/ui v4 calendar with dropdown navigation
- Date validation: past year to 5 years

**Task/Subtask Creation:**
- Multiple entry points: Global (ChecklistHeader), Contextual (CategorySection), Subtask (TaskItem)
- Dynamic category/subcategory creation via combobox typing
- Form validation: required fields, 100-char limit, priority selection
- Auto ID generation with `getNext*Id()` functions

**Real-time Updates:**
- Cross-view synchronization across all 6 views
- Automatic statistics calculations including subtasks
- Graph colors update with status changes (5-level hierarchy)
- Calendar events with visual task/subtask distinction
- Assignment tracking for tasks and subtasks

## Data Synchronization

**Cross-View Reactivity:** ✅ **Overview** ↔️ **Checklist** ↔️ **My Tasks** ↔️ **Graph** ↔️ **Team** ↔️ **Calendar**

Changes propagate instantly:
- Graph node colors (5-level hierarchy)
- Summary statistics including subtask counts  
- Team progress with subtask completion
- Calendar events with visual distinction
- Due date indicators and overdue highlighting
- Dynamic structure updates in dropdowns

## Styling System

**Design Tokens:** CSS variables in `app/globals.css` - colors, typography, spacing, shadows, borders
**Theming:** Light/dark modes, localStorage persistence, next-themes integration
**Responsive Design:** Mobile-first, breakpoints (sm/md/lg/xl), collapsible sidebar
**shadcn/ui Integration:** Radix primitives, accessibility (ARIA, keyboard nav), type-safe variants

## Troubleshooting

**Graph Issues:**
- **KNOWN ISSUE:** Fullscreen node interaction broken - hover works, click events fail. Normal mode works perfectly.
- Nodes overlapping: Adjust charge force multipliers in `graph-visualization.tsx`
- Performance: Check D3 memory leaks, verify DataContext memoization
- Graph resets: FIXED - `selectedNode` removed from `createVisualization` dependencies

**State Management:**
- Data not updating: Use `useData()` hook vs static imports
- Cross-view sync failing: Verify DataProvider wraps app in `layout.tsx`
- Parent task status not syncing: Check `updateSubtaskStatus()` logic
- Cascade re-renders: FIXED - DataContext memoized, use `useCallback` and `useMemo`

**Component Issues:**
- Subtask overlapping: FIXED - proper CSS containment in TaskItem
- Button height mismatch: FIXED - `!h-7` and `leading-none` for consistency
- Command filtering: FIXED - `shouldFilter={false}` for dynamic creation

**Due Date Issues:**
- Format: Use ISO 8601 (YYYY-MM-DD) with date-fns
- Visual indicators: overdue (red), due today (orange), due soon (yellow)
- Calendar sizing: Use `captionLayout="dropdown"`, spacing.20 (80px)
- Positioning: `align="start"` and `overflow-hidden p-0`