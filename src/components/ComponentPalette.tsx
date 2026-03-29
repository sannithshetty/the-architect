import type { ComponentType } from '../types/architecture'
import { COMPONENT_COLORS, COMPONENT_LABELS } from '../types/architecture'

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void
}

const COMPONENT_TYPES: ComponentType[] = [
  'client',
  'gateway',
  'loadbalancer',
  'service',
  'database',
  'cache',
  'queue',
  'storage',
]

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border-b border-gray-700 bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Components
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {COMPONENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onAddComponent(type)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-200 hover:border-gray-400 transition-colors"
            data-testid={`palette-${type}`}
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: COMPONENT_COLORS[type] }}
            />
            {COMPONENT_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
