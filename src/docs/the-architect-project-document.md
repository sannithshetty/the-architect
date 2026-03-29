# The Architect — Complete Project Document

## 1. Project Overview

**The Architect** is an advanced multi-graph architecture design platform built as a client-side React + TypeScript single-page application. It enables users to generate interactive architectural diagrams from free-text software requirements, or build them manually using a component palette. The application runs entirely in the browser with no backend dependencies.

- **Name**: the-architect-app
- **Version**: 0.2.0
- **Tech Stack**: React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4, React Flow (@xyflow/react), Zustand, zundo
- **Deployment**: Static SPA — serve `dist/` from any web server or CDN
- **Access URL**: `http://localhost:5173` (default Vite dev server)

---

## 2. Architecture & Tech Stack

### 2.1 Technology Choices

| Technology | Purpose |
|---|---|
| React 19 | UI rendering and component model |
| TypeScript 5.9 | Static typing and developer experience |
| Vite 8 | Build tool, dev server, and HMR |
| @xyflow/react (React Flow) | Interactive node-based canvas for diagrams |
| Zustand 5 | Lightweight global state management |
| zundo 2 | Undo/redo middleware for Zustand (50-step history) |
| Tailwind CSS 4 | Utility-first styling with Vite plugin integration |
| html-to-image | PNG export of canvas diagrams |
| Vitest 4 | Unit and integration testing framework |

### 2.2 Project Structure

```
the-architect/
├── src/
│   ├── App.tsx                          # Root application component
│   ├── main.tsx                         # React entry point
│   ├── index.css                        # Global styles (Tailwind)
│   ├── types/
│   │   └── architecture.ts             # Core type definitions
│   ├── engine/
│   │   ├── architectureEngine.ts       # Requirements parser & graph generator
│   │   ├── exportService.ts            # JSON and PNG export
│   │   ├── importService.ts            # JSON import with validation
│   │   └── templates.ts                # Pre-built architecture templates
│   ├── store/
│   │   └── graphStore.ts               # Zustand store (multi-graph, undo/redo, persistence)
│   ├── components/
│   │   ├── ArchitectureCanvas.tsx       # React Flow canvas with MiniMap
│   │   ├── ArchitectureNode.tsx         # Custom node renderer
│   │   ├── RequirementsPanel.tsx        # Text input for requirements
│   │   ├── ComponentPalette.tsx         # Built-in component type buttons
│   │   ├── PluginPalette.tsx            # Plugin-provided component buttons
│   │   ├── PropertiesPanel.tsx          # Selected component editor
│   │   ├── GraphTabs.tsx                # Multi-graph tab bar
│   │   ├── TemplateSelector.tsx         # Template picker
│   │   ├── SearchBar.tsx                # Component search/filter
│   │   └── ErrorBoundary.tsx            # Error boundary with fallback UI
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts     # Global keyboard shortcut handler
│   └── plugins/
│       ├── types.ts                     # Plugin interface definitions
│       ├── pluginRegistry.ts            # Plugin registration and lookup
│       └── builtinPlugins.ts            # 3 built-in plugins
├── docs/architecture/
│   └── components.md                    # Architecture component documentation
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── PLANS.md                             # Implementation milestones
├── RELEASE.md                           # Release notes
└── context.md                           # Design decisions and constraints
```

### 2.3 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        ErrorBoundary                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Zustand GraphStore                       │  │
│  │  (multi-graph, undo/redo, localStorage persistence)       │  │
│  └──┬──────┬──────┬───────┬──────┬────────┬─────────────────┘  │
│     │      │      │       │      │        │                    │
│  ┌──▼───┐ ┌▼────┐┌▼─────┐┌▼────┐┌▼──────┐┌▼────────────────┐ │
│  │Requi-│ │Graph││Templ-││Comp.││Plugin ││ArchitectureCanvas│ │
│  │ments │ │Tabs ││Selec-││Pale-││Palet- ││(ReactFlow+MiniMap│ │
│  │Panel │ │     ││tor   ││tte  ││te     ││+edge creation)   │ │
│  └──────┘ └─────┘└──────┘└─────┘└───────┘└──────────────────┘ │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │Properties│ │SearchBar│ │Export    │ │Import             │  │
│  │Panel     │ │         │ │Service   │ │Service            │  │
│  └──────────┘ └─────────┘ └──────────┘ └───────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Plugin Registry                          │  │
│  │  ┌──────────────┐ ┌──────────┐ ┌──────────────────┐     │  │
│  │  │Infrastructure│ │ Security │ │ Observability     │     │  │
│  │  └──────────────┘ └──────────┘ └──────────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────┐                           │
│  │  Keyboard Shortcuts Hook        │                           │
│  │  (Ctrl+Z, Ctrl+Y, Del, Esc)    │                           │
│  └─────────────────────────────────┘                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Functionality

### 3.1 Requirements-Based Architecture Generation

The **ArchitectureEngine** (`src/engine/architectureEngine.ts`) analyzes free-text requirements using keyword matching to automatically generate architecture diagrams.

**Operation Details:**
1. User enters requirements text in the **RequirementsPanel**
2. `parseRequirements(text)` scans the text for known keywords (sorted longest-first for specificity)
3. Each matched keyword maps to one or more `ComponentType` values (e.g., "web app" → `['client', 'gateway', 'service']`)
4. `generateArchitecture(requirements)` creates positioned components in a grid layout (4 columns, 250px column width, 120px row height)
5. Connections are generated using two strategies:
   - **Within-group chaining**: Components from the same keyword are chained sequentially
   - **Cross-group linking**: Gateways connect to services, services connect to databases across groups
6. The resulting `ArchitectureGraph` is rendered on the canvas via React Flow

**Supported Keywords** (30+):
- User-facing: `web app`, `mobile app`, `frontend`, `ui`
- API/Networking: `api`, `rest api`, `graphql`, `microservice`, `load balancer`
- Data: `database`, `sql`, `nosql`, `data`, `storage`, `file upload`
- Messaging: `queue`, `message`, `event`, `notification`, `real-time`
- Performance: `cache`, `caching`, `performance`, `scalab`
- Auth: `auth`, `login`, `user`
- Processing: `search`, `payment`, `email`, `analytics`, `logging`, `monitoring`

### 3.2 Multi-Graph Workspace

The **GraphStore** (`src/store/graphStore.ts`) manages a workspace of multiple architecture graphs.

**Operation Details:**
- Each graph is stored as a `GraphEntry` with: `id`, `name`, `graph` (components + connections), `createdAt`, `updatedAt`
- The `activeGraphId` determines which graph is displayed on the canvas
- **Graph CRUD**: `createGraph(name)`, `deleteGraph(id)`, `renameGraph(id, name)`, `duplicateGraph(id)`
- **Tab Interface** (`GraphTabs`): Visual tabs for switching, double-click to rename, "+" button to create, "x" button to delete
- First load auto-creates an "Untitled" graph if the workspace is empty
- Graph IDs use `graph-{timestamp}-{counter}` format for uniqueness

### 3.3 State Management (Zustand)

**Operation Details:**
- **Zustand store** provides global state accessible by all components via `useGraphStore()` hook
- **Middleware stack**: `persist` (localStorage) → `temporal` (undo/redo) → core store
- **Persistence**: Workspace state (graphs array + activeGraphId) persists to `localStorage` under key `"architect-workspace"`. The `partialize` option excludes `selectedComponentId` from persistence.
- **Undo/Redo**: `zundo` temporal middleware maintains a 50-step history buffer. Triggered via keyboard shortcuts or programmatic calls.
- **Component operations**: `addComponent`, `removeComponent`, `updateComponent`, `updatePosition`, `addConnection`, `removeConnection`
- All mutations on the active graph go through the `updateActiveGraph` helper which updates the correct graph entry and sets `updatedAt`

### 3.4 Interactive Canvas

The **ArchitectureCanvas** (`src/components/ArchitectureCanvas.tsx`) provides the main visual workspace.

**Operation Details:**
- Built on **React Flow** (@xyflow/react) with custom `ArchitectureNode` node type
- **Features**: pan, zoom, drag nodes, fit-to-view on load, dot-grid background
- **MiniMap**: Pannable and zoomable overview in the bottom-right corner; node colors match component type
- **Interactive Edge Creation**: Drag from source handle to target handle to create connections; default label "connects to"
- **Edge Styling**: Animated edges with directional arrows (`MarkerType.ArrowClosed`), slate color scheme
- **Controls**: Zoom in/out and fit-view buttons (dark-themed)
- **Node Selection**: Click node to select (shows in PropertiesPanel), click canvas background to deselect
- **Edge Removal**: Edge changes of type 'remove' are propagated to the store

### 3.5 Component Palette

Two palettes provide component types for manual diagram building:

**Built-in ComponentPalette** (8 types):
| Type | Label | Color |
|---|---|---|
| service | Service | #3b82f6 (blue) |
| database | Database | #8b5cf6 (violet) |
| queue | Message Queue | #f59e0b (amber) |
| cache | Cache | #ef4444 (red) |
| gateway | API Gateway | #10b981 (emerald) |
| client | Client App | #6366f1 (indigo) |
| storage | Object Storage | #ec4899 (pink) |
| loadbalancer | Load Balancer | #14b8a6 (teal) |

**PluginPalette** (10 plugin-provided types — see Section 3.8)

### 3.6 Properties Panel

The **PropertiesPanel** allows editing selected component properties.

**Operation Details:**
- Displays when a component is selected on the canvas
- Editable fields: `label` (text input), `description` (text input)
- Delete button to remove the component and all its connections
- Changes are immediately persisted to the Zustand store

### 3.7 Templates

The **TemplateSelector** (`src/components/TemplateSelector.tsx`) offers 4 pre-built architecture templates.

| Template | Description | Components | Connections |
|---|---|---|---|
| **Microservices** | API Gateway with multiple services, databases, cache, and message queue | 12 | 11 |
| **Serverless** | API Gateway with Lambda functions, DynamoDB, and S3 | 8 | 8 |
| **Monolith** | Traditional 3-tier: load balancer, app servers, database with replica | 7 | 8 |
| **Event-Driven** | CQRS pattern with event sourcing, message broker, separate read/write stores | 8 | 8 |

**Operation**: Selecting a template deep-clones the graph and creates a new graph entry in the workspace.

### 3.8 Plugin Architecture

The **Plugin System** (`src/plugins/`) extends The Architect with custom component types.

**Plugin Interface** (`ArchitectPlugin`):
```typescript
{
  id: string          // Unique plugin identifier
  name: string        // Display name
  version: string     // Semantic version
  description: string // Short description
  components: PluginComponentDef[]
}
```

**PluginComponentDef**:
```typescript
{
  type: string        // Unique type key
  label: string       // Display label
  color: string       // Hex color for node border
  description: string // Short description
  category: 'infrastructure' | 'security' | 'observability' | 'networking' | 'custom'
}
```

**PluginRegistry** operations:
- `register(plugin)` — adds a plugin (throws if ID already registered)
- `unregister(pluginId)` — removes a plugin
- `getPlugin(pluginId)` — lookup by ID
- `getAllPlugins()` — list all registered plugins
- `getAllComponents()` — flat list of all plugin-provided component definitions
- `getComponentDef(type)` — lookup a specific component definition by type
- `clear()` — remove all plugins

**Built-in Plugins** (3 plugins, 10 component types):

| Plugin | Components |
|---|---|
| **Infrastructure** | CDN (#f97316), DNS (#84cc16), Container (#06b6d4), Lambda (#a855f7) |
| **Security** | Firewall (#dc2626), Identity Provider (#7c3aed), Secret Vault (#b91c1c) |
| **Observability** | Monitoring (#eab308), Log Aggregator (#22c55e), Distributed Tracing (#0ea5e9) |

### 3.9 Export & Import

**Export Service** (`src/engine/exportService.ts`):
- `downloadJson(graph)` — downloads the graph as `architecture.json` (pretty-printed JSON with components and connections arrays)
- `downloadPng(element)` — captures the React Flow canvas as `architecture.png` using `html-to-image` with dark background (#111827)

**Import Service** (`src/engine/importService.ts`):
- `importJson(jsonString)` — parses and validates JSON, returns `{ valid, graph?, error? }`
- **Validation checks**: valid JSON, object structure, `components` array, `connections` array, each component has `id/type/label/description/x/y`, each connection has `id/source/target/label`, referential integrity (connection source/target exist in components)
- Imported graphs are added as new graph entries in the workspace

### 3.10 Search

The **SearchBar** (`src/components/SearchBar.tsx`) provides real-time filtering.

**Operation Details:**
- Searches components by `label`, `type`, or `description`
- Case-insensitive matching
- Clicking a result selects the component on the canvas
- Located in the toolbar between the component count and export buttons

### 3.11 Keyboard Shortcuts

The **useKeyboardShortcuts** hook (`src/hooks/useKeyboardShortcuts.ts`) provides global keyboard shortcuts.

| Shortcut | Action |
|---|---|
| Ctrl+Z / Cmd+Z | Undo (via zundo temporal store) |
| Ctrl+Y / Cmd+Y / Ctrl+Shift+Z | Redo (via zundo temporal store) |
| Delete / Backspace | Remove selected component |
| Escape | Deselect component |

Shortcuts are disabled when focus is on `<input>`, `<textarea>`, or `contentEditable` elements.

### 3.12 Error Boundary

The **ErrorBoundary** (`src/components/ErrorBoundary.tsx`) wraps the entire application.

**Operation Details:**
- Catches React rendering errors in any child component
- Displays a fallback UI with error message
- Provides a reset/recovery button to restore the app
- Prevents full-page crashes from propagating

---

## 4. Use Cases

### Use Case 1: Generate Architecture from Requirements
**Actor**: Developer / Architect
**Flow**:
1. Open The Architect in a web browser
2. In the left sidebar, type requirements into the text area (e.g., "I need a web app with user authentication, a REST API, a PostgreSQL database, and Redis caching")
3. Click "Generate"
4. The engine parses keywords and generates a diagram on the canvas with components and connections
5. Drag components to rearrange the layout
6. Click components to view/edit properties in the sidebar

### Use Case 2: Build Architecture Manually
**Actor**: Developer / Architect
**Flow**:
1. Click component buttons in the **Component Palette** (Service, Database, Queue, etc.) to add nodes
2. Click plugin component buttons in the **Plugin Palette** for extended types (CDN, Firewall, Monitoring, etc.)
3. Drag from a node's source handle to another node's target handle to create connections
4. Click a node, then edit its label and description in the **Properties Panel**
5. Delete unwanted components via the Properties Panel delete button or the Delete key

### Use Case 3: Use a Pre-built Template
**Actor**: Developer / Architect
**Flow**:
1. In the left sidebar, scroll to the **Templates** section
2. Click one of the 4 templates (Microservices, Serverless, Monolith, Event-Driven)
3. A new graph tab is created with the complete template diagram
4. Customize the template by adding/removing/editing components

### Use Case 4: Manage Multiple Architecture Graphs
**Actor**: Developer / Architect
**Flow**:
1. Click the "+" button in the tab bar to create a new graph
2. Switch between graphs by clicking their tabs
3. Double-click a tab to rename the graph
4. Right-click or use the "x" button to delete a graph
5. Duplicate a graph to create a copy for experimentation
6. All graphs persist in localStorage — closing and reopening the browser restores the workspace

### Use Case 5: Export and Share Architecture
**Actor**: Developer / Architect
**Flow**:
1. Design the architecture on the canvas
2. Click **Export JSON** to download the graph as a `.json` file (machine-readable, re-importable)
3. Click **Export PNG** to download a screenshot of the canvas (for presentations, documentation)
4. Share the JSON file with a colleague

### Use Case 6: Import an Architecture
**Actor**: Developer / Architect
**Flow**:
1. Click **Import JSON** in the toolbar
2. Select a `.json` file exported previously from The Architect
3. The import service validates the structure, types, and referential integrity
4. If valid, a new graph tab is created with the imported diagram
5. If invalid, an error is logged with the specific validation failure

### Use Case 7: Undo/Redo Changes
**Actor**: Developer / Architect
**Flow**:
1. Make changes to the diagram (add, move, delete components or connections)
2. Press **Ctrl+Z** (or Cmd+Z on Mac) to undo the last change
3. Press **Ctrl+Y** (or Ctrl+Shift+Z) to redo
4. Up to 50 undo steps are available per session

### Use Case 8: Search and Navigate Components
**Actor**: Developer / Architect
**Flow**:
1. In a large diagram, click the search bar in the toolbar
2. Type a component name, type, or description keyword
3. Matching components appear in a dropdown
4. Click a result to select and focus on that component

### Use Case 9: Extend with Custom Plugins
**Actor**: Developer
**Flow**:
1. Define a new plugin implementing the `ArchitectPlugin` interface
2. Register it with `pluginRegistry.register(myPlugin)`
3. The new component types appear in the **Plugin Palette** grouped by category
4. Users can add the custom components to any graph

### Use Case 10: Feed to Antigravity for Web Application Testing
**Actor**: QA Engineer / Developer
**Flow**:
1. Design the target system architecture in The Architect
2. Export the architecture as JSON
3. Feed the JSON to Antigravity to test the web application against the documented architecture
4. The JSON includes all component types, labels, descriptions, positions, and connection topology — providing a complete system map for testing

---

## 5. Operation Details

### 5.1 Development

```bash
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### 5.2 Data Model

**ArchitectureComponent**:
```typescript
{
  id: string          // Unique identifier (e.g., "service-1")
  type: ComponentType // "service" | "database" | "queue" | "cache" | "gateway" | "client" | "storage" | "loadbalancer"
  label: string       // Display name (e.g., "Auth Service")
  description: string // Description (e.g., "Handles authentication")
  x: number           // Canvas X position
  y: number           // Canvas Y position
}
```

**ArchitectureConnection**:
```typescript
{
  id: string     // Unique identifier (e.g., "edge-1")
  source: string // Source component ID
  target: string // Target component ID
  label: string  // Connection label (e.g., "reads/writes", "HTTPS")
}
```

**ArchitectureGraph**:
```typescript
{
  components: ArchitectureComponent[]
  connections: ArchitectureConnection[]
}
```

**GraphEntry** (workspace):
```typescript
{
  id: string                    // Unique graph ID
  name: string                  // Display name (e.g., "My Microservices")
  graph: ArchitectureGraph      // The graph data
  createdAt: number             // Unix timestamp
  updatedAt: number             // Unix timestamp
}
```

### 5.3 State Persistence

- **Storage**: `localStorage` under key `"architect-workspace"`
- **Persisted data**: `graphs` array and `activeGraphId`
- **Not persisted**: `selectedComponentId` (transient UI state)
- **Size limit**: ~5MB (browser localStorage limit). Graphs with >500 components may approach this.
- **Serialization**: JSON via Zustand `persist` middleware

### 5.4 Export Formats

**JSON Export** (re-importable):
```json
{
  "components": [
    {
      "id": "service-1",
      "type": "service",
      "label": "Auth Service",
      "description": "Authentication & authorization",
      "x": 50,
      "y": 380
    }
  ],
  "connections": [
    {
      "id": "edge-1",
      "source": "service-1",
      "target": "database-1",
      "label": "reads/writes"
    }
  ]
}
```

**PNG Export**: Full canvas screenshot with dark background (#111827), full quality.

### 5.5 Constraints & Limits

| Constraint | Value |
|---|---|
| Max undo/redo steps | 50 |
| localStorage capacity | ~5MB |
| Recommended max components per graph | ~100 (React Flow performance) |
| Max graphs | Unlimited (limited by localStorage capacity) |
| Backend dependencies | None (fully client-side) |
| API keys required | None |
| Browser support | Modern browsers with ES2020+ support |

### 5.6 Testing

- **Framework**: Vitest 4 with jsdom environment
- **Libraries**: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- **Test locations**: Colocated in `__tests__/` directories alongside source files
- **Run**: `npm run test` (single run) or `npm run test:watch` (watch mode)
- **Coverage areas**: Store operations, templates, import validation, plugin registry, UI components, search, error boundary

---

## 6. Extending The Architect

### 6.1 Adding a New Built-in Component Type

1. Add the type to `ComponentType` union in `src/types/architecture.ts`
2. Add color to `COMPONENT_COLORS`
3. Add label to `COMPONENT_LABELS`
4. Optionally add keyword mapping in `src/engine/architectureEngine.ts`

### 6.2 Adding a New Plugin

1. Create a new file in `src/plugins/` implementing `ArchitectPlugin`
2. Define component types with unique `type` keys, colors, and categories
3. Register in the plugin initialization code
4. Components automatically appear in the PluginPalette

### 6.3 Adding a New Template

1. Add a new `ArchitectureTemplate` entry to the `TEMPLATES` array in `src/engine/templates.ts`
2. Define the `id`, `name`, `description`, and full `graph` (components + connections)
3. The template automatically appears in the TemplateSelector

---

## 7. JSON Schema Reference (for Antigravity Integration)

The exported JSON follows this schema for use with external testing tools:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["components", "connections"],
  "properties": {
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "label", "description", "x", "y"],
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["service", "database", "queue", "cache", "gateway", "client", "storage", "loadbalancer"] },
          "label": { "type": "string" },
          "description": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" }
        }
      }
    },
    "connections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "source", "target", "label"],
        "properties": {
          "id": { "type": "string" },
          "source": { "type": "string", "description": "Must reference a component ID" },
          "target": { "type": "string", "description": "Must reference a component ID" },
          "label": { "type": "string" }
        }
      }
    }
  }
}
```

This schema ensures exported architectures can be consumed by Antigravity or any JSON-compatible testing/analysis tool to understand the system topology, component types, and data flow relationships.

---

## 8. End-to-End System Flow

This section describes the complete data flow through The Architect, from application startup to architecture export.

### 8.1 Application Initialization

```
Browser loads index.html
  → main.tsx mounts <App /> into #root
  → App component initializes:
    1. Zustand store hydrates from localStorage ("architect-workspace")
    2. If no graphs exist, createGraph("Untitled") is called
    3. Active graph is set (first graph or previously active)
    4. useKeyboardShortcuts() hook registers global key listeners
    5. PluginPalette triggers plugin initialization (registers 3 built-in plugins)
    6. React Flow canvas renders with the active graph's nodes and edges
```

### 8.2 Requirements-to-Diagram Flow

```
User types requirements text in RequirementsPanel
  → Clicks "Generate Architecture"
  → App.handleGenerate(text) is called
  → parseRequirements(text) scans for 30+ keywords (longest-first matching)
  → Returns ParsedRequirement[] with component types
  → generateArchitecture(requirements) creates:
     1. Components positioned in a 4-column grid (250px × 120px cells)
     2. Within-group connections (same keyword → sequential chain)
     3. Cross-group connections (gateway→service, service→database)
  → store.importGraph(generatedGraph) creates a new GraphEntry
  → React Flow re-renders with new nodes and edges
  → MiniMap updates to show new diagram overview
```

### 8.3 Manual Building Flow

```
User clicks component in ComponentPalette or PluginPalette
  → store.addComponent(type, label, x, y) adds to active graph
  → React Flow renders new node on canvas
  → User drags from source handle to target handle
  → onConnect callback → store.addConnection(source, target)
  → Animated edge with directional arrow appears
  → User clicks node → store.setSelectedComponent(id)
  → PropertiesPanel shows label/description fields
  → User edits fields → store.updateComponent(id, updates)
  → Changes persist to localStorage automatically
```

### 8.4 State Mutation Flow

```
Any user action (add/remove/edit/move/connect)
  → Zustand store mutation (e.g., store.addComponent)
  → updateActiveGraph helper:
     1. Finds active graph in graphs array
     2. Applies mutation to graph data (immutable update)
     3. Sets updatedAt to current timestamp
  → zundo temporal middleware:
     1. Snapshots previous state to undo history (max 50 entries)
  → persist middleware:
     1. Serializes {graphs, activeGraphId} to JSON
     2. Writes to localStorage under "architect-workspace"
  → React re-renders all subscribed components
```

### 8.5 Export Flow

```
JSON Export:
  User clicks "Export JSON"
  → downloadJson(activeGraph) is called
  → Graph serialized to pretty-printed JSON
  → Browser downloads "architecture.json"

PNG Export:
  User clicks "Export PNG"
  → downloadPng(canvasElement) is called
  → html-to-image captures React Flow canvas
  → Dark background (#111827) applied
  → Browser downloads "architecture.png"
```

### 8.6 Import Flow

```
User clicks "Import JSON"
  → File picker opens (accepts .json)
  → FileReader reads selected file
  → importJson(jsonString) validates:
     1. Valid JSON syntax
     2. Top-level object with components[] and connections[]
     3. Each component has id, type, label, description, x, y
     4. Each connection has id, source, target, label
     5. Referential integrity: all source/target IDs exist in components
  → If valid: store.importGraph(graph) creates new GraphEntry tab
  → If invalid: error logged with specific validation failure message
```

### 8.7 Error Recovery Flow

```
React rendering error occurs in any child component
  → ErrorBoundary.componentDidCatch captures the error
  → Fallback UI displayed with error message
  → User clicks "Reset" button
  → ErrorBoundary resets error state
  → App re-renders normally
  → Zustand store state preserved (persisted in localStorage)
```

---

## 9. Antigravity Integration Guide

This section provides detailed guidance for feeding The Architect's output to Antigravity for web application testing.

### 9.1 What Antigravity Receives

The exported JSON provides a complete architectural map of the target system:

| Field | Purpose for Testing |
|---|---|
| `components[].type` | Identifies infrastructure category (service, database, gateway, etc.) — determines test strategies per component |
| `components[].label` | Human-readable name — maps to actual service/endpoint names in the system under test |
| `components[].description` | Functional description — informs what each component does and what to test |
| `components[].x, .y` | Layout positions — can be used to understand architectural layers (gateways at top, databases at bottom) |
| `connections[].source, .target` | Dependency graph — identifies integration points, data flow paths, and failure propagation chains |
| `connections[].label` | Connection semantics — describes the protocol or relationship (e.g., "HTTPS", "reads/writes", "publishes to") |

### 9.2 Testing Strategies by Component Type

| Component Type | Suggested Test Focus |
|---|---|
| `gateway` | API endpoint availability, routing rules, rate limiting, authentication |
| `service` | Business logic, request/response contracts, error handling |
| `database` | Schema validation, query performance, data integrity |
| `queue` | Message delivery, ordering, dead-letter handling |
| `cache` | Hit/miss rates, TTL behavior, invalidation |
| `loadbalancer` | Traffic distribution, health checks, failover |
| `client` | UI rendering, user flows, accessibility |
| `storage` | Upload/download, access control, size limits |

### 9.3 Topology Analysis for Test Planning

The connection graph enables Antigravity to:

1. **Identify critical paths**: Trace from `client` → `gateway` → `service` → `database` to find the most important end-to-end flows
2. **Map failure domains**: If a `database` component has 4 inbound connections from services, its failure affects all 4 services
3. **Detect single points of failure**: Components with high in-degree (many dependents) are critical for availability testing
4. **Plan integration tests**: Each `connection` represents an integration point that needs contract testing
5. **Determine test order**: Topological sort of connections suggests bottom-up test execution (databases → services → gateways → clients)

### 9.4 Sample Workflow

```
1. Developer designs system architecture in The Architect
2. Exports as JSON via "Export JSON" button
3. Feeds JSON to Antigravity:
   - Antigravity parses components[] to discover all system parts
   - Parses connections[] to build dependency graph
   - Generates test plan based on component types and topology
   - Executes web application tests against the documented architecture
4. Test results map back to component IDs for traceability
```

### 9.5 Plugin Component Types in Export

When plugin components (CDN, Firewall, Monitoring, etc.) are used in diagrams, their `type` field contains the plugin-defined type string (e.g., `"cdn"`, `"firewall"`, `"monitoring"`). Antigravity should handle these extended types in addition to the 8 built-in types:

| Plugin Type | Category | Test Focus |
|---|---|---|
| `cdn` | infrastructure | Cache headers, origin failover, edge distribution |
| `dns` | infrastructure | Resolution, TTL, failover records |
| `container` | infrastructure | Container health, resource limits, orchestration |
| `lambda` | infrastructure | Cold start, timeout, concurrency limits |
| `firewall` | security | Rule enforcement, blocked request handling |
| `identity-provider` | security | OAuth/OIDC flows, token validation |
| `secret-vault` | security | Secret rotation, access policies |
| `monitoring` | observability | Alert thresholds, metric collection |
| `log-aggregator` | observability | Log ingestion, search, retention |
| `distributed-tracing` | observability | Trace propagation, span collection |

---

## 10. Web UI Element Inventory (for Antigravity Web Testing)

This section provides a complete inventory of all interactive UI elements, their `data-testid` selectors, element types, and the actions they support. Antigravity can use these selectors to locate and interact with every element in the application.

### 10.1 Global Layout

| Region | CSS Selector | Description |
|---|---|---|
| Root container | `div.flex.h-screen` | Full-screen flex layout (dark bg) |
| Left sidebar | `aside.w-72` | 288px fixed-width sidebar with scrollable panels |
| Main area | `main.flex-1` | Flex-grow area containing tabs, toolbar, and canvas |

### 10.2 Left Sidebar Elements

**Application Header**
| Element | Selector | Type | Action |
|---|---|---|---|
| App title | `h1` (text: "The Architect") | Heading | Display only |
| App subtitle | `p.text-xs` (text: "Advanced multi-graph...") | Text | Display only |

**Requirements Panel**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Requirements text area | `requirements-input` | `<textarea>` | Type requirements text |
| Generate button | `generate-btn` | `<button>` | Click to generate architecture from text |

**Template Selector**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Template section | `template-selector` | `<div>` | Container for template buttons |
| Microservices template | `template-microservices` | `<button>` | Click to create a new Microservices graph |
| Serverless template | `template-serverless` | `<button>` | Click to create a new Serverless graph |
| Monolith template | `template-monolith` | `<button>` | Click to create a new Monolith graph |
| Event-Driven template | `template-event-driven` | `<button>` | Click to create a new Event-Driven graph |

**Component Palette (Built-in)**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Service button | `palette-service` | `<button>` | Click to add a Service node |
| Database button | `palette-database` | `<button>` | Click to add a Database node |
| Queue button | `palette-queue` | `<button>` | Click to add a Message Queue node |
| Cache button | `palette-cache` | `<button>` | Click to add a Cache node |
| Gateway button | `palette-gateway` | `<button>` | Click to add an API Gateway node |
| Client button | `palette-client` | `<button>` | Click to add a Client App node |
| Storage button | `palette-storage` | `<button>` | Click to add an Object Storage node |
| Load Balancer button | `palette-loadbalancer` | `<button>` | Click to add a Load Balancer node |

**Plugin Palette**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Plugin palette container | `plugin-palette` | `<div>` | Container for plugin component buttons |
| CDN button | `plugin-cdn` | `<button>` | Click to add a CDN node |
| DNS button | `plugin-dns` | `<button>` | Click to add a DNS node |
| Container button | `plugin-container` | `<button>` | Click to add a Container node |
| Lambda button | `plugin-serverless` | `<button>` | Click to add a Lambda node |
| Firewall button | `plugin-firewall` | `<button>` | Click to add a Firewall node |
| Identity Provider button | `plugin-identity` | `<button>` | Click to add an Identity Provider node |
| Secret Vault button | `plugin-vault` | `<button>` | Click to add a Secret Vault node |
| Monitoring button | `plugin-monitor` | `<button>` | Click to add a Monitoring node |
| Log Aggregator button | `plugin-logger` | `<button>` | Click to add a Log Aggregator node |
| Distributed Tracing button | `plugin-tracer` | `<button>` | Click to add a Distributed Tracing node |

**Properties Panel**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Properties container | `properties-panel` | `<div>` | Visible only when a component is selected |
| Label input | `property-label` | `<input type="text">` | Edit the selected component's label |
| Description input | `property-description` | `<input type="text">` | Edit the selected component's description |
| Delete button | `delete-component-btn` | `<button>` | Delete the selected component and its connections |

### 10.3 Main Area Elements

**Graph Tabs**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Tab bar container | `graph-tabs` | `<div>` | Horizontal scrollable tab bar |
| Graph tab (dynamic) | `graph-tab-{graphId}` | `<div>` | Click to switch to this graph |
| Tab name | `span` inside tab | `<span>` | Double-click to start renaming |
| Rename input | `graph-tab-rename-input` | `<input>` | Type new name, Enter to confirm, Escape to cancel |
| Duplicate button (dynamic) | `graph-tab-duplicate-{graphId}` | `<button>` | Click to duplicate this graph (appears on hover) |
| Close button (dynamic) | `graph-tab-close-{graphId}` | `<button>` | Click to delete this graph (appears on hover, hidden if only 1 graph) |
| New graph button | `graph-tab-new` | `<button>` | Click to create a new empty graph |

**Toolbar**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Component/connection count | — (CSS: `span.text-sm.text-gray-400`) | `<span>` | Display only: "{N} components · {M} connections" |
| Search bar | `search-bar` | `<div>` | Container for search functionality |
| Search input | `search-input` | `<input type="text">` | Type to search components by label/type/description |
| Search results dropdown | `search-results` | `<div>` | Appears when query has matches |
| Search result item (dynamic) | `search-result-{componentId}` | `<button>` | Click to select and focus on this component |
| Import JSON button | `import-json-btn` | `<button>` | Click to open file picker for JSON import |
| Export JSON button | `export-json-btn` | `<button>` | Click to download architecture as JSON (disabled if 0 components) |
| Export PNG button | `export-png-btn` | `<button>` | Click to download canvas as PNG (disabled if 0 components) |
| Hidden file input | `import-file-input` | `<input type="file" accept=".json">` | Programmatically triggered by Import JSON button |

**Architecture Canvas**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Canvas container | `architecture-canvas` | `<div>` | React Flow canvas — supports pan (drag bg), zoom (scroll), fit-view |
| Architecture node (dynamic) | `architecture-node` | `<div>` | Each component node — click to select, drag to move |
| Node source handle | `.react-flow__handle-bottom` | `<div>` | Drag from here to start creating a connection |
| Node target handle | `.react-flow__handle-top` | `<div>` | Drop here to complete a connection |
| MiniMap | `.react-flow__minimap` | `<svg>` | Pannable/zoomable overview in bottom-right |
| Controls | `.react-flow__controls` | `<div>` | Zoom in/out and fit-view buttons |

**Error Boundary (shown on error)**
| Element | data-testid | Type | Action |
|---|---|---|---|
| Error fallback | `error-boundary-fallback` | `<div>` | Displayed when a rendering error occurs |
| Reset button | `error-boundary-reset` | `<button>` | Click to reset the error state and re-render |

### 10.4 Keyboard Shortcuts

| Key Combination | Action | Condition |
|---|---|---|
| `Ctrl+Z` / `Cmd+Z` | Undo last action | Not focused on input/textarea |
| `Ctrl+Y` / `Cmd+Y` / `Ctrl+Shift+Z` | Redo last undone action | Not focused on input/textarea |
| `Delete` / `Backspace` | Remove selected component | Component selected, not focused on input/textarea |
| `Escape` | Deselect component | Component selected, not focused on input/textarea |

---

## 11. Store API Reference (Zustand)

The application state is managed by a single Zustand store accessible via `useGraphStore()`. This section documents every store method and selector for programmatic testing or integration.

### 11.1 State Shape

```typescript
interface GraphState {
  graphs: GraphEntry[]            // All workspace graphs
  activeGraphId: string | null    // Currently displayed graph ID
  selectedComponentId: string | null  // Currently selected node ID (transient, not persisted)
}

interface GraphEntry {
  id: string                      // Unique ID: "graph-{timestamp}-{counter}"
  name: string                    // Display name
  graph: ArchitectureGraph        // { components: [], connections: [] }
  createdAt: number               // Unix timestamp (ms)
  updatedAt: number               // Unix timestamp (ms)
}
```

### 11.2 Graph CRUD Operations

| Method | Signature | Description |
|---|---|---|
| `createGraph` | `(name: string, graph?: ArchitectureGraph) => string` | Creates a new graph (empty or from template), sets it active, returns new graph ID |
| `deleteGraph` | `(id: string) => void` | Removes graph; if it was active, switches to first remaining graph |
| `renameGraph` | `(id: string, name: string) => void` | Updates graph display name and `updatedAt` |
| `setActiveGraph` | `(id: string) => void` | Switches active graph, clears selection |
| `duplicateGraph` | `(id: string) => void` | Deep-clones graph with name "{name} (copy)", sets clone as active |
| `importGraph` | `(name: string, graph: ArchitectureGraph) => string` | Creates a new graph from imported data, sets it active, returns new graph ID |

### 11.3 Component Operations (on active graph)

| Method | Signature | Description |
|---|---|---|
| `setGraph` | `(graph: ArchitectureGraph) => void` | Replaces entire active graph (used by requirements generator) |
| `addComponent` | `(type: ComponentType, label: string, x: number, y: number) => void` | Adds a new component node at (x, y) with auto-generated ID |
| `removeComponent` | `(id: string) => void` | Removes component and all connections referencing it; clears selection if removed |
| `updateComponent` | `(id: string, updates: { label?: string; description?: string }) => void` | Partial update of component label and/or description |
| `updatePosition` | `(id: string, x: number, y: number) => void` | Updates component's canvas position (called during drag) |
| `addConnection` | `(source: string, target: string, label: string) => void` | Creates a new edge between two components |
| `removeConnection` | `(connectionId: string) => void` | Removes a specific connection by ID |

### 11.4 Selection

| Method | Signature | Description |
|---|---|---|
| `setSelectedComponent` | `(id: string \| null) => void` | Sets or clears the selected component |

### 11.5 Derived Selectors

| Function | Signature | Description |
|---|---|---|
| `getActiveGraph` | `(state: GraphState) => ArchitectureGraph` | Returns the active graph's data, or empty graph if none |
| `getSelectedComponent` | `(state: GraphState) => ArchitectureComponent \| null` | Returns the selected component object, or null |

### 11.6 Middleware Configuration

| Middleware | Configuration | Details |
|---|---|---|
| `persist` | Key: `"architect-workspace"`, storage: `localStorage` | Persists `graphs` and `activeGraphId`; excludes `selectedComponentId` |
| `temporal` (zundo) | Limit: `50` states | Undo/redo via `useGraphStore.temporal.getState().undo()` / `.redo()` |

---

## 12. Web Application Layout Map

This section describes the spatial layout of The Architect's single-page application for Antigravity to understand where elements are positioned on screen.

### 12.1 Page Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Full-Screen Layout (100vw × 100vh)                │
│  bg: gray-950 (#030712)    text: gray-100 (#f3f4f6)                    │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────┐ │
│  │  LEFT SIDEBAR     │  │  MAIN AREA (flex-1)                         │ │
│  │  w-72 (288px)     │  │                                              │ │
│  │  border-r gray-700│  │  ┌──────────────────────────────────────┐   │ │
│  │  overflow-y: auto │  │  │  GRAPH TABS BAR                      │   │ │
│  │                   │  │  │  bg: gray-900, border-b gray-700     │   │ │
│  │  ┌─────────────┐ │  │  │  [Tab 1] [Tab 2] [+]                 │   │ │
│  │  │ HEADER      │ │  │  └──────────────────────────────────────┘   │ │
│  │  │ "The        │ │  │  ┌──────────────────────────────────────┐   │ │
│  │  │  Architect" │ │  │  │  TOOLBAR                              │   │ │
│  │  └─────────────┘ │  │  │  bg: gray-900, border-b gray-700     │   │ │
│  │  ┌─────────────┐ │  │  │  [count] [search] [Import] [JSON]    │   │ │
│  │  │ REQUIREMENTS│ │  │  │                            [PNG]      │   │ │
│  │  │ PANEL       │ │  │  └──────────────────────────────────────┘   │ │
│  │  │ [textarea]  │ │  │  ┌──────────────────────────────────────┐   │ │
│  │  │ [Generate]  │ │  │  │  ARCHITECTURE CANVAS (flex-1)         │   │ │
│  │  └─────────────┘ │  │  │  React Flow with:                     │   │ │
│  │  ┌─────────────┐ │  │  │  - Dot grid background                │   │ │
│  │  │ TEMPLATES   │ │  │  │  - Draggable component nodes          │   │ │
│  │  │ [4 buttons] │ │  │  │  - Animated directed edges            │   │ │
│  │  └─────────────┘ │  │  │  - MiniMap (bottom-right)             │   │ │
│  │  ┌─────────────┐ │  │  │  - Controls (bottom-left)             │   │ │
│  │  │ COMPONENT   │ │  │  │  - Pan/zoom/fit-view                  │   │ │
│  │  │ PALETTE     │ │  │  └──────────────────────────────────────┘   │ │
│  │  │ [8 buttons] │ │  └──────────────────────────────────────────────┘ │
│  │  └─────────────┘ │                                                   │
│  │  ┌─────────────┐ │                                                   │
│  │  │ PLUGIN      │ │                                                   │
│  │  │ PALETTE     │ │                                                   │
│  │  │ [10 buttons]│ │                                                   │
│  │  └─────────────┘ │                                                   │
│  │  ┌─────────────┐ │                                                   │
│  │  │ PROPERTIES  │ │                                                   │
│  │  │ PANEL       │ │                                                   │
│  │  │ (if select.)│ │                                                   │
│  │  └─────────────┘ │                                                   │
│  └──────────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Sidebar Panels (top to bottom)

| Panel | Approx Position | Content | Visibility |
|---|---|---|---|
| Header | Top of sidebar | App name + subtitle | Always visible |
| Requirements Panel | Below header | Textarea + "Generate" button | Always visible |
| Template Selector | Below requirements | 4 template buttons (stacked vertically) | Always visible |
| Component Palette | Below templates | 8 component type buttons (grid) | Always visible |
| Plugin Palette | Below palette | 10 plugin component buttons (grouped by category) | Always visible |
| Properties Panel | Bottom of sidebar | Label input, description input, delete button | Only when a component is selected |

### 12.3 Main Area Sections (top to bottom)

| Section | Height | Content |
|---|---|---|
| Graph Tabs | ~40px | Horizontal scrollable tabs + "+" new graph button |
| Toolbar | ~44px | Component/connection count, search bar, import/export buttons |
| Canvas | Remaining space | React Flow interactive diagram area |

### 12.4 Component Node Layout

Each architecture node on the canvas renders as:

```
┌──────────────────────────┐
│  ○ Target Handle (top)   │  ← connection drop target
│                          │
│  ┌────────────────────┐  │
│  │ [Color Bar]        │  │  ← 4px top border in component color
│  │ TYPE                │  │  ← uppercase, small, muted text
│  │ Label               │  │  ← component label, bold
│  │ Description         │  │  ← truncated, gray text
│  └────────────────────┘  │
│                          │
│  ○ Source Handle (bottom)│  ← connection drag source
└──────────────────────────┘
```

- **Node width**: ~200px (auto-sized by content)
- **Selected node**: Blue ring/highlight
- **Hover**: Lighter background
- **Handles**: Small circles at top (target) and bottom (source)

### 12.5 Theme & Colors

The application uses a dark theme throughout:

| Element | Color | Hex |
|---|---|---|
| Page background | gray-950 | #030712 |
| Sidebar/toolbar background | gray-900 | #111827 |
| Panel backgrounds | gray-800 | #1f2937 |
| Borders | gray-700 | #374151 |
| Primary text | gray-100 | #f3f4f6 |
| Muted text | gray-400 | #9ca3af |
| Disabled state | opacity-40 | 40% opacity |
| Canvas background | gray-900 | #111827 |
| PNG export background | gray-900 | #111827 |

### 12.6 Interaction Patterns for Antigravity

| User Action | How to Reproduce |
|---|---|
| Generate architecture | Type in `[data-testid="requirements-input"]`, click `[data-testid="generate-btn"]` |
| Add built-in component | Click `[data-testid="palette-{type}"]` (e.g., `palette-service`) |
| Add plugin component | Click `[data-testid="plugin-{type}"]` (e.g., `plugin-firewall`) |
| Select a template | Click `[data-testid="template-{id}"]` (e.g., `template-microservices`) |
| Create new graph | Click `[data-testid="graph-tab-new"]` |
| Switch graph | Click `[data-testid="graph-tab-{graphId}"]` |
| Rename graph | Double-click tab name span, type in `[data-testid="graph-tab-rename-input"]`, press Enter |
| Duplicate graph | Hover tab, click `[data-testid="graph-tab-duplicate-{graphId}"]` |
| Delete graph | Hover tab, click `[data-testid="graph-tab-close-{graphId}"]` |
| Select component | Click `[data-testid="architecture-node"]` on the canvas |
| Edit component | After selecting, modify `[data-testid="property-label"]` or `[data-testid="property-description"]` |
| Delete component | After selecting, click `[data-testid="delete-component-btn"]` |
| Search component | Type in `[data-testid="search-input"]`, click `[data-testid="search-result-{id}"]` |
| Export JSON | Click `[data-testid="export-json-btn"]` |
| Export PNG | Click `[data-testid="export-png-btn"]` |
| Import JSON | Click `[data-testid="import-json-btn"]`, select file via `[data-testid="import-file-input"]` |
| Create connection | Drag from `.react-flow__handle-bottom` on source node to `.react-flow__handle-top` on target node |
| Undo | Press Ctrl+Z (not while focused on input) |
| Redo | Press Ctrl+Y (not while focused on input) |
| Delete via keyboard | Select node, press Delete key (not while focused on input) |
| Deselect | Press Escape key (not while focused on input) |

---

## 13. Validation Rules & Error Catalog

This section documents every validation rule and error message in the application, enabling Antigravity to test both valid and invalid inputs systematically.

### 13.1 Import JSON Validation (importService.ts)

The `importJson(jsonString)` function validates imported JSON in sequence. The first failing check returns immediately — subsequent checks are not run.

| # | Validation Check | Error Message | Input That Triggers |
|---|---|---|---|
| 1 | Valid JSON syntax | `"Invalid JSON"` | Malformed JSON (e.g., `{broken`) |
| 2 | Parsed value is an object | `"JSON must be an object"` | JSON array, string, number, or null |
| 3 | `components` is an array | `"Missing or invalid \"components\" array"` | Missing key, or non-array value |
| 4 | `connections` is an array | `"Missing or invalid \"connections\" array"` | Missing key, or non-array value |
| 5 | Each component is valid | `"Invalid component at index {N}"` | Component missing `id`, `type`, `label`, `description` (string), or `x`, `y` (number) |
| 6 | Each connection is valid | `"Invalid connection at index {N}"` | Connection missing `id`, `source`, `target`, or `label` (all strings) |
| 7 | Source reference exists | `"Connection \"{id}\" references unknown source \"{source}\""` | `source` ID not in components |
| 8 | Target reference exists | `"Connection \"{id}\" references unknown target \"{target}\""` | `target` ID not in components |

### 13.2 Component Field Requirements

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `string` | Yes | Must be unique within the graph |
| `type` | `string` | Yes | Any string (built-in: service, database, queue, cache, gateway, client, storage, loadbalancer; plugin types also accepted) |
| `label` | `string` | Yes | Display name shown on canvas node |
| `description` | `string` | Yes | Description shown below label |
| `x` | `number` | Yes | Canvas X coordinate (pixels) |
| `y` | `number` | Yes | Canvas Y coordinate (pixels) |

### 13.3 Connection Field Requirements

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `string` | Yes | Must be unique within the graph |
| `source` | `string` | Yes | Must match an existing component `id` |
| `target` | `string` | Yes | Must match an existing component `id` |
| `label` | `string` | Yes | Edge label (e.g., "reads/writes", "HTTPS") |

### 13.4 UI Disabled States & Behavioral Rules

| Element | Condition | Behavior |
|---|---|---|
| Export JSON button | `graph.components.length === 0` | Disabled (opacity 40%) |
| Export PNG button | `graph.components.length === 0` | Disabled (opacity 40%) |
| Properties Panel | No component selected | Hidden entirely |
| Delete graph close button | Only 1 graph in workspace | Hidden |
| Keyboard shortcuts | Focus on `<input>`, `<textarea>`, or `contentEditable` | Shortcuts suppressed |
| Auto-create graph | `store.graphs.length === 0` on mount | Creates "Untitled" graph automatically |
| Delete last graph | Last graph deleted | Workspace becomes empty, then auto-creates "Untitled" on next render |
| Duplicate graph | Source graph exists | New graph created with name `"{name} (copy)"` |
| File input reset | After import | `e.target.value = ''` so same file can be re-imported |

### 13.5 Import Result Shape

```typescript
interface ImportResult {
  valid: boolean       // true if all checks passed
  graph?: ArchitectureGraph  // present only when valid === true
  error?: string       // present only when valid === false
}
```

On invalid import, the error is logged to `console.error` with prefix `"Invalid architecture JSON:"`. On file read failure, error is logged with `"Failed to import JSON:"`.

---

## 14. State Transitions

This section documents the complete state machine of the Zustand store, showing how every user action transitions the application state.

### 14.1 Workspace State Machine

```
[Browser Load]
  → Zustand persist middleware hydrates from localStorage("architect-workspace")
  → If graphs[] is empty → createGraph("Untitled") → [1 graph, active]
  → If graphs[] has data → restore activeGraphId → [N graphs, active graph displayed]

[N graphs, active]
  → createGraph(name)     → [N+1 graphs, new graph is active, selection cleared]
  → deleteGraph(id)       → [N-1 graphs, fallback to first remaining graph]
  → renameGraph(id, name) → [N graphs, name updated, updatedAt refreshed]
  → setActiveGraph(id)    → [N graphs, different graph active, selection cleared]
  → duplicateGraph(id)    → [N+1 graphs, clone is active, selection cleared]
  → importGraph(name, g)  → [N+1 graphs, imported graph is active, selection cleared]

[Active graph]
  → setGraph(graph)           → [Entire graph replaced (used by requirements generator)]
  → addComponent(type,...)    → [Graph has N+1 components]
  → removeComponent(id)       → [Graph has N-1 components, related connections removed]
  → updateComponent(id,...)   → [Component label/description updated]
  → updatePosition(id, x, y)  → [Component position updated]
  → addConnection(src, tgt, label)  → [Graph has N+1 connections]
  → removeConnection(id)      → [Graph has N-1 connections]

[Any mutation]
  → zundo temporal middleware snapshots previous state (max 50 in history)
  → persist middleware writes {graphs, activeGraphId} to localStorage

[Undo/Redo]
  → undo() → reverts to previous state snapshot
  → redo() → re-applies reverted snapshot
  → History capped at 50 entries (oldest dropped when exceeded)
```

### 14.2 Selection State Machine

```
[No selection] (selectedComponentId === null)
  → Click node on canvas          → [Component selected]
  → Click search result           → [Component selected]

[Component selected] (selectedComponentId === "some-id")
  → Click different node          → [Different component selected]
  → Click canvas background       → [No selection]
  → Press Escape key              → [No selection]
  → Delete/Backspace key          → [Component removed, no selection]
  → removeComponent(selectedId)   → [No selection]
  → setActiveGraph(differentId)   → [No selection]
  → createGraph()                 → [No selection]
  → duplicateGraph()              → [No selection]
  → importGraph()                 → [No selection]
```

### 14.3 Graph Deletion Edge Cases

| Scenario | Behavior |
|---|---|
| Delete active graph (N > 1) | Switches to `remaining[0]` (first in list) |
| Delete non-active graph | Active graph unchanged |
| Delete last graph (N = 1) | `graphs: [], activeGraphId: null` → next render auto-creates "Untitled" |
| Delete selected component's graph | Selection cleared to null |

### 14.4 Persistence Lifecycle

```
[State change occurs]
  → Zustand set() updates in-memory state
  → persist middleware serializes { graphs, activeGraphId }
  → Writes JSON to localStorage key "architect-workspace"
  → selectedComponentId is excluded via partialize

[Page reload / new session]
  → persist middleware reads localStorage("architect-workspace")
  → Restores graphs[] and activeGraphId
  → selectedComponentId defaults to null (not persisted)
  → If graphs[] empty, App useEffect creates "Untitled" graph
```

---

## 15. Test Data Fixtures & Sample Payloads

This section provides ready-to-use test data for Antigravity to validate every feature of The Architect.

### 15.1 Sample Requirements Text

**Simple input** (2 keywords → ~5 components):
```
I need a web app with a database
```
Expected keywords matched: `web app`, `database`
Expected component types: `client`, `gateway`, `service`, `database`

**Medium input** (5 keywords → ~10 components):
```
Build a REST API with user authentication, a PostgreSQL database, Redis caching, and a message queue for notifications
```
Expected keywords matched: `rest api`, `auth`, `database`, `caching`, `queue`, `notification`
Expected component types: `gateway`, `service` (multiple), `database` (multiple), `cache`, `queue`

**Complex input** (8+ keywords → 15+ components):
```
I need a scalable web app with a mobile app, REST API, microservices, user authentication, PostgreSQL database, Redis caching, message queue, email notifications, file upload storage, search, payment processing, analytics, and monitoring
```
Expected keywords matched: `web app`, `mobile app`, `rest api`, `microservice`, `auth`, `database`, `caching`, `queue`, `email`, `file upload`, `storage`, `search`, `payment`, `analytics`, `monitoring`, `scalab`

### 15.2 Sample Valid JSON for Import

**Minimal valid graph** (1 component, 0 connections):
```json
{
  "components": [
    {
      "id": "svc-1",
      "type": "service",
      "label": "My Service",
      "description": "A test service",
      "x": 100,
      "y": 100
    }
  ],
  "connections": []
}
```

**Full valid graph** (3 components, 2 connections):
```json
{
  "components": [
    {
      "id": "gw-1",
      "type": "gateway",
      "label": "API Gateway",
      "description": "Routes requests",
      "x": 300,
      "y": 50
    },
    {
      "id": "svc-1",
      "type": "service",
      "label": "Order Service",
      "description": "Handles orders",
      "x": 300,
      "y": 200
    },
    {
      "id": "db-1",
      "type": "database",
      "label": "Order DB",
      "description": "Stores orders",
      "x": 300,
      "y": 350
    }
  ],
  "connections": [
    {
      "id": "e-1",
      "source": "gw-1",
      "target": "svc-1",
      "label": "routes to"
    },
    {
      "id": "e-2",
      "source": "svc-1",
      "target": "db-1",
      "label": "reads/writes"
    }
  ]
}
```

### 15.3 Sample Invalid JSON for Import (one per validation rule)

| # | Test Case | Input | Expected Error |
|---|---|---|---|
| 1 | Malformed JSON | `{broken` | `"Invalid JSON"` |
| 2 | Not an object | `[1, 2, 3]` | `"JSON must be an object"` |
| 3 | Missing components | `{"connections": []}` | `"Missing or invalid \"components\" array"` |
| 4 | Missing connections | `{"components": []}` | `"Missing or invalid \"connections\" array"` |
| 5 | Invalid component | `{"components": [{"id": "x"}], "connections": []}` | `"Invalid component at index 0"` |
| 6 | Invalid connection | `{"components": [{"id":"a","type":"service","label":"A","description":"d","x":0,"y":0}], "connections": [{"id":"c"}]}` | `"Invalid connection at index 0"` |
| 7 | Bad source ref | `{"components": [{"id":"a","type":"service","label":"A","description":"d","x":0,"y":0}], "connections": [{"id":"c1","source":"missing","target":"a","label":"x"}]}` | `"Connection \"c1\" references unknown source \"missing\""` |
| 8 | Bad target ref | `{"components": [{"id":"a","type":"service","label":"A","description":"d","x":0,"y":0}], "connections": [{"id":"c1","source":"a","target":"missing","label":"x"}]}` | `"Connection \"c1\" references unknown target \"missing\""` |

### 15.4 Template Component Counts (for verification)

| Template | ID | Components | Connections |
|---|---|---|---|
| Microservices | `microservices` | 12 | 11 |
| Serverless | `serverless` | 8 | 8 |
| Monolith | `monolith` | 7 | 8 |
| Event-Driven | `event-driven` | 8 | 8 |

### 15.5 localStorage Inspection

- **Key**: `"architect-workspace"`
- **Access**: `JSON.parse(localStorage.getItem("architect-workspace"))`

**Expected shape**:
```json
{
  "state": {
    "graphs": [
      {
        "id": "graph-{timestamp}-{counter}",
        "name": "Untitled",
        "graph": { "components": [], "connections": [] },
        "createdAt": 1711324800000,
        "updatedAt": 1711324800000
      }
    ],
    "activeGraphId": "graph-{timestamp}-{counter}"
  },
  "version": 0
}
```

**Note**: The `version` field is managed by Zustand's persist middleware. The `selectedComponentId` field is excluded from persistence via `partialize`.

### 15.6 Test File Inventory

| Test File | Coverage Area | Test Count |
|---|---|---|
| `src/engine/__tests__/architectureEngine.test.ts` | Requirements parsing, architecture generation, component CRUD | Core engine logic |
| `src/engine/__tests__/exportService.test.ts` | JSON export formatting | Export output |
| `src/engine/__tests__/importService.test.ts` | All 8 validation rules, valid import | Import validation |
| `src/engine/__tests__/templates.test.ts` | Template structure, component/connection counts | Template integrity |
| `src/store/__tests__/graphStore.test.ts` | All store operations, CRUD, undo/redo, persistence | State management |
| `src/plugins/__tests__/pluginRegistry.test.ts` | Plugin registration, lookup, enumeration | Plugin system |
| `src/components/__tests__/RequirementsPanel.test.tsx` | Text input, generate button interaction | Requirements UI |
| `src/components/__tests__/ComponentPalette.test.tsx` | Component button clicks | Palette UI |
| `src/components/__tests__/PropertiesPanel.test.tsx` | Property editing, delete button | Properties UI |
| `src/components/__tests__/SearchBar.test.tsx` | Search filtering, result selection | Search UI |
| `src/components/__tests__/ErrorBoundary.test.tsx` | Error catching, fallback display, reset | Error handling |
