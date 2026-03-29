import type {
  ArchitectureGraph,
  ArchitectureComponent,
  ArchitectureConnection,
  ComponentType,
  ParsedRequirement,
} from '../types/architecture'

const KEYWORD_MAP: Record<string, { components: ComponentType[]; label: string }> = {
  // User-facing
  'web app': { components: ['client', 'gateway', 'service'], label: 'Web Application' },
  'mobile app': { components: ['client', 'gateway', 'service'], label: 'Mobile Application' },
  'frontend': { components: ['client'], label: 'Frontend' },
  'ui': { components: ['client'], label: 'User Interface' },

  // API & Networking
  'api': { components: ['gateway', 'service'], label: 'API' },
  'rest api': { components: ['gateway', 'service'], label: 'REST API' },
  'graphql': { components: ['gateway', 'service'], label: 'GraphQL API' },
  'microservice': { components: ['gateway', 'service', 'service'], label: 'Microservices' },
  'load balancer': { components: ['loadbalancer'], label: 'Load Balancer' },

  // Data
  'database': { components: ['database'], label: 'Database' },
  'sql': { components: ['database'], label: 'SQL Database' },
  'nosql': { components: ['database'], label: 'NoSQL Database' },
  'data': { components: ['database', 'service'], label: 'Data Layer' },
  'storage': { components: ['storage'], label: 'Object Storage' },
  'file upload': { components: ['storage', 'service'], label: 'File Upload' },

  // Messaging & Async
  'queue': { components: ['queue'], label: 'Message Queue' },
  'message': { components: ['queue'], label: 'Messaging' },
  'event': { components: ['queue', 'service'], label: 'Event System' },
  'notification': { components: ['queue', 'service'], label: 'Notifications' },
  'real-time': { components: ['queue', 'service'], label: 'Real-time' },

  // Performance
  'cache': { components: ['cache'], label: 'Cache' },
  'caching': { components: ['cache'], label: 'Caching Layer' },
  'performance': { components: ['cache', 'loadbalancer'], label: 'Performance' },
  'scalab': { components: ['loadbalancer', 'cache'], label: 'Scalability' },

  // Auth
  'auth': { components: ['service', 'database'], label: 'Authentication' },
  'login': { components: ['service', 'database'], label: 'Auth Service' },
  'user': { components: ['service', 'database'], label: 'User Service' },

  // Processing
  'search': { components: ['service', 'database'], label: 'Search' },
  'payment': { components: ['service', 'database'], label: 'Payment Service' },
  'email': { components: ['service', 'queue'], label: 'Email Service' },
  'analytics': { components: ['service', 'database'], label: 'Analytics' },
  'logging': { components: ['service', 'database'], label: 'Logging' },
  'monitoring': { components: ['service', 'database'], label: 'Monitoring' },
}

export function parseRequirements(text: string): ParsedRequirement[] {
  const lower = text.toLowerCase()
  const matched: ParsedRequirement[] = []
  const seen = new Set<string>()

  // Sort keywords by length (longest first) to match more specific terms first
  const sortedKeywords = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length)

  for (const keyword of sortedKeywords) {
    if (lower.includes(keyword) && !seen.has(keyword)) {
      seen.add(keyword)
      const entry = KEYWORD_MAP[keyword]
      matched.push({
        keyword,
        components: entry.components,
        label: entry.label,
      })
    }
  }

  return matched
}

let idCounter = 0

function nextId(prefix: string): string {
  idCounter++
  return `${prefix}-${idCounter}`
}

export function resetIdCounter(): void {
  idCounter = 0
}

export function generateArchitecture(requirements: ParsedRequirement[]): ArchitectureGraph {
  resetIdCounter()

  const components: ArchitectureComponent[] = []
  const connections: ArchitectureConnection[] = []
  const typeCount: Record<string, number> = {}

  // Track component groups by requirement for connection generation
  const groups: ArchitectureComponent[][] = []

  // Layout parameters
  const colWidth = 250
  const rowHeight = 120
  const startX = 50
  const startY = 50
  const maxCols = 4

  for (const req of requirements) {
    const group: ArchitectureComponent[] = []

    for (const compType of req.components) {
      typeCount[compType] = (typeCount[compType] || 0) + 1
      const count = typeCount[compType]
      const totalIdx = components.length
      const col = totalIdx % maxCols
      const row = Math.floor(totalIdx / maxCols)

      const component: ArchitectureComponent = {
        id: nextId(compType),
        type: compType,
        label: count > 1 ? `${req.label} ${compType} ${count}` : `${req.label} ${compType}`,
        description: `${req.label} - ${compType} component`,
        x: startX + col * colWidth,
        y: startY + row * rowHeight,
      }

      components.push(component)
      group.push(component)
    }

    groups.push(group)
  }

  // Create connections within each group (chain pattern)
  for (const group of groups) {
    for (let i = 0; i < group.length - 1; i++) {
      connections.push({
        id: nextId('edge'),
        source: group[i].id,
        target: group[i + 1].id,
        label: 'connects to',
      })
    }
  }

  // Connect groups that share component types (e.g., services to databases)
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const groupATypes = new Set(groups[i].map((c) => c.type))
      const groupBTypes = new Set(groups[j].map((c) => c.type))

      // Connect gateway → service across groups
      if (groupATypes.has('gateway') && groupBTypes.has('service')) {
        const gw = groups[i].find((c) => c.type === 'gateway')
        const svc = groups[j].find((c) => c.type === 'service')
        if (gw && svc) {
          connections.push({
            id: nextId('edge'),
            source: gw.id,
            target: svc.id,
            label: 'routes to',
          })
        }
      }

      // Connect services → databases across groups
      if (groupATypes.has('service') && groupBTypes.has('database')) {
        const svc = groups[i].find((c) => c.type === 'service')
        const db = groups[j].find((c) => c.type === 'database')
        if (svc && db) {
          connections.push({
            id: nextId('edge'),
            source: svc.id,
            target: db.id,
            label: 'reads/writes',
          })
        }
      }
    }
  }

  return { components, connections }
}

export function addComponentToGraph(
  graph: ArchitectureGraph,
  type: ComponentType,
  label: string,
  x: number,
  y: number
): ArchitectureGraph {
  const component: ArchitectureComponent = {
    id: nextId(type),
    type,
    label,
    description: `${label} component`,
    x,
    y,
  }

  return {
    components: [...graph.components, component],
    connections: graph.connections,
  }
}

export function removeComponentFromGraph(
  graph: ArchitectureGraph,
  componentId: string
): ArchitectureGraph {
  return {
    components: graph.components.filter((c) => c.id !== componentId),
    connections: graph.connections.filter(
      (conn) => conn.source !== componentId && conn.target !== componentId
    ),
  }
}

export function updateComponentInGraph(
  graph: ArchitectureGraph,
  componentId: string,
  updates: Partial<Pick<ArchitectureComponent, 'label' | 'description'>>
): ArchitectureGraph {
  return {
    components: graph.components.map((c) =>
      c.id === componentId ? { ...c, ...updates } : c
    ),
    connections: graph.connections,
  }
}
