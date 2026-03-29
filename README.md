# The Architect

An interactive architecture diagram builder that generates system designs from plain-text requirements. Built as a client-side React + TypeScript SPA — no backend needed.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)

## Features

- **NLP Requirements Parsing** — Describe your system in plain text and get an architecture diagram generated automatically via keyword matching
- **Drag-and-Drop Canvas** — Interactive node-based editor powered by React Flow with minimap, zoom, and pan
- **Multi-Graph Workspace** — Create, rename, duplicate, and switch between multiple architecture diagrams in tabs
- **Component Palette** — 8 built-in component types: Frontend, Backend, Database, Cache, Queue, Storage, CDN, Gateway
- **Plugin System** — 3 built-in plugins (Infrastructure, Security, Observability) adding 10 more component types
- **Templates** — Pre-built architecture templates: Microservices, Serverless, Monolith, Event-Driven
- **Import/Export** — Save and load diagrams as JSON; export as PNG
- **Undo/Redo** — 50-step history with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- **Search** — Find and select components by name
- **Properties Panel** — Edit labels and descriptions for any selected component
- **localStorage Persistence** — Workspace auto-saves to the browser

## Quick Start

```bash
# Clone the repo
git clone https://github.com/sannithshetty/the-architect.git
cd the-architect

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI rendering |
| [TypeScript 5.9](https://typescriptlang.org) | Static typing |
| [Vite 8](https://vite.dev) | Build tool and dev server |
| [@xyflow/react](https://reactflow.dev) | Interactive node-based canvas |
| [Zustand 5](https://zustand.docs.pmnd.rs) | State management |
| [zundo](https://github.com/charkour/zundo) | Undo/redo middleware |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [html-to-image](https://github.com/nicolo-ribaudo/html-to-image) | PNG export |
| [Vitest 4](https://vitest.dev) | Testing framework |

## Project Structure

```
src/
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
├── index.css                   # Global styles (Tailwind)
├── types/
│   └── architecture.ts         # Core type definitions
├── engine/
│   ├── architectureEngine.ts   # Requirements parser & graph generator
│   ├── exportService.ts        # JSON and PNG export
│   ├── importService.ts        # JSON import with validation
│   └── templates.ts            # Pre-built architecture templates
├── store/
│   └── graphStore.ts           # Zustand store (multi-graph, undo/redo, persistence)
├── components/
│   ├── ArchitectureCanvas.tsx   # React Flow canvas with MiniMap
│   ├── ArchitectureNode.tsx     # Custom node renderer
│   ├── RequirementsPanel.tsx    # Text input for requirements
│   ├── ComponentPalette.tsx     # Built-in component type buttons
│   ├── PluginPalette.tsx        # Plugin-provided component buttons
│   ├── PropertiesPanel.tsx      # Selected component editor
│   ├── GraphTabs.tsx            # Multi-graph tab bar
│   ├── TemplateSelector.tsx     # Template picker
│   ├── SearchBar.tsx            # Component search/filter
│   └── ErrorBoundary.tsx        # Error boundary with fallback UI
├── hooks/
│   └── useKeyboardShortcuts.ts  # Global keyboard shortcut handler
└── plugins/
    ├── types.ts                 # Plugin interface definitions
    ├── pluginRegistry.ts        # Plugin registration and lookup
    └── builtinPlugins.ts        # Infrastructure, Security, Observability plugins
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete` / `Backspace` | Remove selected component |
| `Escape` | Deselect component |

## Usage

1. **Generate from requirements** — Type a description like *"A web app with user authentication, REST API, PostgreSQL database, and Redis caching"* in the Requirements panel and click Generate
2. **Use a template** — Pick from Microservices, Serverless, Monolith, or Event-Driven templates
3. **Build manually** — Click component types in the palette to add them to the canvas, then drag to position and connect by dragging between handles
4. **Edit properties** — Click a component to select it, then edit its label and description in the Properties panel
5. **Export** — Save your diagram as JSON (for re-importing later) or PNG (for sharing)

## License

MIT
