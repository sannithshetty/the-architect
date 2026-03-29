import { describe, it, expect, beforeEach } from 'vitest'
import { PluginRegistry } from '../pluginRegistry'
import type { ArchitectPlugin } from '../types'
import { BUILTIN_PLUGINS } from '../builtinPlugins'

const mockPlugin: ArchitectPlugin = {
  id: 'test-plugin',
  name: 'Test Plugin',
  version: '1.0.0',
  description: 'A test plugin',
  components: [
    {
      type: 'test-comp',
      label: 'Test Component',
      color: '#ff0000',
      description: 'A test component',
      category: 'custom',
    },
  ],
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry

  beforeEach(() => {
    registry = new PluginRegistry()
  })

  it('registers a plugin', () => {
    registry.register(mockPlugin)
    expect(registry.getPlugin('test-plugin')).toBeDefined()
    expect(registry.getPlugin('test-plugin')!.name).toBe('Test Plugin')
  })

  it('throws on duplicate registration', () => {
    registry.register(mockPlugin)
    expect(() => registry.register(mockPlugin)).toThrow('already registered')
  })

  it('unregisters a plugin', () => {
    registry.register(mockPlugin)
    registry.unregister('test-plugin')
    expect(registry.getPlugin('test-plugin')).toBeUndefined()
  })

  it('returns all plugins', () => {
    registry.register(mockPlugin)
    const all = registry.getAllPlugins()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe('test-plugin')
  })

  it('returns all components from all plugins', () => {
    registry.register(mockPlugin)
    const components = registry.getAllComponents()
    expect(components).toHaveLength(1)
    expect(components[0].type).toBe('test-comp')
  })

  it('gets a component def by type', () => {
    registry.register(mockPlugin)
    const def = registry.getComponentDef('test-comp')
    expect(def).toBeDefined()
    expect(def!.label).toBe('Test Component')
  })

  it('returns undefined for unknown component type', () => {
    expect(registry.getComponentDef('nonexistent')).toBeUndefined()
  })

  it('clears all plugins', () => {
    registry.register(mockPlugin)
    registry.clear()
    expect(registry.getAllPlugins()).toHaveLength(0)
  })
})

describe('BUILTIN_PLUGINS', () => {
  it('has at least 3 built-in plugins', () => {
    expect(BUILTIN_PLUGINS.length).toBeGreaterThanOrEqual(3)
  })

  it('each plugin has unique id', () => {
    const ids = BUILTIN_PLUGINS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each plugin has at least one component', () => {
    for (const plugin of BUILTIN_PLUGINS) {
      expect(plugin.components.length).toBeGreaterThan(0)
    }
  })

  it('all component types across plugins are unique', () => {
    const types = BUILTIN_PLUGINS.flatMap((p) => p.components.map((c) => c.type))
    expect(new Set(types).size).toBe(types.length)
  })
})
