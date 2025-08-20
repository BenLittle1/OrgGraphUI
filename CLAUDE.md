# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeAid is a sophisticated business process checklist dashboard built with Next.js 14, TypeScript, and shadcn/ui components. The application displays 93 business processes across 7 categories in a unified dashboard with real-time statistics, interactive visualizations, and collaborative task management.

**Core Features:**
- **Overview**: Summary cards, interactive progress charts, high-priority task table
- **Checklist**: Filterable task management with real-time status updates and task assignment
- **Graph**: D3.js force-directed visualization with detailed node inspection
- **Team**: Comprehensive team member management with progress tracking
- **Unified State**: Cross-view reactivity with instant data synchronization
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

### **Data Visualization**
- **D3.js 7.9.0**: Force-directed graph simulation, data transformations
- **Custom Physics Engine**: Multi-force layout with collision detection

### **Development Tools**
- **ESLint**: Code quality and consistency
- **PostCSS + Autoprefixer**: CSS processing pipeline
- **Class Variance Authority**: Type-safe component variants

## Project Structure

```
/Users/benlittle/Desktop/Stuff/Projects/AXL/OrgGraphUI/
├── app/                          # Next.js 14 app directory
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
│   │   ├── card.tsx            # Content containers
│   │   ├── checkbox.tsx        # Form checkboxes
│   │   ├── dialog.tsx          # Modal dialogs
│   │   ├── dropdown-menu.tsx   # Contextual menus
│   │   ├── input.tsx           # Form inputs
│   │   ├── progress.tsx        # Progress indicators
│   │   ├── select.tsx          # Dropdown selectors
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   └── table.tsx           # Data tables
│   ├── app-sidebar.tsx          # Navigation with active states
│   ├── assignee-select.tsx      # Task assignment dropdown component
│   ├── category-section.tsx     # Checklist category display
│   ├── chart-area-interactive.tsx # Overview progress charts
│   ├── checklist-header.tsx     # Filters, search controls, and summary cards
│   ├── data-table.tsx           # High-priority tasks table
│   ├── graph-visualization.tsx   # D3.js force-directed graph
│   ├── mode-toggle.tsx          # Dark/light theme toggle
│   ├── section-cards.tsx        # Overview summary statistics
│   ├── site-header.tsx          # Top navigation bar
│   ├── task-item.tsx            # Individual task component with assignment
│   ├── team-member-card.tsx     # Team member display card
│   ├── team-member-detail.tsx   # Team member detail modal
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
- **Subcategories**: 20 functional areas within categories
- **Tasks**: 93 individual business process items with status, priority, and assignee fields
- **Current Status**: 8 completed, 6 in_progress, 79 pending tasks

**Team Data** (`data/team-data.ts`):
- **Team Members**: 4 core team members (CEO, CTO, CFO, VP Marketing)
- **Task Assignments**: Mapping of team members to specific task IDs
- **Member Profiles**: Complete profiles with roles, departments, contact info, hire dates
- **Progress Tracking**: Real-time calculation of individual member task completion

### **TypeScript Interfaces**

```typescript
interface Task {
  id: number
  name: string
  status: "pending" | "in_progress" | "completed"
  priority: "high" | "medium" | "low"
  assignee: string | null
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
}

interface TeamData {
  members: TeamMember[]
  departments: string[]
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
- `AssigneeSelect`: Provides task assignment functionality with team member selection
- `ChecklistHeader`: Displays summary cards including in-progress task tracking

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

## Component Architecture

### **Layout Components**
- `AppSidebar`: Navigation with active states and responsive collapse
- `SiteHeader`: Top navigation bar with theme toggle and user controls

### **Data Components**
- `SectionCards`: Real-time summary statistics with trend indicators and active tasks tracking
- `DataTable`: Sortable/filterable table with pagination and selection
- `ChartAreaInteractive`: Interactive progress charts with drill-down capability
- `TeamMemberCard`: Individual team member cards with progress visualization
- `TeamMemberDetail`: Comprehensive modal with detailed member task breakdown
- `AssigneeSelect`: Task assignment dropdown with avatar-based team member selection

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
- **Total Tasks**: 93 individual business process items
- **Categories**: 7 main business areas
- **Subcategories**: 20 functional areas
- **Priority Distribution**: High (42 tasks), Medium (35), Low (16)
- **Current Status**: 8 completed, 6 in_progress, 79 pending tasks

### **Team Management**
- **Team Size**: 4 core team members (CEO, CTO, CFO, VP Marketing)
- **Task Assignment**: Dynamic assignment system with real-time progress tracking
- **Progress Calculation**: Weighted progress (completed=1.0, in_progress=0.5, pending=0.0)
- **Avatar System**: Consistent avatar display across all components with proper sizing
- **Department Organization**: Members organized by Executive, Engineering, Finance, Marketing

### **Status Management**
- **Status Options**: `pending`, `in_progress`, `completed`
- **Priority Levels**: `high`, `medium`, `low`
- **Assignee System**: Full team member assignment with name-based mapping
- **Unique IDs**: Task IDs are unique across all categories/subcategories

### **Real-time Updates**
- **Cross-View Synchronization**: Status changes propagate instantly across Overview, Checklist, Graph, and Team views
- **Automatic Calculations**: Summary statistics update live without manual refresh
- **Visual Feedback**: Immediate color changes in graph nodes, dashboard cards, and team progress
- **Assignment Tracking**: Task assignments instantly reflect in team member progress calculations

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
  getTaskById,
  getMemberProgress,
  getTasksForMember 
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

**State Management Issues:**
- **Data not updating**: Ensure components use `useData()` hook instead of static imports
- **Cross-view sync failing**: Verify DataProvider wraps all components in layout  
- **Performance degradation**: FIXED (2025) - DataContext value now memoized, check React DevTools for remaining issues
- **Cascade re-renders**: Ensure all callbacks use `useCallback` and data transformations use `useMemo`

**Styling Problems:**
- **Theme not applying**: Verify CSS variables are imported in globals.css
- **Components not styled**: Ensure Tailwind classes are not being purged
- **Responsive issues**: Test with different viewport sizes in DevTools

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
- **Real-time Collaboration**: WebSocket integration for multi-user editing
- **Data Persistence**: Database integration for persistent task states
- **Advanced Filtering**: Complex query builder for task management
- **Export Functionality**: PDF/Excel export of reports and progress
- **Notifications**: Push notifications for task assignments and deadlines
- **Team Expansion**: Support for larger teams and department hierarchies
- **Role-Based Permissions**: Advanced access control and task visibility

### **Technical Improvements**
- **API Integration**: Backend API for data persistence and user management
- **Offline Support**: Service worker for offline task management
- **Advanced Analytics**: Detailed progress tracking and reporting
- **Mobile App**: React Native version for mobile task management
- **Enterprise Features**: SSO integration, audit logs, advanced permissions
- **Database Integration**: Supabase or similar backend for persistent team and task data
- **Real-time Sync**: Live collaboration features for team task management

## Data Synchronization

**Real-time Cross-View Updates**: Task status changes propagate instantly across all views:
- ✅ **Overview** ↔️ **Checklist** ↔️ **Graph** ↔️ **Team**
- Graph node colors change immediately when tasks are completed/updated in other views
- Summary statistics update live across overview cards, checklist headers, and team progress
- Team member progress updates automatically when tasks are assigned or status changes
- Task assignments reflect immediately in all views with proper name mapping
- Active Tasks card shows real-time count of in_progress tasks across overview and checklist
- Unified state ensures data consistency without manual refresh
- **PERFORMANCE OPTIMIZED (2025)**: Selective re-rendering and strategic memoization eliminate unnecessary recreations

**Key Performance Improvements**:
- DataContext provider value properly memoized - eliminates cascade re-renders
- Graph visualization separates data updates from visual selection - no more reset on click
- All expensive computations (`convertToGraphData`) are memoized
- Event handlers use `useCallback` to prevent function recreation
- Node selection uses incremental DOM updates instead of full graph recreation