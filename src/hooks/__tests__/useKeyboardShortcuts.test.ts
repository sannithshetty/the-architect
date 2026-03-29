import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'
import { useGraphStore } from '../../store/graphStore'

// Mock the temporal store for undo/redo
const mockUndo = vi.fn()
const mockRedo = vi.fn()

vi.mock('../../store/graphStore', async () => {
  const actual = await vi.importActual<typeof import('../../store/graphStore')>('../../store/graphStore')
  const store = actual.useGraphStore

  // Attach mock temporal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(store as any).temporal = {
    getState: () => ({
      undo: mockUndo,
      redo: mockRedo,
    }),
  }

  return { ...actual, useGraphStore: store }
})

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...opts })
  )
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGraphStore.setState({
      graphs: [],
      activeGraphId: null,
      selectedComponentId: null,
    })
  })

  it('calls undo on Ctrl+Z', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('z', { ctrlKey: true })
    expect(mockUndo).toHaveBeenCalledTimes(1)
  })

  it('calls redo on Ctrl+Y', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('y', { ctrlKey: true })
    expect(mockRedo).toHaveBeenCalledTimes(1)
  })

  it('calls redo on Ctrl+Shift+Z', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('z', { ctrlKey: true, shiftKey: true })
    expect(mockRedo).toHaveBeenCalledTimes(1)
  })

  it('calls undo on Meta+Z (Mac)', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('z', { metaKey: true })
    expect(mockUndo).toHaveBeenCalledTimes(1)
  })

  it('removes selected component on Delete', () => {
    // Create a graph with a component and select it
    const store = useGraphStore.getState()
    store.createGraph('Test')
    store.addComponent('service', 'Svc', 100, 100)
    const state = useGraphStore.getState()
    const compId = state.graphs.find(g => g.id === state.activeGraphId)!.graph.components[0].id
    store.setSelectedComponent(compId)

    renderHook(() => useKeyboardShortcuts())
    fireKey('Delete')

    const afterState = useGraphStore.getState()
    const activeGraph = afterState.graphs.find(g => g.id === afterState.activeGraphId)
    expect(activeGraph?.graph.components).toHaveLength(0)
    expect(afterState.selectedComponentId).toBeNull()
  })

  it('removes selected component on Backspace', () => {
    const store = useGraphStore.getState()
    store.createGraph('Test')
    store.addComponent('database', 'DB', 50, 50)
    const state = useGraphStore.getState()
    const compId = state.graphs.find(g => g.id === state.activeGraphId)!.graph.components[0].id
    store.setSelectedComponent(compId)

    renderHook(() => useKeyboardShortcuts())
    fireKey('Backspace')

    const afterState = useGraphStore.getState()
    const activeGraph = afterState.graphs.find(g => g.id === afterState.activeGraphId)
    expect(activeGraph?.graph.components).toHaveLength(0)
  })

  it('does not remove component when nothing is selected', () => {
    const store = useGraphStore.getState()
    store.createGraph('Test')
    store.addComponent('service', 'Svc', 100, 100)

    renderHook(() => useKeyboardShortcuts())
    fireKey('Delete')

    const afterState = useGraphStore.getState()
    const activeGraph = afterState.graphs.find(g => g.id === afterState.activeGraphId)
    expect(activeGraph?.graph.components).toHaveLength(1)
  })

  it('clears selection on Escape', () => {
    const store = useGraphStore.getState()
    store.createGraph('Test')
    store.addComponent('service', 'Svc', 100, 100)
    store.setSelectedComponent('some-id')

    renderHook(() => useKeyboardShortcuts())
    fireKey('Escape')

    expect(useGraphStore.getState().selectedComponentId).toBeNull()
  })

  it('does not intercept shortcuts when typing in an input', () => {
    renderHook(() => useKeyboardShortcuts())

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: input })
    input.dispatchEvent(event)

    // Undo should not be called when typing in input
    expect(mockUndo).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('does not intercept shortcuts when typing in a textarea', () => {
    renderHook(() => useKeyboardShortcuts())

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: textarea })
    textarea.dispatchEvent(event)

    expect(mockUndo).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts())
    unmount()
    fireKey('z', { ctrlKey: true })
    expect(mockUndo).not.toHaveBeenCalled()
  })
})
