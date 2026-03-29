export type ComponentType =
  | 'service'
  | 'database'
  | 'queue'
  | 'cache'
  | 'gateway'
  | 'client'
  | 'storage'
  | 'loadbalancer'

export interface ArchitectureComponent {
  id: string
  type: ComponentType
  label: string
  description: string
  x: number
  y: number
}

export interface ArchitectureConnection {
  id: string
  source: string
  target: string
  label: string
}

export interface ArchitectureGraph {
  components: ArchitectureComponent[]
  connections: ArchitectureConnection[]
}

export interface ParsedRequirement {
  keyword: string
  components: ComponentType[]
  label: string
}

export const COMPONENT_COLORS: Record<ComponentType, string> = {
  service: '#3b82f6',
  database: '#8b5cf6',
  queue: '#f59e0b',
  cache: '#ef4444',
  gateway: '#10b981',
  client: '#6366f1',
  storage: '#ec4899',
  loadbalancer: '#14b8a6',
}

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  service: 'Service',
  database: 'Database',
  queue: 'Message Queue',
  cache: 'Cache',
  gateway: 'API Gateway',
  client: 'Client App',
  storage: 'Object Storage',
  loadbalancer: 'Load Balancer',
}
