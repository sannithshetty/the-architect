# Context — The Architect

## Design Decisions

### Tech Stack: React + TypeScript + Vite
Chosen for strong ecosystem support for interactive canvas/diagram applications. React Flow (via @xyflow/react) is the de facto standard for node-based UIs in React.

### Template-Based Architecture Generation
The initial version uses keyword matching to generate architecture from requirements text. This provides predictable, fast results without external API dependencies. A future version could integrate LLM-powered generation (e.g., Claude API) for more nuanced analysis.

### Client-Side Only
No backend required. All processing happens in the browser. This simplifies deployment and eliminates infrastructure requirements.

### Tailwind CSS v4
Using the latest Tailwind CSS with Vite plugin integration. Dark theme by default to match developer tooling conventions.

### Zustand for State Management (v0.2.0)
Chose Zustand over Redux/Context for its minimal boilerplate, built-in middleware support (persist, temporal), and excellent TypeScript integration. The `zundo` middleware provides undo/redo with a 50-step history buffer — sufficient for interactive editing without excessive memory usage.

### Multi-Graph Workspace (v0.2.0)
The store holds an array of `GraphEntry` objects, each containing a named graph with timestamps. The active graph ID determines which graph is displayed. This flat structure (vs. nested routing) keeps state management simple while supporting unlimited graphs.

### Plugin Architecture (v0.2.0)
A registry-based plugin system allows extending the component palette with new node types. Plugins register component definitions (type, label, color, category) without modifying core code. Three built-in plugins ship with the platform (infrastructure, security, observability) — they demonstrate the plugin API and provide commonly needed component types.

### localStorage Persistence (v0.2.0)
Workspace state (graphs and active graph ID) persists via Zustand's `persist` middleware using localStorage. This provides zero-config persistence without a backend. The `partialize` option excludes transient state (selectedComponentId) from persistence.

## Constraints
- No API keys or credentials needed (client-side only)
- Browser-based; no server-side rendering
- Export formats: JSON and PNG; import format: JSON
- localStorage limited to ~5MB in most browsers — graphs with >500 components may approach this limit

## Scaling Assumptions
- Single-user, local browser application
- Architecture graphs expected to have <100 components per graph (React Flow handles this well)
- Multi-graph workspace supports unlimited graphs (limited by localStorage capacity)
- Undo/redo history capped at 50 states to bound memory usage
