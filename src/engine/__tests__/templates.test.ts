import { describe, it, expect } from 'vitest'
import { TEMPLATES } from '../templates'

describe('TEMPLATES', () => {
  it('has at least 4 templates', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(4)
  })

  it('each template has a unique id', () => {
    const ids = TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each template has required fields', () => {
    for (const template of TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.name).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(Array.isArray(template.graph.components)).toBe(true)
      expect(Array.isArray(template.graph.connections)).toBe(true)
      expect(template.graph.components.length).toBeGreaterThan(0)
      expect(template.graph.connections.length).toBeGreaterThan(0)
    }
  })

  it('each template has unique component ids within its graph', () => {
    for (const template of TEMPLATES) {
      const ids = template.graph.components.map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('each template connection references valid component ids', () => {
    for (const template of TEMPLATES) {
      const componentIds = new Set(template.graph.components.map((c) => c.id))
      for (const conn of template.graph.connections) {
        expect(componentIds.has(conn.source)).toBe(true)
        expect(componentIds.has(conn.target)).toBe(true)
      }
    }
  })

  it('includes microservices template', () => {
    expect(TEMPLATES.find((t) => t.id === 'microservices')).toBeDefined()
  })

  it('includes serverless template', () => {
    expect(TEMPLATES.find((t) => t.id === 'serverless')).toBeDefined()
  })

  it('includes monolith template', () => {
    expect(TEMPLATES.find((t) => t.id === 'monolith')).toBeDefined()
  })

  it('includes event-driven template', () => {
    expect(TEMPLATES.find((t) => t.id === 'event-driven')).toBeDefined()
  })
})
