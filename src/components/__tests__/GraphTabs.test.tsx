import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphTabs } from '../GraphTabs'
import { useGraphStore } from '../../store/graphStore'

describe('GraphTabs', () => {
  beforeEach(() => {
    useGraphStore.setState({
      graphs: [],
      activeGraphId: null,
      selectedComponentId: null,
    })
  })

  function createTestGraphs() {
    const store = useGraphStore.getState()
    const id1 = store.createGraph('Graph 1')
    const id2 = store.createGraph('Graph 2')
    return { id1, id2 }
  }

  it('renders the tab bar', () => {
    render(<GraphTabs />)
    expect(screen.getByTestId('graph-tabs')).toBeInTheDocument()
  })

  it('renders tabs for each graph', () => {
    const { id1, id2 } = createTestGraphs()
    render(<GraphTabs />)
    expect(screen.getByTestId(`graph-tab-${id1}`)).toBeInTheDocument()
    expect(screen.getByTestId(`graph-tab-${id2}`)).toBeInTheDocument()
  })

  it('renders graph names in tabs', () => {
    createTestGraphs()
    render(<GraphTabs />)
    expect(screen.getByText('Graph 1')).toBeInTheDocument()
    expect(screen.getByText('Graph 2')).toBeInTheDocument()
  })

  it('renders new graph button', () => {
    render(<GraphTabs />)
    expect(screen.getByTestId('graph-tab-new')).toBeInTheDocument()
  })

  it('creates a new graph when + is clicked', async () => {
    const user = userEvent.setup()
    render(<GraphTabs />)
    await user.click(screen.getByTestId('graph-tab-new'))
    expect(useGraphStore.getState().graphs).toHaveLength(1)
  })

  it('switches active graph on tab click', async () => {
    const user = userEvent.setup()
    const { id1 } = createTestGraphs()
    render(<GraphTabs />)
    await user.click(screen.getByTestId(`graph-tab-${id1}`))
    expect(useGraphStore.getState().activeGraphId).toBe(id1)
  })

  it('shows close button when multiple graphs exist', () => {
    const { id1 } = createTestGraphs()
    render(<GraphTabs />)
    expect(screen.getByTestId(`graph-tab-close-${id1}`)).toBeInTheDocument()
  })

  it('does not show close button with only one graph', () => {
    const store = useGraphStore.getState()
    const id = store.createGraph('Only Graph')
    render(<GraphTabs />)
    expect(screen.queryByTestId(`graph-tab-close-${id}`)).not.toBeInTheDocument()
  })

  it('deletes a graph when close is clicked', async () => {
    const user = userEvent.setup()
    const { id1 } = createTestGraphs()
    render(<GraphTabs />)
    await user.click(screen.getByTestId(`graph-tab-close-${id1}`))
    expect(useGraphStore.getState().graphs.find(g => g.id === id1)).toBeUndefined()
  })

  it('duplicates a graph when duplicate button is clicked', async () => {
    const user = userEvent.setup()
    const { id1 } = createTestGraphs()
    render(<GraphTabs />)
    await user.click(screen.getByTestId(`graph-tab-duplicate-${id1}`))
    const state = useGraphStore.getState()
    expect(state.graphs).toHaveLength(3)
    expect(state.graphs.some(g => g.name === 'Graph 1 (copy)')).toBe(true)
  })

  it('enters rename mode on double-click', async () => {
    const user = userEvent.setup()
    createTestGraphs()
    render(<GraphTabs />)
    await user.dblClick(screen.getByText('Graph 1'))
    expect(screen.getByTestId('graph-tab-rename-input')).toBeInTheDocument()
  })

  it('renames a graph on Enter', async () => {
    const user = userEvent.setup()
    createTestGraphs()
    render(<GraphTabs />)
    await user.dblClick(screen.getByText('Graph 1'))
    const input = screen.getByTestId('graph-tab-rename-input')
    await user.clear(input)
    await user.type(input, 'Renamed Graph{Enter}')
    const state = useGraphStore.getState()
    expect(state.graphs.some(g => g.name === 'Renamed Graph')).toBe(true)
  })

  it('cancels rename on Escape', async () => {
    const user = userEvent.setup()
    createTestGraphs()
    render(<GraphTabs />)
    await user.dblClick(screen.getByText('Graph 1'))
    const input = screen.getByTestId('graph-tab-rename-input')
    await user.clear(input)
    await user.type(input, 'Should Not Save{Escape}')
    expect(screen.queryByTestId('graph-tab-rename-input')).not.toBeInTheDocument()
    expect(screen.getByText('Graph 1')).toBeInTheDocument()
  })

  it('finishes rename on blur', async () => {
    const user = userEvent.setup()
    createTestGraphs()
    render(<GraphTabs />)
    await user.dblClick(screen.getByText('Graph 1'))
    const input = screen.getByTestId('graph-tab-rename-input')
    await user.clear(input)
    await user.type(input, 'Blur Rename')
    await user.tab()
    const state = useGraphStore.getState()
    expect(state.graphs.some(g => g.name === 'Blur Rename')).toBe(true)
  })
})
