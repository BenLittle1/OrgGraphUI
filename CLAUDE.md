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

The core data structure is in `data.json` - a hierarchical JSON containing:
- **Categories**: 7 main business areas (Corporate & Governance, Finance & Accounting, etc.)
- **Subcategories**: 20 functional areas within categories
- **Tasks**: 93 individual business process items with status, priority, and assignee fields

The data flows through components:
- `SectionCards`: Displays summary statistics from `data.summary`
- `DataTable`: Shows filtered high-priority tasks across all categories
- `ChartAreaInteractive`: Renders category breakdowns with progress visualization

## Component Structure

All components are in `/components/` and follow shadcn/ui patterns:
- **Layout Components**: `AppSidebar` (navigation), `SiteHeader` (top bar)
- **Data Components**: `SectionCards`, `DataTable`, `ChartAreaInteractive`
- **UI Components**: Located in `/components/ui/` (button, card, sidebar, table)

Navigation tabs: Dashboard, Checklist, Graph, Team, Settings (currently only Dashboard is implemented).

## Styling

Uses Tailwind CSS with shadcn/ui design system. Custom color tokens defined in `tailwind.config.js` with CSS variables in `app/globals.css`. Priority and status indicators use color-coded badges (red for high priority, green for completed, etc.).

## Import Paths

Uses `@/*` path mapping configured in `tsconfig.json` for cleaner imports. Data is imported directly as `import data from "../data.json"` in components.

## Task Management

When working with business process data:
- Filter by priority: high (42 tasks), medium (35), low (16)
- Status options: pending, in_progress, completed
- All current tasks are "pending" status
- Task IDs are unique across all categories/subcategories