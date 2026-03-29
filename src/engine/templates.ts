import type { ArchitectureGraph } from '../types/architecture'

export interface ArchitectureTemplate {
  id: string
  name: string
  description: string
  graph: ArchitectureGraph
}

export const TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'API Gateway with multiple services, databases, cache, and message queue',
    graph: {
      components: [
        { id: 'tpl-client', type: 'client', label: 'Web Client', description: 'Frontend SPA', x: 350, y: 0 },
        { id: 'tpl-lb', type: 'loadbalancer', label: 'Load Balancer', description: 'Distributes traffic across gateway instances', x: 350, y: 120 },
        { id: 'tpl-gw', type: 'gateway', label: 'API Gateway', description: 'Routes requests and handles auth', x: 350, y: 240 },
        { id: 'tpl-auth', type: 'service', label: 'Auth Service', description: 'Authentication & authorization', x: 50, y: 380 },
        { id: 'tpl-user', type: 'service', label: 'User Service', description: 'User profile management', x: 250, y: 380 },
        { id: 'tpl-order', type: 'service', label: 'Order Service', description: 'Order processing', x: 450, y: 380 },
        { id: 'tpl-notify', type: 'service', label: 'Notification Service', description: 'Sends notifications', x: 650, y: 380 },
        { id: 'tpl-cache', type: 'cache', label: 'Redis Cache', description: 'Session and data cache', x: 50, y: 520 },
        { id: 'tpl-authdb', type: 'database', label: 'Auth DB', description: 'Credentials and tokens', x: 150, y: 520 },
        { id: 'tpl-userdb', type: 'database', label: 'User DB', description: 'User profiles', x: 300, y: 520 },
        { id: 'tpl-orderdb', type: 'database', label: 'Order DB', description: 'Orders and transactions', x: 450, y: 520 },
        { id: 'tpl-queue', type: 'queue', label: 'Message Queue', description: 'Async event bus', x: 600, y: 520 },
      ],
      connections: [
        { id: 'tpl-e1', source: 'tpl-client', target: 'tpl-lb', label: 'HTTPS' },
        { id: 'tpl-e2', source: 'tpl-lb', target: 'tpl-gw', label: 'routes' },
        { id: 'tpl-e3', source: 'tpl-gw', target: 'tpl-auth', label: 'auth check' },
        { id: 'tpl-e4', source: 'tpl-gw', target: 'tpl-user', label: 'user ops' },
        { id: 'tpl-e5', source: 'tpl-gw', target: 'tpl-order', label: 'order ops' },
        { id: 'tpl-e6', source: 'tpl-auth', target: 'tpl-cache', label: 'session' },
        { id: 'tpl-e7', source: 'tpl-auth', target: 'tpl-authdb', label: 'reads/writes' },
        { id: 'tpl-e8', source: 'tpl-user', target: 'tpl-userdb', label: 'reads/writes' },
        { id: 'tpl-e9', source: 'tpl-order', target: 'tpl-orderdb', label: 'reads/writes' },
        { id: 'tpl-e10', source: 'tpl-order', target: 'tpl-queue', label: 'publishes' },
        { id: 'tpl-e11', source: 'tpl-queue', target: 'tpl-notify', label: 'subscribes' },
      ],
    },
  },
  {
    id: 'serverless',
    name: 'Serverless',
    description: 'API Gateway with Lambda functions, DynamoDB, and S3 storage',
    graph: {
      components: [
        { id: 'tpl-client', type: 'client', label: 'Web/Mobile Client', description: 'Client application', x: 300, y: 0 },
        { id: 'tpl-gw', type: 'gateway', label: 'API Gateway', description: 'HTTP API routing', x: 300, y: 120 },
        { id: 'tpl-fn1', type: 'service', label: 'Function: CRUD', description: 'CRUD operations handler', x: 100, y: 260 },
        { id: 'tpl-fn2', type: 'service', label: 'Function: Auth', description: 'Authentication handler', x: 300, y: 260 },
        { id: 'tpl-fn3', type: 'service', label: 'Function: Process', description: 'Background processing', x: 500, y: 260 },
        { id: 'tpl-db', type: 'database', label: 'DynamoDB', description: 'NoSQL document store', x: 100, y: 400 },
        { id: 'tpl-store', type: 'storage', label: 'S3 Bucket', description: 'File and asset storage', x: 300, y: 400 },
        { id: 'tpl-queue', type: 'queue', label: 'SQS Queue', description: 'Async task processing', x: 500, y: 400 },
      ],
      connections: [
        { id: 'tpl-e1', source: 'tpl-client', target: 'tpl-gw', label: 'HTTPS' },
        { id: 'tpl-e2', source: 'tpl-gw', target: 'tpl-fn1', label: 'invokes' },
        { id: 'tpl-e3', source: 'tpl-gw', target: 'tpl-fn2', label: 'invokes' },
        { id: 'tpl-e4', source: 'tpl-fn1', target: 'tpl-db', label: 'reads/writes' },
        { id: 'tpl-e5', source: 'tpl-fn1', target: 'tpl-store', label: 'uploads' },
        { id: 'tpl-e6', source: 'tpl-fn1', target: 'tpl-queue', label: 'enqueues' },
        { id: 'tpl-e7', source: 'tpl-queue', target: 'tpl-fn3', label: 'triggers' },
        { id: 'tpl-e8', source: 'tpl-fn3', target: 'tpl-db', label: 'writes' },
      ],
    },
  },
  {
    id: 'monolith',
    name: 'Monolith',
    description: 'Traditional 3-tier architecture with load balancer, app server, and database',
    graph: {
      components: [
        { id: 'tpl-client', type: 'client', label: 'Browser', description: 'Web browser client', x: 300, y: 0 },
        { id: 'tpl-lb', type: 'loadbalancer', label: 'Load Balancer', description: 'NGINX/HAProxy', x: 300, y: 120 },
        { id: 'tpl-app1', type: 'service', label: 'App Server 1', description: 'Application instance', x: 150, y: 260 },
        { id: 'tpl-app2', type: 'service', label: 'App Server 2', description: 'Application instance', x: 450, y: 260 },
        { id: 'tpl-cache', type: 'cache', label: 'Session Cache', description: 'Shared session store', x: 300, y: 400 },
        { id: 'tpl-db', type: 'database', label: 'Primary Database', description: 'PostgreSQL', x: 150, y: 520 },
        { id: 'tpl-replica', type: 'database', label: 'Read Replica', description: 'Read-only replica', x: 450, y: 520 },
      ],
      connections: [
        { id: 'tpl-e1', source: 'tpl-client', target: 'tpl-lb', label: 'HTTPS' },
        { id: 'tpl-e2', source: 'tpl-lb', target: 'tpl-app1', label: 'round-robin' },
        { id: 'tpl-e3', source: 'tpl-lb', target: 'tpl-app2', label: 'round-robin' },
        { id: 'tpl-e4', source: 'tpl-app1', target: 'tpl-cache', label: 'sessions' },
        { id: 'tpl-e5', source: 'tpl-app2', target: 'tpl-cache', label: 'sessions' },
        { id: 'tpl-e6', source: 'tpl-app1', target: 'tpl-db', label: 'writes' },
        { id: 'tpl-e7', source: 'tpl-app2', target: 'tpl-replica', label: 'reads' },
        { id: 'tpl-e8', source: 'tpl-db', target: 'tpl-replica', label: 'replication' },
      ],
    },
  },
  {
    id: 'event-driven',
    name: 'Event-Driven',
    description: 'Event sourcing with CQRS pattern, message broker, and separate read/write stores',
    graph: {
      components: [
        { id: 'tpl-client', type: 'client', label: 'Client App', description: 'Frontend application', x: 300, y: 0 },
        { id: 'tpl-gw', type: 'gateway', label: 'API Gateway', description: 'Command & query routing', x: 300, y: 120 },
        { id: 'tpl-cmd', type: 'service', label: 'Command Service', description: 'Handles write operations', x: 100, y: 260 },
        { id: 'tpl-query', type: 'service', label: 'Query Service', description: 'Handles read operations', x: 500, y: 260 },
        { id: 'tpl-broker', type: 'queue', label: 'Event Broker', description: 'Kafka/RabbitMQ event bus', x: 300, y: 400 },
        { id: 'tpl-projector', type: 'service', label: 'Projector', description: 'Builds read models from events', x: 500, y: 400 },
        { id: 'tpl-eventstore', type: 'database', label: 'Event Store', description: 'Append-only event log', x: 100, y: 520 },
        { id: 'tpl-readdb', type: 'database', label: 'Read Model DB', description: 'Denormalized read store', x: 500, y: 520 },
      ],
      connections: [
        { id: 'tpl-e1', source: 'tpl-client', target: 'tpl-gw', label: 'commands/queries' },
        { id: 'tpl-e2', source: 'tpl-gw', target: 'tpl-cmd', label: 'commands' },
        { id: 'tpl-e3', source: 'tpl-gw', target: 'tpl-query', label: 'queries' },
        { id: 'tpl-e4', source: 'tpl-cmd', target: 'tpl-eventstore', label: 'appends events' },
        { id: 'tpl-e5', source: 'tpl-cmd', target: 'tpl-broker', label: 'publishes events' },
        { id: 'tpl-e6', source: 'tpl-broker', target: 'tpl-projector', label: 'events' },
        { id: 'tpl-e7', source: 'tpl-projector', target: 'tpl-readdb', label: 'updates' },
        { id: 'tpl-e8', source: 'tpl-query', target: 'tpl-readdb', label: 'reads' },
      ],
    },
  },
]
