import type { ComponentType } from '../types/architecture'

/** Definition for a plugin-provided component type */
export interface PluginComponentDef {
  /** Unique type key (must not conflict with built-in types) */
  type: string
  /** Display label */
  label: string
  /** Hex color for the node border */
  color: string
  /** Short description */
  description: string
  /** Category for grouping in the palette */
  category: 'infrastructure' | 'security' | 'observability' | 'networking' | 'custom'
}

/** A plugin that extends The Architect with new component types */
export interface ArchitectPlugin {
  id: string
  name: string
  version: string
  description: string
  components: PluginComponentDef[]
}

/** Extended component type that includes plugin-provided types */
export type ExtendedComponentType = ComponentType | string
