# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeAid is a sophisticated business process checklist dashboard built with Next.js 14, TypeScript, and shadcn/ui components. The application displays 93 business processes across 7 categories in a unified dashboard with real-time statistics, interactive visualizations, and collaborative task management.

**Core Features:**
- **Overview**: Summary cards, interactive progress charts, high-priority task table, and chronological upcoming tasks view
- **Checklist**: Filterable task management with real-time status updates, task assignment, due date management, and comprehensive task creation functionality
- **Graph**: D3.js force-directed visualization with detailed node inspection
- **Team**: Comprehensive team member management with full CRUD operations, progress tracking, and horizontal three-dot menus
- **Calendar**: Monthly calendar view displaying tasks by due date with advanced filtering and task editing capabilities
- **Due Date Management**: Complete task scheduling with visual indicators, overdue tracking, and dropdown calendar navigation
- **Unified State**: Cross-view reactivity with instant data synchronization across all 5 views
- **Theme Support**: Persistent light/dark mode with comprehensive design tokens

## Technology Stack

### **Core Framework**
- **Next.js 14.0.0**: App Router, server components, optimized bundle splitting
- **React 18.2.0**: Concurrent features, automatic batching
- **TypeScript 5.2.2**: Strict type checking, advanced type inference

### **UI & Styling**
- **shadcn/ui**: Complete component library built on Radix primitives
- **Tailwind CSS 3.3.5**: Utility-first styling with CSS variables
- **Radix UI**: Accessible headless components (accordion, dialog, dropdown, etc.)
- **Lucide React 0.294.0**: Consistent icon system
- **next-themes 0.4.6**: Persistent theme management
- **cmdk 1.1.1**: Command palette functionality for searchable comboboxes

### **Data Visualization**
- **D3.js 7.9.0**: Force-directed graph simulation, data transformations
- **Custom Physics Engine**: Multi-force layout with collision detection

### **Date & Time Management**
- **react-day-picker 9.x**: Calendar component with dropdown navigation and accessibility
- **date-fns**: Date parsing, formatting, and manipulation utilities
- **ISO 8601 Format**: Backend-compatible date storage format

### **Development Tools**
- **ESLint**: Code quality and consistency
- **PostCSS + Autoprefixer**: CSS processing pipeline
- **Class Variance Authority**: Type-safe component variants

## Project Structure

```
/Users/benlittle/Desktop/Stuff/Projects/AXL/OrgGraphUI/
├── app/                          # Next.js 14 app directory
│   ├── calendar/page.tsx        # Calendar view with monthly task display and filtering
│   ├── checklist/page.tsx       # Checklist view with filters and task assignment
│   ├── graph/page.tsx           # Interactive graph visualization
│   ├── team/page.tsx            # Team member management and progress tracking
│   ├── globals.css              # CSS variables, theme tokens
│   ├── layout.tsx               # Root layout with DataProvider
│   └── page.tsx                 # Overview/Dashboard home page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   │   ├── accordion.tsx        # Collapsible content sections
│   │   ├── badge.tsx           # Status/priority indicators
│   │   ├── button.tsx          # Interactive buttons with variants
│   │   ├── calendar.tsx        # Date picker calendar with dropdown navigation
│   │   ├── card.tsx            # Content containers
│   │   ├── checkbox.tsx        # Form checkboxes
│   │   ├── dialog.tsx          # Modal dialogs
│   │   ├── dropdown-menu.tsx   # Contextual menus
│   │   ├── input.tsx           # Form inputs
│   │   ├── popover.tsx         # Floating content containers
│   │   ├── progress.tsx        # Progress indicators
│   │   ├── select.tsx          # Dropdown selectors
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── table.tsx           # Data tables
│   │   ├── textarea.tsx        # Multi-line text inputs for bios and descriptions
│   │   └── command.tsx         # Searchable command palette component for comboboxes
│   ├── add-task-dialog.tsx       # Task creation dialog with form validation, dynamic category/subcategory creation, and hierarchical selection
│   ├── add-team-member-dialog.tsx # Team member creation dialog with comprehensive form validation and department management
│   ├── edit-team-member-dialog.tsx # Team member editing dialog with pre-populated form and validation
│   ├── category-combobox.tsx     # Dynamic category selection with creation capability using shadcn Command component
│   ├── subcategory-combobox.tsx  # Dynamic subcategory selection filtered by category with creation capability
│   ├── app-sidebar.tsx          # Navigation with active states
│   ├── assignee-select.tsx      # Task assignment dropdown component
│   ├── calendar-event.tsx       # Calendar task event component with editing capabilities
│   ├── calendar-view.tsx        # Monthly calendar grid with task display and filtering
│   ├── category-section.tsx     # Checklist category display with contextual add task buttons
│   ├── chart-area-interactive.tsx # Overview progress charts
│   ├── checklist-header.tsx     # Filters, search controls, summary cards, and global add task button
│   ├── data-table.tsx           # High-priority tasks table
│   ├── date-picker.tsx          # Due date picker with visual indicators and calendar
│   ├── graph-visualization.tsx   # D3.js force-directed graph
│   ├── mode-toggle.tsx          # Dark/light theme toggle
│   ├── section-cards.tsx        # Overview summary statistics
│   ├── site-header.tsx          # Top navigation bar
│   ├── task-item.tsx            # Individual task component with assignment and due dates
│   ├── team-member-card.tsx     # Team member display card with horizontal three-dot menu beside name
│   ├── team-member-detail.tsx   # Team member detail modal with horizontal three-dot menu beside name
│   └── theme-provider.tsx       # Theme context wrapper
├── contexts/
│   └── data-context.tsx         # Unified reactive state management
├── data/
│   └── team-data.ts             # Team member data and task assignments
├── lib/
│   ├── graph-data.ts            # D3 data transformation utilities
│   └── utils.ts                 # Utility functions (cn helper)
├── data.json                    # Business process data source
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## Development Workflow

### **Available Scripts**
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production with optimizations
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
```

### **Development Server**
- **Hot Reload**: Instant updates for component/style changes
- **Fast Refresh**: Preserves component state during edits
- **TypeScript**: Real-time type checking and IntelliSense

### **Code Quality**
- **ESLint**: Configured with Next.js recommended rules
- **TypeScript**: Strict mode enabled with path mapping
- **Prettier**: Code formatting (if configured in IDE)

### **Build Status**
- **Production Ready**: All builds pass with zero errors and warnings
- **Recent Fixes Applied**: TypeScript errors resolved in calendar components, CSS warnings eliminated
- **Bundle Optimization**: Automatic code splitting with optimized route-based chunks
- **Static Generation**: All pages pre-rendered for optimal performance

## Data Architecture

### **Unified State Management**
All views (Overview, Checklist, Graph, Team) share a single reactive data source via `DataContext` (`contexts/data-context.tsx`).

**Data Flow Architecture:**
1. **DataProvider** wraps the app in `app/layout.tsx`, providing reactive state management
2. **All views use `useData()` hook** for consistent state access and updates
3. **Cross-view reactivity**: Task status changes instantly update all views (overview statistics, checklist UI, graph node colors, team progress)
4. **Team Integration**: Task assignments link business processes to team members with real-time progress tracking

### **Core Data Structure**
The application uses two main data sources:

**Business Process Data** (`data.json`):
- **Categories**: 7 main business areas (Corporate & Governance, Finance & Accounting, HR, Product/Tech, Go-To-Market, Sales/Customer Success, Fundraising)
- **Subcategories**: 20+ functional areas within categories (expandable with dynamic creation)
- **Tasks**: 94+ individual business process items with status, priority, and assignee fields (dynamic with task creation)
- **Task Creation**: Full task creation capability with automatic ID generation and cross-view synchronization
- **Current Status**: 8 completed, 6 in_progress, 80+ pending tasks (updates with new task creation)

**Team Data** (`data/team-data.ts`):
- **Team Members**: 4 core team members (CEO, CTO, CFO, VP Marketing)
- **Task Assignments**: Mapping of team members to specific task IDs
- **Member Profiles**: Complete profiles with roles, departments, contact info, hire dates
- **Progress Tracking**: Real-time calculation of individual member task completion

### **Current Architecture Limitations**

**Single-Company Design**: The current implementation is designed for a single company/organization:
- All data flows through static files (`data.json`, `team-data.ts`)
- No company isolation or multi-tenancy support
- State management assumes one dataset per application instance
- No user authentication or company-based access control

**Future Multi-Company Architecture**: Planned Supabase integration will enable:
- **Database Schema**: Separate tables for companies, users, teams, tasks with proper foreign key relationships
- **Company Isolation**: Complete data separation between organizations
- **User Management**: Authentication with company-based role assignments
- **Scalable Teams**: Support for larger teams and custom departmental structures
- **Data Migration**: Current `data.json` will serve as template for new company onboarding

### **TypeScript Interfaces**

```typescript
interface Task {
  id: number
  name: string
  status: "pending" | "in_progress" | "completed"
  priority: "high" | "medium" | "low"
  assignee: string | null
  dueDate: string | null  // ISO 8601 format (YYYY-MM-DD) for backend compatibility
}

interface Subcategory {
  id: number
  name: string
  tasks: Task[]
}

interface Category {
  id: number
  name: string
  totalTasks: number
  subcategories: Subcategory[]
}

interface ChecklistData {
  categories: Category[]
  summary: {
    totalTasks: number
    totalCategories: number
    totalSubcategories: number
    statusCounts: { pending: number; in_progress: number; completed: number }
    priorityCounts: { high: number; medium: number; low: number }
  }
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  hireDate: string
  avatarUrl: string | null
  isActive: boolean
  bio?: string
}

interface TeamData {
  members: TeamMember[]
  departments: string[]
  totalMembers: number
  activeMembers: number
}

interface NewTeamMemberData {
  name: string
  role: string
  email: string
  department: string
  hireDate: string
  bio?: string
  avatarUrl?: string
}
```

### **Graph Data Types**
```typescript
interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  level: number         // 0=root, 1=category, 2=subcategory, 3=task
  completion: number    // 0.0 to 1.0 completion percentage
  weight: number        // Node importance/size factor
  isLeaf: boolean      // True for task-level nodes
  originalNode?: any   // Reference to source data
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  strength?: number    // Link force strength
}
```

### **Components Consuming Reactive Data**
- `SectionCards`: Displays live summary statistics with real-time updates including active tasks count
- `DataTable`: Shows filtered high-priority tasks with instant status changes
- `ChartAreaInteractive`: Renders category progress with live completion percentages
- `GraphVisualization`: Node colors update automatically based on task completion status
- `TeamMemberCard`: Shows real-time progress tracking for individual team members
- `CalendarView`: Monthly calendar display with task filtering and real-time due date tracking
- `CalendarEvent`: Interactive task events with full editing capabilities and status updates
- `AssigneeSelect`: Provides task assignment functionality with team member selection
- `DatePicker`: Task due date management with visual indicators and calendar integration
- `TaskItem`: Complete task management including status, assignment, and due date updates
- `ChecklistHeader`: Displays summary cards including in-progress task tracking and global task creation
- `AddTaskDialog`: Comprehensive task creation dialog with form validation, dynamic category/subcategory creation, hierarchical selection, and cross-view synchronization
- `CategoryCombobox`: Searchable category selector with dynamic creation capability using shadcn Command component with fixed filtering logic
- `SubcategoryCombobox`: Filtered subcategory selector with context-aware creation and proper category dependency, includes fixed Command filtering
- `CategorySection`: Category display with contextual task creation buttons for specific subcategories

### **Dynamic Category/Subcategory Creation System - RECENTLY IMPLEMENTED (2025)**

**Problem Identified**: The "Create new category/subcategory" options were not appearing when users typed non-matching names in the combobox dropdowns, despite the creation logic being implemented.

**Root Cause**: The shadcn Command component's automatic filtering (`shouldFilter={true}` by default) was interfering with the custom create option logic by filtering out the "Create new..." options before they could be displayed.

**Solution Applied** to both `CategoryCombobox` and `SubcategoryCombobox` (`components/category-combobox.tsx:91` and `components/subcategory-combobox.tsx:110`):

1. **Disabled Automatic Filtering**: Added `shouldFilter={false}` to Command components
2. **Implemented Manual Filtering**: Used controlled input with `value={searchValue}` and `onValueChange={setSearchValue}`
3. **Fixed Create Option Logic**: Changed `showCreateOption` to check against full arrays (`categories`/`subcategories`) instead of filtered arrays
4. **Maintained Custom Filtering**: Used `filteredCategories`/`filteredSubcategories` for display while preserving create functionality

**Technical Implementation**:
```typescript
// Before (broken):
<Command> // shouldFilter={true} by default
  <CommandInput placeholder="..." />
  {categories.map(...)} // All categories always shown
  {showCreateOption && ...} // Checked filteredCategories

// After (working):
<Command shouldFilter={false}>
  <CommandInput 
    value={searchValue} 
    onValueChange={setSearchValue} 
  />
  {filteredCategories.map(...)} // Manual filtering
  {showCreateOption && ...} // Checks full categories array
```

**Verification Results**:
- ✅ **Category Creation**: "New Test Category" successfully created and persisted
- ✅ **Subcategory Creation**: "New Test Subcategory" successfully created under parent category
- ✅ **Data Persistence**: Both appear in subsequent dropdown selections with accurate counts
- ✅ **Hierarchical Relationships**: Subcategories properly linked to parent categories
- ✅ **Cross-View Updates**: New structures immediately available across all 5 views

**User Experience Impact**: Users can now seamlessly expand the organizational structure by typing new category or subcategory names directly in the task creation dialog, with immediate visual feedback and persistent data storage.

## Graph Visualization System

### **D3.js Force-Directed Layout**
The graph uses a sophisticated multi-force physics simulation for optimal node positioning:

**Issue**: Category nodes were positioned at unequal distances from center and overlapping due to weight-based force calculations.

**Solution Applied** (in `components/graph-visualization.tsx`):
1. **Normalized charge force for categories**: Level 1 nodes use fixed repulsion strength (30x multiplier) instead of weight-based calculation
2. **Added radial positioning force**: Constrains all category nodes to 400px radius from center with 1.5 strength
3. **Reduced root-to-category link strength**: Weakened center links from 0.8 to 0.2 to prevent hub clustering effect

**Result**: All 7 category nodes now positioned as evenly-spaced spokes around the center at equal distance, with subcategories and tasks properly clustering around their parent categories.

### **Force Configuration Controls**

**Distance Controls** (lines 188-194):
- Category → Subcategory: `return 65` (line 190)
- Subcategory → Task: `return 40` (line 193)

**Repulsion Controls** (lines 214-224):
- Category repulsion: `* 30` multiplier (line 218)
- Subcategory/Task repulsion: `* weightMultiplier` (line 224)
- To increase task repulsion: Add multiplier `* (node.level === 3 ? X : 1)` where X > 1

**Radial Force** (lines 236-247):
- Radius: `400` pixels from center for categories (line 240)
- Strength: `1.5` for categories (line 246)

### **Performance Optimizations - MAJOR UPDATE (2025)**
**Critical Performance Fix Applied**: Eliminated graph recreation on node selection

**Problem**: Graph visualization was being completely recreated (~50ms+) every time a user clicked a node, causing:
- Side panel appearance triggering full D3 simulation restart
- Cascade re-renders from unmemoized React dependencies
- Poor user experience with jarring visual resets

**Solution Implemented**:
1. **DataContext Memoization**: Added `useMemo` to context provider value to prevent cascade re-renders
2. **GraphPage Optimization**: Memoized `convertToGraphData` and `handleNodeClick` functions
3. **Separated D3 Creation from Selection**: 
   - Removed `selectedNode` from `createVisualization` dependencies
   - Created separate `updateSelection()` function for visual-only updates
   - Used refs to avoid closure dependencies in D3 event handlers
4. **Incremental Visual Updates**: Node highlighting now updates existing DOM elements instead of recreating entire graph

**Performance Impact**: 
- ~90% reduction in unnecessary graph recreations
- Smooth node selection with no visual reset
- Graph only recreates when data actually changes (task status) or dimensions change (resize)

**Additional Optimizations**:
- **Text Wrapping**: Intelligent text wrapping for long node names
- **Collision Detection**: Prevents node overlap with radius-based forces
- **Selective Rendering**: Optimized label rendering based on zoom level
- **Event Throttling**: Debounced resize and interaction handlers

## Calendar View System

### **Monthly Calendar Grid**
The calendar uses a sophisticated month-based layout with intelligent task organization:

**Calendar Structure**:
- **Month Grid**: 7-column weekly layout with automatic week calculation using date-fns
- **Task Events**: Up to 3 visible tasks per day with "+X more" overflow indicator
- **Dynamic Sizing**: Responsive design with mobile-optimized min-heights (80px mobile, 120px desktop)
- **Current Day Highlighting**: Blue accent background and circular date indicator for today

### **Advanced Filtering System**
**Compact Header Design** with bordered statistics and popover controls:
- **Status Filter**: All, Pending, Active, Done with real-time task count updates
- **Priority Filter**: All, High, Medium, Low with color-coded visual feedback
- **Assignee Filter**: Team member dropdown with "Unassigned" option and avatar display
- **Show Completed Toggle**: Binary on/off control for completed task visibility
- **Clear Filters**: One-click reset with active filter indicator badge

### **Task Event Interaction**
**CalendarEvent Component Features**:
- **Compact Mode**: Priority color-coded cards with status dots, truncated names, and mini icons
- **Full Edit Dialog**: Complete task management with status, priority, assignee, and due date controls
- **Visual Indicators**: Priority background colors, status indicators, assignee avatars, and due date timestamps
- **Responsive Layout**: Adaptive sizing for different screen sizes with proper text truncation

### **Monthly Statistics Integration**
**Real-time Metrics Display** (bordered header section):
- **Total Tasks**: Current month task count with live updates
- **Completed**: Green-coded completion count
- **Active**: Blue-coded in-progress task count  
- **Overdue**: Red-coded overdue task count (conditional display)
- **Navigation**: Previous/next month controls with "Today" quick action

### **Performance Optimizations**
- **Memoized Calculations**: Week grid generation and task grouping cached with useMemo
- **Efficient Date Handling**: date-fns integration for fast date operations and formatting
- **Filtered Data Pipeline**: Multi-stage filtering system with early returns for performance
- **Responsive Events**: Debounced month navigation and filter state management

## Component Architecture

### **Layout Components**
- `AppSidebar`: Navigation with active states and responsive collapse
- `SiteHeader`: Top navigation bar with theme toggle and user controls

### **Data Components**
- `SectionCards`: Real-time summary statistics with trend indicators and active tasks tracking
- `DataTable`: Sortable/filterable table with pagination and selection
- `ChartAreaInteractive`: Interactive progress charts with drill-down capability
- `TeamMemberCard`: Individual team member cards with progress visualization
- `TeamMemberDetail`: Comprehensive modal with detailed member task breakdown, interactive task management, and full task editing capabilities
- `CalendarView`: Monthly calendar grid with task display, advanced filtering (status, priority, assignee), and compact statistical headers
- `CalendarEvent`: Task event rendering component with compact and full edit modes, priority color coding, and complete task management
- `AssigneeSelect`: Task assignment dropdown with avatar-based team member selection
- `DatePicker`: Advanced due date picker with calendar dropdown, visual status indicators, and date validation
- `TaskItem`: Complete task management interface with checkbox completion, priority badges, status dropdowns, assignment controls, due date pickers, and three-dot detail menus

### **UI Components** (Located in `/components/ui/`)
All components follow shadcn/ui patterns with:
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Theming**: CSS variable integration for light/dark modes
- **Variants**: Type-safe styling variants using class-variance-authority
- **Responsive**: Mobile-first design with Tailwind breakpoints

## Styling System

### **Design Tokens**
Uses comprehensive CSS variables defined in `app/globals.css`:
- **Colors**: Primary, secondary, accent, destructive, muted color scales
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale with rem units
- **Shadows**: Elevation system with multiple shadow levels
- **Borders**: Radius values and border styles

### **Theme Implementation**
- **Light/Dark Modes**: Automatic switching based on system preference
- **Persistent Preferences**: Theme choice saved in localStorage
- **CSS Variables**: Dynamic color token switching without JavaScript
- **Component Variants**: Type-safe variant system with cva

### **Responsive Design**
- **Mobile-First**: Base styles target mobile with progressive enhancement
- **Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- **Sidebar Behavior**: Collapsible on mobile, persistent on desktop
- **Graph Scaling**: Dynamic sizing based on container dimensions

## Task Management & Team System

### **Business Process Data**
- **Total Tasks**: 94+ individual business process items (expandable with task creation)
- **Categories**: 7 main business areas
- **Subcategories**: 20+ functional areas (expandable with dynamic creation)
- **Priority Distribution**: High (42+ tasks), Medium (35+ tasks), Low (16+ tasks) - updates with new task creation
- **Current Status**: 8 completed, 6 in_progress, 80+ pending tasks (dynamic with task creation)
- **Task Creation System**: Full CRUD operations with automatic ID generation and real-time synchronization

### **Team Management - COMPREHENSIVE CRUD SYSTEM (2025)**
- **Team Size**: 4+ core team members (expandable with full CRUD operations)
- **Task Assignment**: Dynamic assignment system with real-time progress tracking
- **Progress Calculation**: Weighted progress (completed=1.0, in_progress=0.5, pending=0.0)
- **Avatar System**: Consistent avatar display across all components with proper sizing
- **Department Organization**: Members organized by Executive, Engineering, Finance, Marketing (expandable with dynamic creation)
- **Interactive Team Cards**: Clickable team member cards that open detailed task management modals
- **Team Task Management**: Full task editing capabilities within team member details including status changes, due date updates, and assignment modifications
- **Consistent UI Patterns**: Team details view uses identical task interaction patterns as checklist view (checkboxes, status dropdowns, horizontal three-dot menus)

**Full CRUD Operations** (Recently Implemented):
- **Add Team Members**: Comprehensive dialog with form validation, department creation, and all member fields
- **Edit Team Members**: Pre-populated form for updating existing member information with validation
- **Delete Team Members**: Safe deletion with confirmation dialogs and automatic task unassignment
- **Dynamic Departments**: Users can create new departments on-the-fly during member creation/editing
- **Reactive State**: All team operations immediately reflect across all views with updated statistics
- **Horizontal Three-Dot Menus**: Edit/delete options accessible beside member names in both cards and detail popups
- **Auto-ID Generation**: Unique team member IDs in format `tm-XXX` with automatic incrementing
- **Form Validation**: Comprehensive client-side validation with real-time error messaging and character limits
- **Data Persistence**: All changes persist in reactive state management with cross-view synchronization

### **Status Management**
- **Status Options**: `pending`, `in_progress`, `completed`
- **Priority Levels**: `high`, `medium`, `low`
- **Assignee System**: Full team member assignment with name-based mapping
- **Unique IDs**: Task IDs are unique across all categories/subcategories

### **Due Date Management**
- **Calendar Interface**: shadcn/ui v4 calendar with dropdown month/year navigation and optimized sizing (80px cells, 320px width)
- **Visual Indicators**: Color-coded status display with overdue (red), due today (orange), due soon (yellow), and future (gray) styling
- **Smart Date Picker**: Calendar icon, ChevronDown icon, proper spacing, visual feedback for different due date states
- **Date Format**: ISO 8601 format (YYYY-MM-DD) for backend compatibility
- **Date Validation**: Restricts selection to reasonable date ranges (past year to 5 years future)
- **Cross-View Integration**: Due dates display consistently across checklist, task dialogs, data tables, and calendar view
- **Automatic Calculations**: Days until due, overdue tracking, and status-based coloring
- **Calendar View Integration**: Tasks organized by due date in monthly calendar grid with filtering capabilities
- **Accessibility**: Keyboard navigation, screen reader support, and proper ARIA labels

### **Task Creation System**
The application features comprehensive task creation capabilities with two distinct entry points:

**Global Task Creation** (`ChecklistHeader`):
- **Prominent Add Task Button**: Located in the search & filter header section
- **Universal Access**: Available from any subcategory context
- **Complete Form**: Full task creation dialog with all available subcategories

**Contextual Task Creation** (`CategorySection`):
- **Subcategory-Specific Buttons**: "Add task to [Subcategory Name]" buttons within each subcategory
- **Smart Preselection**: Automatically preselects the correct subcategory in the dialog
- **Streamlined Workflow**: Reduces user clicks by pre-filling subcategory context

**AddTaskDialog Features**:
- **Hierarchical Selection**: Category-first, then subcategory workflow with proper filtering and dependency management
- **Dynamic Creation**: Users can create new categories and subcategories on-the-fly by typing in combobox fields
- **Searchable Comboboxes**: shadcn Command components provide search functionality with "Create new..." options that appear when typing non-matching names
- **Fixed Command Filtering**: Disabled automatic Command filtering (`shouldFilter={false}`) to prevent interference with custom create logic
- **Controlled Input State**: Manual filtering implementation with controlled search value for proper "Create new" option visibility
- **Form Validation**: Required fields (name, category, subcategory, priority) with client-side validation
- **Character Limits**: Task name limited to 100 characters with real-time counter
- **Priority Selection**: High/Medium/Low priority with visual color indicators
- **Optional Fields**: Assignee selection and due date picker
- **Smart Preselection**: Contextual task creation buttons pre-fill appropriate category/subcategory
- **Error Handling**: Comprehensive error messaging and visual feedback
- **Accessibility**: Full ARIA support, DialogDescription, and keyboard navigation
- **Cross-View Sync**: New tasks and categories immediately appear across all 5 views with updated statistics
- **Verified Data Persistence**: New categories and subcategories are properly persisted in underlying data structure with accurate counts and hierarchical relationships

**Implementation Details**:
- **Automatic ID Generation**: `getNextTaskId()`, `getNextCategoryId()`, and `getNextSubcategoryId()` ensure unique IDs across all data structures
- **Dynamic Structure Expansion**: `addCategory()` and `addSubcategory()` functions create new organizational structures
- **Hierarchical Data Management**: Categories contain subcategories, maintaining proper parent-child relationships
- **Subcategory Access**: `getAllSubcategories()` provides flat list for dropdown selection across all categories
- **State Management**: `addTask()`, `addCategory()`, and `addSubcategory()` functions handle insertion and trigger reactive updates
- **Type Safety**: Full TypeScript interface compliance with `NewTaskData` structure and category/subcategory types

### **Real-time Updates**
- **Cross-View Synchronization**: Status changes, task creation, category/subcategory creation, and due date updates propagate instantly across Overview, Checklist, Graph, Team, and Calendar views
- **Automatic Calculations**: Summary statistics update live without manual refresh including task count increases
- **Visual Feedback**: Immediate color changes in graph nodes, dashboard cards, team progress, calendar events, and due date indicators
- **Assignment Tracking**: Task assignments instantly reflect in team member progress calculations and calendar display
- **Due Date Reactivity**: Due date changes immediately update visual indicators and task styling across all views including calendar positioning
- **Task Creation Synchronization**: New tasks appear instantly in graph visualization, team views, and calendar positioning with proper categorization
- **Dynamic Structure Updates**: New categories and subcategories immediately appear in all dropdown selections, graph nodes, and organizational displays across all views

## Import Paths & Code Organization

### **Path Mapping**
Uses `@/*` path mapping configured in `tsconfig.json`:
```typescript
// Instead of: ../../../components/ui/button
import { Button } from "@/components/ui/button"

// Instead of: ../../contexts/data-context
import { useData } from "@/contexts/data-context"
```

### **Data Access Pattern**
Components access reactive data via the `useData()` hook:
```typescript
const { 
  data, 
  teamData,
  updateTaskStatus, 
  assignTaskToMember,
  updateTaskDueDate,
  addTask,
  addCategory,
  addSubcategory,
  getNextTaskId,
  getNextCategoryId,
  getNextSubcategoryId,
  getAllSubcategories,
  getTaskById,
  getMemberProgress,
  getTasksForMember,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getNextTeamMemberId,
  addDepartment
} = useData()
```

### **Component Organization**
- **UI Components**: Reusable, design system components in `/components/ui/`
- **Feature Components**: Business logic components in `/components/`
- **Context Providers**: State management in `/contexts/`
- **Data Sources**: Static data and team information in `/data/`
- **Utilities**: Helper functions in `/lib/`

## Architecture Patterns

### **Context Provider Pattern**
- **Centralized State**: Single source of truth for all application data and team management
- **Provider Wrapper**: DataProvider wraps entire app in `layout.tsx`
- **Hook Abstraction**: Custom `useData()` hook simplifies component data access
- **Memoized Context**: Provider value is properly memoized to prevent cascade re-renders

### **Server/Client Separation**
- **Static Data**: Business process data served from static JSON and team data from TypeScript modules
- **Client-Side Only**: No server-side API routes or database connections
- **Pure Frontend**: All state management, task assignment, and team interactions happen client-side

### **Component Composition**
- **Compound Components**: Complex UI built from smaller, focused components
- **Render Props**: Flexible component APIs with children functions
- **Slot Pattern**: shadcn/ui components support flexible content injection

## Deployment & Environment

### **Deployment Readiness**
- **Static Export Compatible**: Can be deployed as static site
- **Vercel Optimized**: Ready for Vercel deployment with zero configuration
- **Build Output**: Optimized bundle with automatic code splitting
- **No Environment Variables**: No server-side secrets or API keys required

### **Production Considerations**
- **Bundle Size**: Optimized with Next.js automatic splitting
- **SEO**: Static generation for improved search indexing
- **Performance**: Lighthouse-optimized with Core Web Vitals compliance
- **Accessibility**: WCAG 2.1 AA compliance through Radix primitives

### **Hosting Options**
- **Static Hosts**: Netlify, GitHub Pages, AWS S3 + CloudFront
- **Edge Deployment**: Vercel, Cloudflare Pages
- **Traditional Hosting**: Any Node.js hosting platform

## Performance Considerations

### **D3.js Optimization**
- **Force Simulation**: Configurable alpha decay and velocity decay for smooth animations
- **Node Rendering**: Selective text rendering based on zoom level and node size
- **Memory Management**: Proper cleanup of D3 event listeners and simulations
- **Animation Performance**: RequestAnimationFrame-based updates for 60fps rendering

### **React Performance - UPDATED (2025)**
**Critical Fixes Applied**:
- **Context Optimization**: DataContext provider value now properly memoized to prevent cascade re-renders
- **Strategic Memoization**: Added `useMemo` for expensive data transformations (`convertToGraphData`)
- **Callback Optimization**: All event handlers properly memoized with `useCallback`
- **Ref-Based State**: Used refs to eliminate closure dependencies in D3 event handlers

**Additional Optimizations**:
- **Component Memoization**: Strategic use of React.memo for expensive components
- **Bundle Splitting**: Automatic code splitting with Next.js dynamic imports  
- **Image Optimization**: Next.js Image component for optimized loading

## Troubleshooting

### **Common Issues**

**Graph Visualization Problems:**
- **Nodes overlapping**: Adjust charge force multipliers in force configuration
- **Poor layout**: Increase simulation alpha or adjust force strengths
- **Graph resets on interaction**: FIXED (2025) - Ensure `selectedNode` not in `createVisualization` dependencies
- **Performance issues**: Check for memory leaks in D3 event listeners, verify context memoization
- **Fullscreen node interaction issue**: KNOWN ISSUE (2025) - Node click events and popup details card do not work in fullscreen mode. Hover tooltips work correctly, but node selection and the bottom-left detail card fail to appear when nodes are clicked in fullscreen. Issue persists despite D3.js event handler verification and pointer event troubleshooting. Normal mode works perfectly.

**State Management Issues:**
- **Data not updating**: Ensure components use `useData()` hook instead of static imports
- **Cross-view sync failing**: Verify DataProvider wraps all components in layout  
- **Performance degradation**: FIXED (2025) - DataContext value now memoized, check React DevTools for remaining issues
- **Cascade re-renders**: Ensure all callbacks use `useCallback` and data transformations use `useMemo`

**Styling Problems:**
- **Theme not applying**: Verify CSS variables are imported in globals.css
- **Components not styled**: Ensure Tailwind classes are not being purged
- **Responsive issues**: Test with different viewport sizes in DevTools

**Due Date Component Issues:**
- **Calendar alignment problems**: Use shadcn/ui v4 calendar with proper `getDefaultClassNames()` and CSS custom properties
- **Date picker too small**: Adjust `[--cell-size:theme(spacing.X)]` for larger calendar cells (current: spacing.20 = 80px)
- **Calendar navigation not working**: Ensure `captionLayout="dropdown"` for month/year dropdowns
- **Date format errors**: Always use ISO 8601 format (YYYY-MM-DD) with date-fns parsing/formatting
- **Popover positioning**: Use `align="start"` and `overflow-hidden p-0` for proper calendar display

**Calendar View Issues:**
- **Tailwind CSS Warning (FIXED)**: Previous issue with `[--cell-size:theme(spacing.18)]` has been resolved by updating to `spacing.20` (80px) which is a valid Tailwind spacing value. Calendar cells are now slightly larger (80px vs intended 72px) but provide better visual spacing.

### **Development Tips**
- **Hot Reload Issues**: Restart dev server if TypeScript changes aren't reflected
- **Build Failures**: Run `npm run lint` to catch common issues before build
- **Graph Performance**: Use browser DevTools Performance tab to profile D3 rendering
- **State Debugging**: Install React DevTools extension for context inspection

## Testing Strategy

**Current Status**: No testing framework configured

**Recommended Setup**:
- **Unit Tests**: Jest + React Testing Library for component testing
- **E2E Tests**: Playwright or Cypress for user flow validation
- **Visual Tests**: Storybook for component documentation and visual regression
- **Type Tests**: TypeScript strict mode catches type-related bugs

## Future Enhancements

### **Potential Features**
- **Multi-Company Support**: Complete multi-tenant architecture with Supabase backend
- **Real-time Collaboration**: WebSocket integration for multi-user editing
- **Data Persistence**: Database integration for persistent task states
- **Advanced Filtering**: Complex query builder for task management
- **Export Functionality**: PDF/Excel export of reports and progress
- **Notifications**: Push notifications for task assignments and deadlines
- **Team Expansion**: Support for larger teams and department hierarchies
- **Role-Based Permissions**: Advanced access control and task visibility
- **Company Onboarding**: Automated setup with customizable process templates

### **Technical Improvements**
- **Supabase Migration**: Multi-tenant database schema with company isolation, authentication, and real-time subscriptions
- **API Integration**: RESTful backend API for data persistence and user management with company-scoped endpoints
- **Authentication System**: User login with company association and role-based access control
- **Data Migration Strategy**: Convert current static files to database schema with template-based company onboarding
- **Offline Support**: Service worker for offline task management with sync capabilities
- **Advanced Analytics**: Detailed progress tracking and reporting with company-level insights
- **Mobile App**: React Native version for mobile task management
- **Enterprise Features**: SSO integration, audit logs, advanced permissions, white-label branding
- **Real-time Sync**: Live collaboration features for team task management with WebSocket integration

## Data Synchronization

**Real-time Cross-View Updates**: Task status changes and due date updates propagate instantly across all views:
- ✅ **Overview** ↔️ **Checklist** ↔️ **Graph** ↔️ **Team** ↔️ **Calendar**
- Graph node colors change immediately when tasks are completed/updated in other views
- Calendar events update automatically when task status, assignments, or due dates change
- Summary statistics update live across overview cards, checklist headers, team progress, and calendar monthly stats
- Team member progress updates automatically when tasks are assigned or status changes
- Task assignments and due dates reflect immediately in all views with proper name mapping including calendar positioning
- Due date visual indicators update instantly across task items, dialogs, data tables, and calendar events
- Active Tasks card shows real-time count of in_progress tasks across overview, checklist, and calendar
- Overdue task highlighting updates automatically based on current date calculations across all views
- Calendar filtering responds instantly to task changes without requiring page refresh
- Dynamic category/subcategory creation immediately appears in all dropdown selections and organizational displays
- Unified state ensures data consistency without manual refresh across all 5 views
- **PERFORMANCE OPTIMIZED (2025)**: Selective re-rendering and strategic memoization eliminate unnecessary recreations

**Key Performance Improvements**:
- DataContext provider value properly memoized - eliminates cascade re-renders
- Graph visualization separates data updates from visual selection - no more reset on click
- All expensive computations (`convertToGraphData`) are memoized
- Event handlers use `useCallback` to prevent function recreation
- Node selection uses incremental DOM updates instead of full graph recreation