import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { temporal } from 'zundo'
import type {
  ArchitectureGraph,
  ArchitectureComponent,
  ComponentType,
} from '../types/architecture'
import {
  addComponentToGraph,
  removeComponentFromGraph,
  updateComponentInGraph,
} from '../engine/architectureEngine'

export interface GraphEntry {
  id: string
  name: string
  graph: ArchitectureGraph
  createdAt: number
  updatedAt: number
}

export interface GraphState {
  graphs: GraphEntry[]
  activeGraphId: string | null
  selectedComponentId: string | null
}

export interface GraphActions {
  // Graph CRUD
  createGraph: (name: string, graph?: ArchitectureGraph) => string
  deleteGraph: (id: string) => void
  renameGraph: (id: string, name: string) => void
  setActiveGraph: (id: string) => void
  duplicateGraph: (id: string) => void

  // Component operations on active graph
  setGraph: (graph: ArchitectureGraph) => void
  addComponent: (type: ComponentType, label: string, x: number, y: number) => void
  removeComponent: (id: string) => void
  updateComponent: (id: string, updates: { label?: string; description?: string }) => void
  updatePosition: (id: string, x: number, y: number) => void
  addConnection: (source: string, target: string, label: string) => void
  removeConnection: (connectionId: string) => void

  // Selection
  setSelectedComponent: (id: string | null) => void

  // Import
  importGraph: (name: string, graph: ArchitectureGraph) => string
}

export type GraphStore = GraphState & GraphActions

const EMPTY_GRAPH: ArchitectureGraph = { components: [], connections: [] }

let graphIdCounter = 0

function nextGraphId(): string {
  graphIdCounter++
  return `graph-${Date.now()}-${graphIdCounter}`
}

function nextConnectionId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function updateActiveGraph(
  state: GraphState,
  updater: (graph: ArchitectureGraph) => ArchitectureGraph
): Partial<GraphState> {
  if (!state.activeGraphId) return {}
  return {
    graphs: state.graphs.map((g) =>
      g.id === state.activeGraphId
        ? { ...g, graph: updater(g.graph), updatedAt: Date.now() }
        : g
    ),
  }
}

export const useGraphStore = create<GraphStore>()(
  persist(
    temporal(
      (set, get) => ({
        graphs: [],
        activeGraphId: null,
        selectedComponentId: null,

        createGraph: (name: string, graph?: ArchitectureGraph) => {
          const id = nextGraphId()
          const entry: GraphEntry = {
            id,
            name,
            graph: graph ?? EMPTY_GRAPH,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          set((state) => ({
            graphs: [...state.graphs, entry],
            activeGraphId: id,
            selectedComponentId: null,
          }))
          return id
        },

        deleteGraph: (id: string) => {
          set((state) => {
            const remaining = state.graphs.filter((g) => g.id !== id)
            const newActive =
              state.activeGraphId === id
                ? remaining.length > 0
                  ? remaining[0].id
                  : null
                : state.activeGraphId
            return {
              graphs: remaining,
              activeGraphId: newActive,
              selectedComponentId: state.activeGraphId === id ? null : state.selectedComponentId,
            }
          })
        },

        renameGraph: (id: string, name: string) => {
          set((state) => ({
            graphs: state.graphs.map((g) =>
              g.id === id ? { ...g, name, updatedAt: Date.now() } : g
            ),
          }))
        },

        setActiveGraph: (id: string) => {
          set({ activeGraphId: id, selectedComponentId: null })
        },

        duplicateGraph: (id: string) => {
          const state = get()
          const source = state.graphs.find((g) => g.id === id)
          if (!source) return
          const newId = nextGraphId()
          const entry: GraphEntry = {
            id: newId,
            name: `${source.name} (copy)`,
            graph: JSON.parse(JSON.stringify(source.graph)),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          set((state) => ({
            graphs: [...state.graphs, entry],
            activeGraphId: newId,
            selectedComponentId: null,
          }))
        },

        setGraph: (graph: ArchitectureGraph) => {
          set((state) => updateActiveGraph(state, () => graph))
        },

        addComponent: (type: ComponentType, label: string, x: number, y: number) => {
          set((state) => updateActiveGraph(state, (g) => addComponentToGraph(g, type, label, x, y)))
        },

        removeComponent: (id: string) => {
          set((state) => ({
            ...updateActiveGraph(state, (g) => removeComponentFromGraph(g, id)),
            selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
          }))
        },

        updateComponent: (id: string, updates: { label?: string; description?: string }) => {
          set((state) => updateActiveGraph(state, (g) => updateComponentInGraph(g, id, updates)))
        },

        updatePosition: (id: string, x: number, y: number) => {
          set((state) => updateActiveGraph(state, (g) => ({
            ...g,
            components: g.components.map((c) => (c.id === id ? { ...c, x, y } : c)),
          })))
        },

        addConnection: (source: string, target: string, label: string) => {
          set((state) =>
            updateActiveGraph(state, (g) => ({
              ...g,
              connections: [
                ...g.connections,
                { id: nextConnectionId(), source, target, label },
              ],
            }))
          )
        },

        removeConnection: (connectionId: string) => {
          set((state) =>
            updateActiveGraph(state, (g) => ({
              ...g,
              connections: g.connections.filter((c) => c.id !== connectionId),
            }))
          )
        },

        setSelectedComponent: (id: string | null) => {
          set({ selectedComponentId: id })
        },

        importGraph: (name: string, graph: ArchitectureGraph) => {
          const id = nextGraphId()
          const entry: GraphEntry = {
            id,
            name,
            graph,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          set((state) => ({
            graphs: [...state.graphs, entry],
            activeGraphId: id,
            selectedComponentId: null,
          }))
          return id
        },
      }),
      { limit: 50 }
    ),
    {
      name: 'architect-workspace',
      partialize: (state) => ({
        graphs: state.graphs,
        activeGraphId: state.activeGraphId,
      }),
    }
  )
)

/** Get the currently active graph, or an empty graph if none */
export function getActiveGraph(state: GraphState): ArchitectureGraph {
  if (!state.activeGraphId) return EMPTY_GRAPH
  const entry = state.graphs.find((g) => g.id === state.activeGraphId)
  return entry?.graph ?? EMPTY_GRAPH
}

/** Get the currently selected component from the active graph */
export function getSelectedComponent(state: GraphState): ArchitectureComponent | null {
  if (!state.selectedComponentId) return null
  const graph = getActiveGraph(state)
  return graph.components.find((c) => c.id === state.selectedComponentId) ?? null
}
