import type { ArchitectPlugin, PluginComponentDef } from './types'

class PluginRegistry {
  private plugins: Map<string, ArchitectPlugin> = new Map()

  register(plugin: ArchitectPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered`)
    }
    this.plugins.set(plugin.id, plugin)
  }

  unregister(pluginId: string): void {
    this.plugins.delete(pluginId)
  }

  getPlugin(pluginId: string): ArchitectPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): ArchitectPlugin[] {
    return Array.from(this.plugins.values())
  }

  getAllComponents(): PluginComponentDef[] {
    const components: PluginComponentDef[] = []
    for (const plugin of this.plugins.values()) {
      components.push(...plugin.components)
    }
    return components
  }

  getComponentDef(type: string): PluginComponentDef | undefined {
    for (const plugin of this.plugins.values()) {
      const def = plugin.components.find((c) => c.type === type)
      if (def) return def
    }
    return undefined
  }

  clear(): void {
    this.plugins.clear()
  }
}

export const pluginRegistry = new PluginRegistry()
export { PluginRegistry }
