import { Handle, Position, type NodeProps } from '@xyflow/react'

interface ArchitectureNodeData {
  label: string
  componentType: string
  color: string
  [key: string]: unknown
}

export function ArchitectureNode({ data }: NodeProps) {
  const { label, componentType, color } = data as unknown as ArchitectureNodeData

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 bg-gray-800 min-w-[140px] text-center shadow-lg"
      style={{ borderColor: color }}
      data-testid="architecture-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        {componentType}
      </div>
      <div className="text-sm font-medium text-gray-100">{label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
