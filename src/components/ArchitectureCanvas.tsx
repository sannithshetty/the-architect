import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { ArchitectureGraph } from '../types/architecture'
import { COMPONENT_COLORS } from '../types/architecture'
import { ArchitectureNode } from './ArchitectureNode'

interface ArchitectureCanvasProps {
  graph: ArchitectureGraph
  onSelectComponent: (id: string | null) => void
  onPositionChange: (id: string, x: number, y: number) => void
  onConnect?: (source: string, target: string) => void
  onRemoveConnection?: (connectionId: string) => void
}

export function ArchitectureCanvas({
  graph,
  onSelectComponent,
  onPositionChange,
  onConnect,
  onRemoveConnection,
}: ArchitectureCanvasProps) {
  const nodeTypes = useMemo(() => ({ architecture: ArchitectureNode }), [])

  const nodes: Node[] = useMemo(
    () =>
      graph.components.map((comp) => ({
        id: comp.id,
        type: 'architecture',
        position: { x: comp.x, y: comp.y },
        data: {
          label: comp.label,
          componentType: comp.type,
          color: COMPONENT_COLORS[comp.type] ?? '#6b7280',
        },
      })),
    [graph.components]
  )

  const edges: Edge[] = useMemo(
    () =>
      graph.connections.map((conn) => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        label: conn.label,
        animated: true,
        style: { stroke: '#64748b' },
        labelStyle: { fill: '#94a3b8', fontSize: 11 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
      })),
    [graph.connections]
  )

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const applied = applyNodeChanges(changes, nodes)
      for (const node of applied) {
        const original = nodes.find((n) => n.id === node.id)
        if (original && (node.position.x !== original.position.x || node.position.y !== original.position.y)) {
          onPositionChange(node.id, node.position.x, node.position.y)
        }
      }
    },
    [nodes, onPositionChange]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Handle edge removals
      if (onRemoveConnection) {
        for (const change of changes) {
          if (change.type === 'remove') {
            onRemoveConnection(change.id)
          }
        }
      }
      // Apply other edge changes
      applyEdgeChanges(changes, edges)
    },
    [edges, onRemoveConnection]
  )

  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (onConnect && connection.source && connection.target) {
        onConnect(connection.source, connection.target)
      }
    },
    [onConnect]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectComponent(node.id)
    },
    [onSelectComponent]
  )

  const onPaneClick = useCallback(() => {
    onSelectComponent(null)
  }, [onSelectComponent])

  return (
    <div className="h-full w-full" data-testid="architecture-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        connectionLineStyle={{ stroke: '#64748b' }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#64748b' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
        }}
      >
        <Background color="#374151" variant={BackgroundVariant.Dots} />
        <Controls className="!bg-gray-800 !border-gray-600 [&>button]:!bg-gray-800 [&>button]:!border-gray-600 [&>button]:!text-gray-300" />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { color?: string }
            return data?.color ?? '#6b7280'
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-gray-900 !border-gray-600"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
