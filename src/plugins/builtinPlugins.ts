import type { ArchitectPlugin } from './types'

export const infrastructurePlugin: ArchitectPlugin = {
  id: 'builtin-infrastructure',
  name: 'Infrastructure',
  version: '1.0.0',
  description: 'Additional infrastructure components: CDN, DNS, container orchestration',
  components: [
    {
      type: 'cdn',
      label: 'CDN',
      color: '#f97316',
      description: 'Content Delivery Network',
      category: 'infrastructure',
    },
    {
      type: 'dns',
      label: 'DNS',
      color: '#84cc16',
      description: 'Domain Name System',
      category: 'infrastructure',
    },
    {
      type: 'container',
      label: 'Container',
      color: '#06b6d4',
      description: 'Container / Kubernetes Pod',
      category: 'infrastructure',
    },
    {
      type: 'serverless',
      label: 'Lambda',
      color: '#a855f7',
      description: 'Serverless Function',
      category: 'infrastructure',
    },
  ],
}

export const securityPlugin: ArchitectPlugin = {
  id: 'builtin-security',
  name: 'Security',
  version: '1.0.0',
  description: 'Security components: firewall, WAF, identity provider',
  components: [
    {
      type: 'firewall',
      label: 'Firewall',
      color: '#dc2626',
      description: 'Network Firewall / WAF',
      category: 'security',
    },
    {
      type: 'identity',
      label: 'Identity Provider',
      color: '#7c3aed',
      description: 'OAuth2 / OIDC Identity Provider',
      category: 'security',
    },
    {
      type: 'vault',
      label: 'Secret Vault',
      color: '#b91c1c',
      description: 'Secrets Management (Vault/KMS)',
      category: 'security',
    },
  ],
}

export const observabilityPlugin: ArchitectPlugin = {
  id: 'builtin-observability',
  name: 'Observability',
  version: '1.0.0',
  description: 'Observability components: monitoring, logging, tracing',
  components: [
    {
      type: 'monitor',
      label: 'Monitoring',
      color: '#eab308',
      description: 'Metrics & Monitoring (Prometheus/Grafana)',
      category: 'observability',
    },
    {
      type: 'logger',
      label: 'Log Aggregator',
      color: '#22c55e',
      description: 'Centralized Logging (ELK/Loki)',
      category: 'observability',
    },
    {
      type: 'tracer',
      label: 'Distributed Tracing',
      color: '#0ea5e9',
      description: 'Request Tracing (Jaeger/Zipkin)',
      category: 'observability',
    },
  ],
}

export const BUILTIN_PLUGINS: ArchitectPlugin[] = [
  infrastructurePlugin,
  securityPlugin,
  observabilityPlugin,
]
