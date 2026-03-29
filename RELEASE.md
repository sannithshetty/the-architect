# Release Notes

## v0.2.0-ui-tests — Comprehensive UI Test Coverage for All Components

### Summary
Added unit tests for all previously untested UI components and hooks, increasing test coverage from 93 to 149 tests across 17 test files.

### Changes
- **ArchitectureNode tests** (5 tests) — rendering, label/type display, border color, handle elements
- **GraphTabs tests** (12 tests) — tab rendering, create/delete/duplicate, rename (enter/escape/blur), active state switching
- **TemplateSelector tests** (8 tests) — template listing, name/description display, graph creation with deep clone, all 4 templates
- **PluginPalette tests** (9 tests) — component rendering, category grouping, color indicators, add-to-graph callback, tooltips
- **ArchitectureCanvas tests** (9 tests) — node/edge mapping, empty graph, node click selection, pane click deselection, ReactFlow subcomponents
- **useKeyboardShortcuts tests** (12 tests) — undo/redo (Ctrl+Z/Y/Shift+Z/Meta+Z), Delete/Backspace removal, Escape deselection, input/textarea exclusion, cleanup on unmount

### Architecture Impact
- No new modules or dependencies
- No production code changes — test files only

### Risk Level
**Low** — Test-only addition. No impact on application behavior. Backward compatible.

### Migration Steps
None — test files only.

---

## v0.2.0-complete-docs — Complete End-to-End Documentation for Antigravity Web Testing

### Summary
Enhanced the project document (`src/docs/the-architect-project-document.md`) with validation rules catalog, state transition documentation, and test data fixtures — completing the specification for Antigravity web application testing.

### Changes
- **Section 13: Validation Rules & Error Catalog** — All 8 import validation rules with exact error messages, component/connection field requirements, UI disabled states, and behavioral rules
- **Section 14: State Transitions** — Complete workspace and selection state machines, graph deletion edge cases, persistence lifecycle documentation
- **Section 15: Test Data Fixtures & Sample Payloads** — Sample requirements text (simple/medium/complex), valid/invalid JSON import examples (one per validation rule), template component counts, localStorage inspection guide, and test file inventory

### Architecture Impact
- No new modules or dependencies
- No code changes — documentation only

### Risk Level
**Low** — Documentation-only change. No impact on application behavior.

### Migration Steps
None — documentation update only.

---

## v0.2.0-docs-2 — Enhanced Project Document with Web UI Inventory for Antigravity

### Summary
Extended the comprehensive project document (`src/docs/the-architect-project-document.md`) with three new sections critical for Antigravity web application testing: complete UI element inventory with data-testid selectors, Zustand store API reference, and spatial layout map with interaction patterns.

### Changes
- **Section 10: Web UI Element Inventory** — Complete catalog of all 30 interactive UI elements (including 5 dynamic patterns) with data-testid selectors, element types, and supported actions. Organized by page region (sidebar, main area, canvas).
- **Section 11: Store API Reference** — Full Zustand store API with TypeScript signatures for all 13 mutations, 2 derived selectors, and middleware configuration (persist + temporal).
- **Section 12: Web Application Layout Map** — Spatial layout diagram, panel dimensions, section hierarchy, component node anatomy, theme colors, and step-by-step interaction patterns for reproducing all user actions.

### Architecture Impact
- No new modules or dependencies
- No code changes — documentation only

### Risk Level
**Low** — Documentation-only change. No impact on application behavior.

### Migration Steps
None — documentation update only.

---

## v0.2.0-docs — Complete Project Document for Antigravity Integration

### Summary
Enhanced the comprehensive project document (`src/docs/the-architect-project-document.md`) with end-to-end system flow documentation and detailed Antigravity integration guide. No code changes — documentation only.

### Changes
- **Section 8: End-to-End System Flow** — Added complete data flow diagrams covering application initialization, requirements-to-diagram flow, manual building flow, state mutation flow, export/import flows, and error recovery flow.
- **Section 9: Antigravity Integration Guide** — Added detailed guidance for feeding exported JSON to Antigravity, including: field-by-field purpose mapping, testing strategies by component type, topology analysis for test planning, sample workflow, and plugin component type reference.

### Architecture Impact
- No new modules or dependencies
- No code changes

### Risk Level
**Low** — Documentation-only change. No impact on application behavior.

### Migration Steps
None — documentation update only.

---

## v0.2.0 — Advanced Multi-Graph Platform

### Summary
Major upgrade transforming The Architect from a single-graph prototype into an advanced multi-graph architecture design platform with state management, persistence, undo/redo, templates, plugins, and enhanced UX.

### Features
- **Multi-Graph Workspace**: Create, rename, duplicate, and switch between multiple architecture graphs using a tabbed interface. All graphs persist to localStorage.
- **Zustand State Management**: Global state with `zustand` store replacing local React state. Includes `zundo` middleware for undo/redo history (50-step limit).
- **Graph Templates**: 4 pre-built architecture templates — Microservices, Serverless, Monolith, and Event-Driven (CQRS) — accessible from the sidebar.
- **Plugin Architecture**: Extensible plugin system with registry for custom component types. Ships with 3 built-in plugins:
  - Infrastructure (CDN, DNS, Container, Lambda)
  - Security (Firewall, Identity Provider, Secret Vault)
  - Observability (Monitoring, Log Aggregator, Distributed Tracing)
- **Interactive Edge Creation**: Drag from node handles to create connections directly on the canvas. Edges now display directional arrows.
- **MiniMap**: Pannable and zoomable minimap for navigating large diagrams.
- **JSON Import**: Import architecture graphs from JSON files with validation (structure, types, and referential integrity).
- **Keyboard Shortcuts**: Ctrl+Z undo, Ctrl+Y/Ctrl+Shift+Z redo, Delete/Backspace remove selected, Escape deselect.
- **Component Search**: Real-time search/filter bar to find components by label, type, or description.
- **Error Boundary**: Graceful error handling with fallback UI and recovery button.

### Architecture Impact
- **New modules**:
  - `src/store/graphStore.ts` — Zustand store with persist + temporal middleware
  - `src/engine/templates.ts` — Pre-built architecture templates
  - `src/engine/importService.ts` — JSON import with validation
  - `src/plugins/` — Plugin system (types, registry, built-in plugins)
  - `src/hooks/useKeyboardShortcuts.ts` — Keyboard shortcut handler
  - `src/components/GraphTabs.tsx` — Multi-graph tab bar
  - `src/components/TemplateSelector.tsx` — Template picker UI
  - `src/components/PluginPalette.tsx` — Plugin component palette
  - `src/components/SearchBar.tsx` — Component search
  - `src/components/ErrorBoundary.tsx` — Error boundary wrapper
- **New dependencies**: `zustand` (state management), `zundo` (undo/redo middleware)
- **Modified**: `App.tsx` (store integration), `ArchitectureCanvas.tsx` (MiniMap, edge creation, arrows)

### Risk Level
**Medium** — Significant refactor of state management from local useState to global Zustand store. localStorage persistence introduces browser-specific behavior. All existing functionality preserved. Backward-compatible JSON export format.

### Migration Steps
- Users with v0.1.0: No migration needed. First load creates a default "Untitled" graph. Previously exported JSON files can be re-imported via the new Import button.

---

## v0.1.0 — Initial Release

### Summary
Initial implementation of The Architect — a UI application that generates interactive architectural diagrams from software requirements. Users can input requirements text, and the app analyzes keywords to produce a visual architecture diagram with draggable components and connections.

### Features
- **Requirements Parser**: Analyzes free-text requirements and identifies architecture components (services, databases, queues, caches, gateways, etc.)
- **Architecture Engine**: Generates a component graph with auto-layout and intelligent connections between components
- **Interactive Canvas**: React Flow-based diagram with draggable nodes, animated edges, and zoom/pan controls
- **Component Palette**: Add individual architecture components (8 types) to the canvas
- **Properties Panel**: View and edit selected component label and description
- **Export**: Download architecture as JSON or PNG

### Architecture Impact
- **New modules**: React + TypeScript SPA (Vite bundler)
- **Dependencies**: @xyflow/react, tailwindcss, html-to-image
- **Schema updates**: None (client-side only)

### Risk Level
**Low** — Greenfield client-side application. No backend, no database, no external service dependencies.

### Migration Steps
None — initial release.
