# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeAid is a business process checklist dashboard built with Next.js 14, TypeScript, and shadcn/ui components. The application displays business processes across 7 categories (93 total tasks) in a dashboard format with statistics, visualizations, and task tables.

## Key Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

## Data Architecture

**Unified State Management**: All views (Dashboard, Checklist, Graph) share a single reactive data source via `DataContext` (`contexts/data-context.tsx`).

The core data structure originates from `data.json` - a hierarchical JSON containing:
- **Categories**: 7 main business areas (Corporate & Governance, Finance & Accounting, etc.)
- **Subcategories**: 20 functional areas within categories
- **Tasks**: 93 individual business process items with status, priority, and assignee fields

**Data Flow Architecture**:
1. **DataProvider** wraps the app in `app/layout.tsx`, providing reactive state management
2. **All views use `useData()` hook** for consistent state access and updates
3. **Cross-view reactivity**: Task status changes instantly update all views (dashboard statistics, checklist UI, graph node colors)

**Components consuming reactive data**:
- `SectionCards`: Displays live summary statistics
- `DataTable`: Shows filtered high-priority tasks with real-time updates  
- `ChartAreaInteractive`: Renders category progress with live completion percentages
- `GraphVisualization`: Node colors update automatically based on task completion status

## Component Structure

All components are in `/components/` and follow shadcn/ui patterns:
- **Layout Components**: `AppSidebar` (navigation), `SiteHeader` (top bar)
- **Data Components**: `SectionCards`, `DataTable`, `ChartAreaInteractive`
- **UI Components**: Located in `/components/ui/` (button, card, sidebar, table)

Navigation tabs: Dashboard, Checklist, Graph, Team, Settings. All views are fully implemented and interconnected via unified state management.

## Styling

Uses Tailwind CSS with shadcn/ui design system. Custom color tokens defined in `tailwind.config.js` with CSS variables in `app/globals.css`. Priority and status indicators use color-coded badges (red for high priority, green for completed, etc.).

## Import Paths

Uses `@/*` path mapping configured in `tsconfig.json` for cleaner imports. Components access reactive data via `const { data } = useData()` hook instead of static imports.

## Task Management

When working with business process data:
- Filter by priority: high (42 tasks), medium (35), low (16)
- Status options: pending, in_progress, completed
- All current tasks are "pending" status
- Task IDs are unique across all categories/subcategories

## Graph Visualization Configuration

**Issue**: Category nodes were positioned at unequal distances from center and overlapping due to weight-based force calculations.

**Solution Applied** (in `components/graph-visualization.tsx`):
1. **Normalized charge force for categories**: Level 1 nodes use fixed repulsion strength (30x multiplier) instead of weight-based calculation
2. **Added radial positioning force**: Constrains all category nodes to 400px radius from center with 1.5 strength
3. **Reduced root-to-category link strength**: Weakened center links from 0.8 to 0.2 to prevent hub clustering effect

**Result**: All 7 category nodes now positioned as evenly-spaced spokes around the center at equal distance, with subcategories and tasks properly clustering around their parent categories.

### Force Configuration Controls

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

## Data Synchronization

**Real-time Cross-View Updates**: Task status changes propagate instantly across all views:
- ✅ **Dashboard** ↔️ **Checklist** ↔️ **Graph** 
- Graph node colors change immediately when tasks are completed/updated in other views
- Summary statistics update live across dashboard cards and graph header
- Unified state ensures data consistency without manual refresh