import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArchitectureCanvas } from '../ArchitectureCanvas'
import type { ArchitectureGraph } from '../../types/architecture'

// Mock @xyflow/react since jsdom cannot render SVG-based ReactFlow
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual<typeof import('@xyflow/react')>('@xyflow/react')
  return {
    ...actual,
    ReactFlow: ({ nodes, edges, onNodeClick, onPaneClick, children }: {
      nodes: Array<{ id: string; data: { label: string } }>
      edges: Array<{ id: string }>
      onNodeClick?: (event: React.MouseEvent, node: { id: string }) => void
      onPaneClick?: () => void
      children?: React.ReactNode
    }) => (
      <div data-testid="mock-reactflow">
        <div data-testid="node-count">{nodes.length}</div>
        <div data-testid="edge-count">{edges.length}</div>
        {nodes.map(n => (
          <div
            key={n.id}
            data-testid={`node-${n.id}`}
            onClick={(e) => onNodeClick?.(e, { id: n.id } as never)}
          >
            {n.data.label}
          </div>
        ))}
        <div data-testid="pane" onClick={() => onPaneClick?.()} />
        {children}
      </div>
    ),
    Background: () => <div data-testid="mock-background" />,
    Controls: () => <div data-testid="mock-controls" />,
    MiniMap: () => <div data-testid="mock-minimap" />,
    BackgroundVariant: { Dots: 'dots' },
    MarkerType: { ArrowClosed: 'arrowclosed' },
    applyNodeChanges: actual.applyNodeChanges,
    applyEdgeChanges: actual.applyEdgeChanges,
  }
})

const emptyGraph: ArchitectureGraph = { components: [], connections: [] }

const sampleGraph: ArchitectureGraph = {
  components: [
    { id: 'c1', type: 'service', label: 'API', description: 'API service', x: 0, y: 0 },
    { id: 'c2', type: 'database', label: 'DB', description: 'Database', x: 100, y: 100 },
    { id: 'c3', type: 'cache', label: 'Cache', description: 'Redis', x: 200, y: 0 },
  ],
  connections: [
    { id: 'conn1', source: 'c1', target: 'c2', label: 'reads' },
    { id: 'conn2', source: 'c1', target: 'c3', label: 'caches' },
  ],
}

describe('ArchitectureCanvas', () => {
  let onSelectComponent: (id: string | null) => void
  let onPositionChange: (id: string, x: number, y: number) => void
  let onConnect: (source: string, target: string) => void
  let onRemoveConnection: (connectionId: string) => void

  beforeEach(() => {
    onSelectComponent = vi.fn<(id: string | null) => void>()
    onPositionChange = vi.fn<(id: string, x: number, y: number) => void>()
    onConnect = vi.fn<(source: string, target: string) => void>()
    onRemoveConnection = vi.fn<(connectionId: string) => void>()
  })

  it('renders the canvas container', () => {
    render(
      <ArchitectureCanvas
        graph={emptyGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    expect(screen.getByTestId('architecture-canvas')).toBeInTheDocument()
  })

  it('renders with an empty graph', () => {
    render(
      <ArchitectureCanvas
        graph={emptyGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    expect(screen.getByTestId('node-count')).toHaveTextContent('0')
    expect(screen.getByTestId('edge-count')).toHaveTextContent('0')
  })

  it('maps components to nodes', () => {
    render(
      <ArchitectureCanvas
        graph={sampleGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    expect(screen.getByTestId('node-count')).toHaveTextContent('3')
    expect(screen.getByTestId('node-c1')).toHaveTextContent('API')
    expect(screen.getByTestId('node-c2')).toHaveTextContent('DB')
    expect(screen.getByTestId('node-c3')).toHaveTextContent('Cache')
  })

  it('maps connections to edges', () => {
    render(
      <ArchitectureCanvas
        graph={sampleGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    expect(screen.getByTestId('edge-count')).toHaveTextContent('2')
  })

  it('calls onSelectComponent when a node is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(
      <ArchitectureCanvas
        graph={sampleGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    await user.click(screen.getByTestId('node-c1'))
    expect(onSelectComponent).toHaveBeenCalledWith('c1')
  })

  it('calls onSelectComponent(null) when pane is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(
      <ArchitectureCanvas
        graph={sampleGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    await user.click(screen.getByTestId('pane'))
    expect(onSelectComponent).toHaveBeenCalledWith(null)
  })

  it('renders Background, Controls, and MiniMap', () => {
    render(
      <ArchitectureCanvas
        graph={emptyGraph}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    expect(screen.getByTestId('mock-background')).toBeInTheDocument()
    expect(screen.getByTestId('mock-controls')).toBeInTheDocument()
    expect(screen.getByTestId('mock-minimap')).toBeInTheDocument()
  })

  it('handles graph with no connections', () => {
    const graphNoEdges: ArchitectureGraph = {
      components: [
        { id: 'c1', type: 'service', label: 'Solo', description: 'Alone', x: 0, y: 0 },
      ],
      connections: [],
    }
    render(
      <ArchitectureCanvas
        graph={graphNoEdges}
        onSelectComponent={onSelectComponent}
        onPositionChange={onPositionChange}
      />
    )
    expect(screen.getByTestId('node-count')).toHaveTextContent('1')
    expect(screen.getByTestId('edge-count')).toHaveTextContent('0')
  })

  it('accepts optional onConnect and onRemoveConnection props', () => {
    expect(() => {
      render(
        <ArchitectureCanvas
          graph={sampleGraph}
          onSelectComponent={onSelectComponent}
          onPositionChange={onPositionChange}
          onConnect={onConnect}
          onRemoveConnection={onRemoveConnection}
        />
      )
    }).not.toThrow()
  })
})
