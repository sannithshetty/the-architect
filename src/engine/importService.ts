import type { ArchitectureGraph, ArchitectureComponent, ArchitectureConnection } from '../types/architecture'

export interface ImportResult {
  valid: boolean
  graph?: ArchitectureGraph
  error?: string
}

function isValidComponent(obj: unknown): obj is ArchitectureComponent {
  if (typeof obj !== 'object' || obj === null) return false
  const c = obj as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.type === 'string' &&
    typeof c.label === 'string' &&
    typeof c.description === 'string' &&
    typeof c.x === 'number' &&
    typeof c.y === 'number'
  )
}

function isValidConnection(obj: unknown): obj is ArchitectureConnection {
  if (typeof obj !== 'object' || obj === null) return false
  const c = obj as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.source === 'string' &&
    typeof c.target === 'string' &&
    typeof c.label === 'string'
  )
}

export function importJson(jsonString: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { valid: false, error: 'Invalid JSON' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'JSON must be an object' }
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.components)) {
    return { valid: false, error: 'Missing or invalid "components" array' }
  }

  if (!Array.isArray(obj.connections)) {
    return { valid: false, error: 'Missing or invalid "connections" array' }
  }

  const components: ArchitectureComponent[] = []
  for (let i = 0; i < obj.components.length; i++) {
    if (!isValidComponent(obj.components[i])) {
      return { valid: false, error: `Invalid component at index ${i}` }
    }
    components.push(obj.components[i] as ArchitectureComponent)
  }

  const connections: ArchitectureConnection[] = []
  for (let i = 0; i < obj.connections.length; i++) {
    if (!isValidConnection(obj.connections[i])) {
      return { valid: false, error: `Invalid connection at index ${i}` }
    }
    connections.push(obj.connections[i] as ArchitectureConnection)
  }

  // Validate connection references
  const componentIds = new Set(components.map((c) => c.id))
  for (const conn of connections) {
    if (!componentIds.has(conn.source)) {
      return { valid: false, error: `Connection "${conn.id}" references unknown source "${conn.source}"` }
    }
    if (!componentIds.has(conn.target)) {
      return { valid: false, error: `Connection "${conn.id}" references unknown target "${conn.target}"` }
    }
  }

  return { valid: true, graph: { components, connections } }
}
