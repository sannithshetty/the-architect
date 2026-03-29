# Architecture Components

## Overview
The Architect is a React + TypeScript UI application that generates interactive architectural diagrams from software requirements. v0.2.0 adds multi-graph workspace, state management, templates, plugins, and enhanced UX.

## Components

### 1. RequirementsPanel
- **Responsibility**: Accepts user requirements as text input and parses them into structured data
- **Dependencies**: React, internal parsing utilities
- **Data Flow**: User text → parsed requirements → ArchitectureEngine
- **Deployment**: Client-side (browser)

### 2. ArchitectureCanvas
- **Responsibility**: Renders interactive architecture diagrams using React Flow (nodes, edges, MiniMap, interactive edge creation)
- **Dependencies**: React Flow (@xyflow/react), ArchitectureEngine
- **Data Flow**: Zustand store → nodes/edges → visual diagram; user interactions → store updates
- **Deployment**: Client-side (browser)

### 3. ComponentPalette
- **Responsibility**: Provides clickable architecture component templates (8 built-in types)
- **Dependencies**: React, architecture types
- **Data Flow**: User clicks → store.addComponent
- **Deployment**: Client-side (browser)

### 4. PropertiesPanel
- **Responsibility**: Shows and edits properties of selected architecture components
- **Dependencies**: React
- **Data Flow**: Selected node from store → properties form → store.updateComponent
- **Deployment**: Client-side (browser)

### 5. ArchitectureEngine
- **Responsibility**: Core logic that analyzes requirements and generates architecture graph (nodes + edges)
- **Dependencies**: Internal parsing utilities, architecture templates
- **Data Flow**: Parsed requirements → template matching → architecture graph
- **Deployment**: Client-side (browser)

### 6. ExportService
- **Responsibility**: Exports architecture diagrams as PNG/JSON
- **Dependencies**: html-to-image, React Flow
- **Data Flow**: Canvas state → exported file
- **Deployment**: Client-side (browser)

### 7. ImportService (v0.2.0)
- **Responsibility**: Imports and validates architecture graphs from JSON files
- **Dependencies**: Architecture types
- **Data Flow**: JSON file → validation → Zustand store
- **Deployment**: Client-side (browser)

### 8. GraphStore (v0.2.0)
- **Responsibility**: Global state management for multi-graph workspace with undo/redo and localStorage persistence
- **Dependencies**: Zustand, zundo, ArchitectureEngine
- **Data Flow**: Central store → all UI components; UI actions → store mutations → persistence
- **Deployment**: Client-side (browser)

### 9. GraphTabs (v0.2.0)
- **Responsibility**: Tab bar for switching between multiple graphs, with create/rename/duplicate/delete
- **Dependencies**: React, GraphStore
- **Data Flow**: User tab interactions → store.setActiveGraph / createGraph / deleteGraph
- **Deployment**: Client-side (browser)

### 10. TemplateSelector (v0.2.0)
- **Responsibility**: Presents pre-built architecture templates (Microservices, Serverless, Monolith, Event-Driven)
- **Dependencies**: React, templates engine, GraphStore
- **Data Flow**: Template selection → deep clone → store.createGraph
- **Deployment**: Client-side (browser)

### 11. PluginRegistry (v0.2.0)
- **Responsibility**: Registry for plugin-provided component types; manages registration, lookup, and enumeration
- **Dependencies**: Plugin type definitions
- **Data Flow**: Plugins register → registry stores → PluginPalette queries
- **Deployment**: Client-side (browser)

### 12. PluginPalette (v0.2.0)
- **Responsibility**: Displays plugin-provided component types grouped by category
- **Dependencies**: React, PluginRegistry, GraphStore
- **Data Flow**: Registry components → categorized buttons → store.addComponent
- **Deployment**: Client-side (browser)

### 13. SearchBar (v0.2.0)
- **Responsibility**: Real-time search and filter for components in the active graph
- **Dependencies**: React, architecture types
- **Data Flow**: User query → filtered components → onSelectComponent callback
- **Deployment**: Client-side (browser)

### 14. ErrorBoundary (v0.2.0)
- **Responsibility**: Catches rendering errors in child components and displays fallback UI
- **Dependencies**: React
- **Data Flow**: Child error → error state → fallback UI → reset option
- **Deployment**: Client-side (browser)

### 15. KeyboardShortcuts Hook (v0.2.0)
- **Responsibility**: Handles keyboard shortcuts (undo, redo, delete, escape)
- **Dependencies**: React, GraphStore, zundo temporal
- **Data Flow**: Keyboard events → store actions (undo/redo/remove/deselect)
- **Deployment**: Client-side (browser)

### 16. Docker Infrastructure (v0.2.2)
- **Responsibility**: Containerizes the application for production deployment using multi-stage Docker build with nginx
- **Dependencies**: Docker, nginx:alpine, node:20-alpine (build stage only)
- **Data Flow**: Vite build output → nginx static file server → browser client
- **Deployment**: Docker container (nginx serving static files on port 80, mapped to host port 8080)
- **File Scope Note**: Docker files (`Dockerfile`, `docker-compose.yml`, `nginx.conf`, `.dockerignore`) must reside at the project root per Docker convention — they cannot be placed inside `src/`

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          App Shell                               │
│  ┌─────────────────┐                                            │
│  │  ErrorBoundary   │ wraps entire app                          │
│  └────────┬─────────┘                                            │
│           │                                                      │
│  ┌────────┴──────────────────────────────────────────────────┐   │
│  │                    Zustand GraphStore                      │   │
│  │  (multi-graph, undo/redo via zundo, localStorage persist) │   │
│  └────┬──────┬──────┬───────┬──────┬────────┬────────────────┘   │
│       │      │      │       │      │        │                    │
│  ┌────▼───┐ ┌▼─────┐┌▼─────┐┌▼────┐┌▼──────┐┌▼──────────────┐  │
│  │Require-│ │Graph ││Templ-││Comp.││Plugin ││ArchitectureCanvas│ │
│  │ments   │ │Tabs  ││ate   ││Pale-││Pale-  ││(ReactFlow +     │ │
│  │Panel   │ │      ││Selec-││tte  ││tte    ││MiniMap + edges) │ │
│  └────────┘ └──────┘│tor   │└─────┘└───────┘└─────────────────┘ │
│                     └──────┘                                     │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐   │
│  │Properties│ │ SearchBar │ │  Export    │ │  Import         │   │
│  │Panel     │ │           │ │  Service   │ │  Service        │   │
│  └──────────┘ └───────────┘ └───────────┘ └─────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Plugin Registry                              │    │
│  │  ┌─────────────┐ ┌──────────┐ ┌──────────────────┐      │    │
│  │  │Infrastructure│ │ Security │ │ Observability     │      │    │
│  │  │  Plugin      │ │  Plugin  │ │  Plugin           │      │    │
│  │  └─────────────┘ └──────────┘ └──────────────────┘      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌───────────────────────────────┐                               │
│  │  Keyboard Shortcuts Hook      │                               │
│  │  (Ctrl+Z, Ctrl+Y, Del, Esc)  │                               │
│  └───────────────────────────────┘                               │
└──────────────────────────────────────────────────────────────────┘
```
