import { pluginRegistry } from '../plugins/pluginRegistry'
import { BUILTIN_PLUGINS } from '../plugins/builtinPlugins'
import { useGraphStore } from '../store/graphStore'
import { useState, useEffect } from 'react'
import type { PluginComponentDef } from '../plugins/types'

// Register built-in plugins on first load
let initialized = false
function ensurePluginsRegistered() {
  if (initialized) return
  for (const plugin of BUILTIN_PLUGINS) {
    try {
      pluginRegistry.register(plugin)
    } catch {
      // Already registered
    }
  }
  initialized = true
}

export function PluginPalette() {
  const addComponent = useGraphStore((s) => s.addComponent)
  const [components, setComponents] = useState<PluginComponentDef[]>([])

  useEffect(() => {
    ensurePluginsRegistered()
    setComponents(pluginRegistry.getAllComponents())
  }, [])

  const grouped = components.reduce<Record<string, PluginComponentDef[]>>((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = []
    acc[comp.category].push(comp)
    return acc
  }, {})

  const handleAdd = (comp: PluginComponentDef) => {
    const x = 100 + Math.random() * 400
    const y = 100 + Math.random() * 300
    addComponent(comp.type as never, comp.label, x, y)
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-b border-gray-700 bg-gray-900" data-testid="plugin-palette">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Plugin Components
      </h2>
      {Object.entries(grouped).map(([category, comps]) => (
        <div key={category}>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{category}</div>
          <div className="grid grid-cols-2 gap-1">
            {comps.map((comp) => (
              <button
                key={comp.type}
                onClick={() => handleAdd(comp)}
                className="flex items-center gap-2 px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200 hover:border-gray-400 transition-colors"
                title={comp.description}
                data-testid={`plugin-${comp.type}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: comp.color }}
                />
                {comp.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
