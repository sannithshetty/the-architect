import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { ArchitectureNode } from '../ArchitectureNode'
import type { NodeProps } from '@xyflow/react'

function renderNode(data: { label: string; componentType: string; color: string }) {
  const props = {
    id: 'test-node',
    data,
    type: 'architecture',
    selected: false,
    isConnectable: true,
    zIndex: 0,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  } as unknown as NodeProps

  return render(
    <ReactFlowProvider>
      <ArchitectureNode {...props} />
    </ReactFlowProvider>
  )
}

describe('ArchitectureNode', () => {
  it('renders the component label', () => {
    renderNode({ label: 'User Service', componentType: 'service', color: '#3b82f6' })
    expect(screen.getByText('User Service')).toBeInTheDocument()
  })

  it('renders the component type', () => {
    renderNode({ label: 'My DB', componentType: 'database', color: '#8b5cf6' })
    expect(screen.getByText('database')).toBeInTheDocument()
  })

  it('applies the border color from data', () => {
    renderNode({ label: 'Cache', componentType: 'cache', color: '#ef4444' })
    const node = screen.getByTestId('architecture-node')
    expect(node).toHaveStyle({ borderColor: '#ef4444' })
  })

  it('renders with different component types', () => {
    const types = ['service', 'database', 'queue', 'cache', 'gateway']
    for (const type of types) {
      const { unmount } = renderNode({ label: `Test ${type}`, componentType: type, color: '#000' })
      expect(screen.getByText(type)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders source and target handles', () => {
    const { container } = renderNode({ label: 'Svc', componentType: 'service', color: '#3b82f6' })
    const handles = container.querySelectorAll('.react-flow__handle')
    expect(handles.length).toBe(2)
  })
})
