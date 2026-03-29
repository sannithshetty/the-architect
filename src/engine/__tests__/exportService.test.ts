import { describe, it, expect } from 'vitest'
import { exportAsJson } from '../exportService'
import type { ArchitectureGraph } from '../../types/architecture'

describe('exportAsJson', () => {
  it('returns valid JSON string for empty graph', () => {
    const graph: ArchitectureGraph = { components: [], connections: [] }
    const json = exportAsJson(graph)
    const parsed = JSON.parse(json)
    expect(parsed.components).toEqual([])
    expect(parsed.connections).toEqual([])
  })

  it('returns valid JSON with all component data', () => {
    const graph: ArchitectureGraph = {
      components: [
        { id: 'c1', type: 'service', label: 'API', description: 'Main API', x: 100, y: 200 },
      ],
      connections: [
        { id: 'e1', source: 'c1', target: 'c2', label: 'connects' },
      ],
    }
    const json = exportAsJson(graph)
    const parsed = JSON.parse(json)
    expect(parsed.components).toHaveLength(1)
    expect(parsed.components[0].id).toBe('c1')
    expect(parsed.components[0].type).toBe('service')
    expect(parsed.connections).toHaveLength(1)
    expect(parsed.connections[0].source).toBe('c1')
  })

  it('produces formatted JSON', () => {
    const graph: ArchitectureGraph = { components: [], connections: [] }
    const json = exportAsJson(graph)
    expect(json).toContain('\n')
  })
})
