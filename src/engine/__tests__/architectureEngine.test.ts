import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseRequirements,
  generateArchitecture,
  addComponentToGraph,
  removeComponentFromGraph,
  updateComponentInGraph,
  resetIdCounter,
} from '../architectureEngine'
import type { ArchitectureGraph } from '../../types/architecture'

describe('parseRequirements', () => {
  it('returns empty array for empty text', () => {
    expect(parseRequirements('')).toEqual([])
  })

  it('returns empty array for text with no recognized keywords', () => {
    expect(parseRequirements('hello world foo bar')).toEqual([])
  })

  it('parses a single keyword', () => {
    const result = parseRequirements('setup a database')
    expect(result.length).toBeGreaterThanOrEqual(1)
    const dbMatch = result.find((r) => r.keyword === 'database')
    expect(dbMatch).toBeDefined()
    expect(dbMatch!.components).toContain('database')
  })

  it('parses multiple keywords', () => {
    const result = parseRequirements('web app with database and caching')
    const keywords = result.map((r) => r.keyword)
    expect(keywords).toContain('web app')
    expect(keywords).toContain('database')
    expect(keywords).toContain('caching')
  })

  it('is case insensitive', () => {
    const result = parseRequirements('REST API with Database')
    const keywords = result.map((r) => r.keyword)
    expect(keywords).toContain('rest api')
    expect(keywords).toContain('database')
  })

  it('matches longer keywords before shorter ones', () => {
    const result = parseRequirements('rest api service')
    // 'rest api' should match as a single keyword
    const keywords = result.map((r) => r.keyword)
    expect(keywords).toContain('rest api')
  })

  it('does not duplicate keywords', () => {
    const result = parseRequirements('database database database')
    const dbMatches = result.filter((r) => r.keyword === 'database')
    expect(dbMatches).toHaveLength(1)
  })

  describe('cache-related keywords', () => {
    it('parses cache keyword and includes cache component', () => {
      const result = parseRequirements('add a cache layer')
      const cacheMatch = result.find((r) => r.keyword === 'cache')
      expect(cacheMatch).toBeDefined()
      expect(cacheMatch!.components).toContain('cache')
      expect(cacheMatch!.label).toBe('Cache')
    })

    it('parses cookie keyword and includes client and cache components', () => {
      const result = parseRequirements('use cookie for session tracking')
      const cookieMatch = result.find((r) => r.keyword === 'cookie')
      expect(cookieMatch).toBeDefined()
      expect(cookieMatch!.components).toContain('client')
      expect(cookieMatch!.components).toContain('cache')
      expect(cookieMatch!.label).toBe('Cookie Storage')
    })

    it('parses local storage keyword and includes client and cache components', () => {
      const result = parseRequirements('persist data in local storage')
      const lsMatch = result.find((r) => r.keyword === 'local storage')
      expect(lsMatch).toBeDefined()
      expect(lsMatch!.components).toContain('client')
      expect(lsMatch!.components).toContain('cache')
      expect(lsMatch!.label).toBe('Local Storage')
    })

    it('parses localstorage as single word', () => {
      const result = parseRequirements('use localstorage for preferences')
      const lsMatch = result.find((r) => r.keyword === 'localstorage')
      expect(lsMatch).toBeDefined()
      expect(lsMatch!.components).toContain('client')
      expect(lsMatch!.components).toContain('cache')
    })

    it('parses session storage keyword', () => {
      const result = parseRequirements('store temp data in session storage')
      const ssMatch = result.find((r) => r.keyword === 'session storage')
      expect(ssMatch).toBeDefined()
      expect(ssMatch!.components).toContain('client')
      expect(ssMatch!.components).toContain('cache')
      expect(ssMatch!.label).toBe('Session Storage')
    })

    it('generates architecture with cache, cookie, and local storage together', () => {
      const reqs = parseRequirements('app with cache, cookie, and local storage')
      const graph = generateArchitecture(reqs)

      // Should have components for all three
      expect(graph.components.some((c) => c.type === 'cache')).toBe(true)
      expect(graph.components.some((c) => c.type === 'client')).toBe(true)
      // At least cache (1) + cookie (client+cache) + local storage (client+cache) = 5 components
      expect(graph.components.length).toBeGreaterThanOrEqual(5)
    })

    it('generates connections between cache-related components', () => {
      const reqs = parseRequirements('cookie with local storage')
      const graph = generateArchitecture(reqs)
      // Each group (cookie, local storage) has 2 components with internal connections
      expect(graph.connections.length).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('generateArchitecture', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('returns empty graph for no requirements', () => {
    const graph = generateArchitecture([])
    expect(graph.components).toEqual([])
    expect(graph.connections).toEqual([])
  })

  it('generates components for a single requirement', () => {
    const reqs = parseRequirements('database')
    const graph = generateArchitecture(reqs)
    expect(graph.components.length).toBeGreaterThan(0)
    expect(graph.components.some((c) => c.type === 'database')).toBe(true)
  })

  it('generates components and connections for complex requirements', () => {
    const reqs = parseRequirements('web app with database and caching')
    const graph = generateArchitecture(reqs)
    expect(graph.components.length).toBeGreaterThanOrEqual(3)
    expect(graph.connections.length).toBeGreaterThan(0)
  })

  it('assigns positions to all components', () => {
    const reqs = parseRequirements('api with database and cache')
    const graph = generateArchitecture(reqs)
    for (const comp of graph.components) {
      expect(typeof comp.x).toBe('number')
      expect(typeof comp.y).toBe('number')
    }
  })

  it('creates connections within groups', () => {
    // 'web app' creates client, gateway, service — should have internal connections
    const reqs = parseRequirements('web app')
    const graph = generateArchitecture(reqs)
    expect(graph.connections.length).toBeGreaterThanOrEqual(2)
  })

  it('assigns unique ids to all components', () => {
    const reqs = parseRequirements('web app with database and queue and cache')
    const graph = generateArchitecture(reqs)
    const ids = graph.components.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('addComponentToGraph', () => {
  beforeEach(() => {
    resetIdCounter()
  })

  it('adds a component to an empty graph', () => {
    const empty: ArchitectureGraph = { components: [], connections: [] }
    const result = addComponentToGraph(empty, 'service', 'My Service', 100, 200)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].type).toBe('service')
    expect(result.components[0].label).toBe('My Service')
    expect(result.components[0].x).toBe(100)
    expect(result.components[0].y).toBe(200)
  })

  it('does not modify connections', () => {
    const graph: ArchitectureGraph = {
      components: [],
      connections: [{ id: 'e1', source: 'a', target: 'b', label: 'test' }],
    }
    const result = addComponentToGraph(graph, 'database', 'DB', 0, 0)
    expect(result.connections).toEqual(graph.connections)
  })
})

describe('removeComponentFromGraph', () => {
  it('removes a component by id', () => {
    const graph: ArchitectureGraph = {
      components: [
        { id: 'c1', type: 'service', label: 'A', description: '', x: 0, y: 0 },
        { id: 'c2', type: 'database', label: 'B', description: '', x: 0, y: 0 },
      ],
      connections: [],
    }
    const result = removeComponentFromGraph(graph, 'c1')
    expect(result.components).toHaveLength(1)
    expect(result.components[0].id).toBe('c2')
  })

  it('removes associated connections', () => {
    const graph: ArchitectureGraph = {
      components: [
        { id: 'c1', type: 'service', label: 'A', description: '', x: 0, y: 0 },
        { id: 'c2', type: 'database', label: 'B', description: '', x: 0, y: 0 },
        { id: 'c3', type: 'cache', label: 'C', description: '', x: 0, y: 0 },
      ],
      connections: [
        { id: 'e1', source: 'c1', target: 'c2', label: 'writes' },
        { id: 'e2', source: 'c2', target: 'c3', label: 'reads' },
        { id: 'e3', source: 'c1', target: 'c3', label: 'caches' },
      ],
    }
    const result = removeComponentFromGraph(graph, 'c1')
    expect(result.connections).toHaveLength(1)
    expect(result.connections[0].id).toBe('e2')
  })

  it('returns unchanged graph if id not found', () => {
    const graph: ArchitectureGraph = {
      components: [{ id: 'c1', type: 'service', label: 'A', description: '', x: 0, y: 0 }],
      connections: [],
    }
    const result = removeComponentFromGraph(graph, 'nonexistent')
    expect(result.components).toHaveLength(1)
  })
})

describe('updateComponentInGraph', () => {
  it('updates label of a component', () => {
    const graph: ArchitectureGraph = {
      components: [{ id: 'c1', type: 'service', label: 'Old', description: 'desc', x: 0, y: 0 }],
      connections: [],
    }
    const result = updateComponentInGraph(graph, 'c1', { label: 'New' })
    expect(result.components[0].label).toBe('New')
    expect(result.components[0].description).toBe('desc')
  })

  it('updates description of a component', () => {
    const graph: ArchitectureGraph = {
      components: [{ id: 'c1', type: 'service', label: 'A', description: 'old', x: 0, y: 0 }],
      connections: [],
    }
    const result = updateComponentInGraph(graph, 'c1', { description: 'new desc' })
    expect(result.components[0].description).toBe('new desc')
    expect(result.components[0].label).toBe('A')
  })

  it('does not modify other components', () => {
    const graph: ArchitectureGraph = {
      components: [
        { id: 'c1', type: 'service', label: 'A', description: '', x: 0, y: 0 },
        { id: 'c2', type: 'database', label: 'B', description: '', x: 0, y: 0 },
      ],
      connections: [],
    }
    const result = updateComponentInGraph(graph, 'c1', { label: 'Updated' })
    expect(result.components[1].label).toBe('B')
  })
})
