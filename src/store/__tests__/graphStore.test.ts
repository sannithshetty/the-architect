import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphStore, getActiveGraph, getSelectedComponent } from '../graphStore'

describe('graphStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGraphStore.setState({
      graphs: [],
      activeGraphId: null,
      selectedComponentId: null,
    })
  })

  describe('createGraph', () => {
    it('creates a new graph and sets it active', () => {
      const id = useGraphStore.getState().createGraph('Test Graph')
      const state = useGraphStore.getState()
      expect(state.graphs).toHaveLength(1)
      expect(state.graphs[0].name).toBe('Test Graph')
      expect(state.activeGraphId).toBe(id)
    })

    it('creates a graph with initial data', () => {
      const graph = {
        components: [{ id: 'c1', type: 'service' as const, label: 'Svc', description: '', x: 0, y: 0 }],
        connections: [],
      }
      useGraphStore.getState().createGraph('With Data', graph)
      const state = useGraphStore.getState()
      const active = getActiveGraph(state)
      expect(active.components).toHaveLength(1)
      expect(active.components[0].label).toBe('Svc')
    })

    it('allows multiple graphs', () => {
      useGraphStore.getState().createGraph('Graph 1')
      useGraphStore.getState().createGraph('Graph 2')
      expect(useGraphStore.getState().graphs).toHaveLength(2)
    })
  })

  describe('deleteGraph', () => {
    it('removes a graph and switches active if needed', () => {
      const id1 = useGraphStore.getState().createGraph('A')
      const id2 = useGraphStore.getState().createGraph('B')
      useGraphStore.getState().setActiveGraph(id1)
      useGraphStore.getState().deleteGraph(id1)
      const state = useGraphStore.getState()
      expect(state.graphs).toHaveLength(1)
      expect(state.activeGraphId).toBe(id2)
    })

    it('sets activeGraphId to null when last graph deleted', () => {
      const id = useGraphStore.getState().createGraph('Only')
      useGraphStore.getState().deleteGraph(id)
      expect(useGraphStore.getState().activeGraphId).toBeNull()
    })
  })

  describe('renameGraph', () => {
    it('renames a graph', () => {
      const id = useGraphStore.getState().createGraph('Old Name')
      useGraphStore.getState().renameGraph(id, 'New Name')
      expect(useGraphStore.getState().graphs[0].name).toBe('New Name')
    })
  })

  describe('duplicateGraph', () => {
    it('creates a copy of the graph', () => {
      const id = useGraphStore.getState().createGraph('Original')
      useGraphStore.getState().addComponent('service', 'Test', 50, 50)
      useGraphStore.getState().duplicateGraph(id)
      const state = useGraphStore.getState()
      expect(state.graphs).toHaveLength(2)
      expect(state.graphs[1].name).toBe('Original (copy)')
      const copyGraph = state.graphs[1].graph
      expect(copyGraph.components).toHaveLength(1)
    })
  })

  describe('component operations', () => {
    beforeEach(() => {
      useGraphStore.getState().createGraph('Test')
    })

    it('addComponent adds to the active graph', () => {
      useGraphStore.getState().addComponent('service', 'API', 100, 200)
      const graph = getActiveGraph(useGraphStore.getState())
      expect(graph.components).toHaveLength(1)
      expect(graph.components[0].label).toBe('API')
    })

    it('removeComponent removes from the active graph', () => {
      useGraphStore.getState().addComponent('service', 'API', 100, 200)
      const graph = getActiveGraph(useGraphStore.getState())
      const compId = graph.components[0].id
      useGraphStore.getState().removeComponent(compId)
      const updated = getActiveGraph(useGraphStore.getState())
      expect(updated.components).toHaveLength(0)
    })

    it('updateComponent modifies label', () => {
      useGraphStore.getState().addComponent('service', 'Old', 0, 0)
      const graph = getActiveGraph(useGraphStore.getState())
      const compId = graph.components[0].id
      useGraphStore.getState().updateComponent(compId, { label: 'New' })
      const updated = getActiveGraph(useGraphStore.getState())
      expect(updated.components[0].label).toBe('New')
    })

    it('updatePosition moves a component', () => {
      useGraphStore.getState().addComponent('service', 'Svc', 0, 0)
      const graph = getActiveGraph(useGraphStore.getState())
      const compId = graph.components[0].id
      useGraphStore.getState().updatePosition(compId, 300, 400)
      const updated = getActiveGraph(useGraphStore.getState())
      expect(updated.components[0].x).toBe(300)
      expect(updated.components[0].y).toBe(400)
    })

    it('addConnection creates a new edge', () => {
      useGraphStore.getState().addComponent('service', 'A', 0, 0)
      useGraphStore.getState().addComponent('database', 'B', 200, 0)
      const graph = getActiveGraph(useGraphStore.getState())
      useGraphStore.getState().addConnection(
        graph.components[0].id,
        graph.components[1].id,
        'reads/writes'
      )
      const updated = getActiveGraph(useGraphStore.getState())
      expect(updated.connections).toHaveLength(1)
      expect(updated.connections[0].label).toBe('reads/writes')
    })

    it('removeConnection removes an edge', () => {
      useGraphStore.getState().addComponent('service', 'A', 0, 0)
      useGraphStore.getState().addComponent('database', 'B', 200, 0)
      const graph1 = getActiveGraph(useGraphStore.getState())
      useGraphStore.getState().addConnection(
        graph1.components[0].id,
        graph1.components[1].id,
        'test'
      )
      const graph2 = getActiveGraph(useGraphStore.getState())
      useGraphStore.getState().removeConnection(graph2.connections[0].id)
      const updated = getActiveGraph(useGraphStore.getState())
      expect(updated.connections).toHaveLength(0)
    })
  })

  describe('selection', () => {
    it('setSelectedComponent updates selection', () => {
      useGraphStore.getState().createGraph('Test')
      useGraphStore.getState().addComponent('service', 'API', 0, 0)
      const graph = getActiveGraph(useGraphStore.getState())
      const compId = graph.components[0].id
      useGraphStore.getState().setSelectedComponent(compId)
      expect(useGraphStore.getState().selectedComponentId).toBe(compId)
    })

    it('getSelectedComponent returns the selected component', () => {
      useGraphStore.getState().createGraph('Test')
      useGraphStore.getState().addComponent('service', 'API', 0, 0)
      const graph = getActiveGraph(useGraphStore.getState())
      const compId = graph.components[0].id
      useGraphStore.getState().setSelectedComponent(compId)
      const selected = getSelectedComponent(useGraphStore.getState())
      expect(selected).not.toBeNull()
      expect(selected!.label).toBe('API')
    })

    it('getSelectedComponent returns null when nothing selected', () => {
      useGraphStore.getState().createGraph('Test')
      expect(getSelectedComponent(useGraphStore.getState())).toBeNull()
    })
  })

  describe('importGraph', () => {
    it('imports a graph and sets it active', () => {
      const graph = {
        components: [{ id: 'imp-1', type: 'database' as const, label: 'DB', description: 'Imported', x: 50, y: 50 }],
        connections: [],
      }
      const id = useGraphStore.getState().importGraph('Imported', graph)
      const state = useGraphStore.getState()
      expect(state.graphs).toHaveLength(1)
      expect(state.activeGraphId).toBe(id)
      const active = getActiveGraph(state)
      expect(active.components[0].label).toBe('DB')
    })
  })

  describe('getActiveGraph', () => {
    it('returns empty graph when no active graph', () => {
      const graph = getActiveGraph(useGraphStore.getState())
      expect(graph.components).toEqual([])
      expect(graph.connections).toEqual([])
    })
  })
})
