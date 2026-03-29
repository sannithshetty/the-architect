import { describe, it, expect } from 'vitest'
import { importJson } from '../importService'

describe('importJson', () => {
  it('returns invalid for non-JSON string', () => {
    const result = importJson('not json at all')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid JSON')
  })

  it('returns invalid for non-object JSON', () => {
    const result = importJson('"hello"')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('JSON must be an object')
  })

  it('returns invalid for missing components', () => {
    const result = importJson('{"connections": []}')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('components')
  })

  it('returns invalid for missing connections', () => {
    const result = importJson('{"components": []}')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('connections')
  })

  it('returns invalid for invalid component', () => {
    const json = JSON.stringify({
      components: [{ id: 'c1' }], // missing required fields
      connections: [],
    })
    const result = importJson(json)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid component')
  })

  it('returns invalid for invalid connection', () => {
    const json = JSON.stringify({
      components: [
        { id: 'c1', type: 'service', label: 'A', description: 'desc', x: 0, y: 0 },
      ],
      connections: [{ id: 'e1', source: 'c1' }], // missing target and label
    })
    const result = importJson(json)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid connection')
  })

  it('returns invalid for connection referencing unknown source', () => {
    const json = JSON.stringify({
      components: [
        { id: 'c1', type: 'service', label: 'A', description: 'desc', x: 0, y: 0 },
      ],
      connections: [{ id: 'e1', source: 'nonexistent', target: 'c1', label: 'test' }],
    })
    const result = importJson(json)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('unknown source')
  })

  it('returns invalid for connection referencing unknown target', () => {
    const json = JSON.stringify({
      components: [
        { id: 'c1', type: 'service', label: 'A', description: 'desc', x: 0, y: 0 },
      ],
      connections: [{ id: 'e1', source: 'c1', target: 'nonexistent', label: 'test' }],
    })
    const result = importJson(json)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('unknown target')
  })

  it('parses valid graph successfully', () => {
    const json = JSON.stringify({
      components: [
        { id: 'c1', type: 'service', label: 'API', description: 'Main API', x: 100, y: 200 },
        { id: 'c2', type: 'database', label: 'DB', description: 'Database', x: 300, y: 200 },
      ],
      connections: [
        { id: 'e1', source: 'c1', target: 'c2', label: 'reads/writes' },
      ],
    })
    const result = importJson(json)
    expect(result.valid).toBe(true)
    expect(result.graph).toBeDefined()
    expect(result.graph!.components).toHaveLength(2)
    expect(result.graph!.connections).toHaveLength(1)
  })

  it('parses empty graph successfully', () => {
    const json = JSON.stringify({ components: [], connections: [] })
    const result = importJson(json)
    expect(result.valid).toBe(true)
    expect(result.graph!.components).toHaveLength(0)
    expect(result.graph!.connections).toHaveLength(0)
  })
})
