import type { ArchitectureComponent } from '../types/architecture'
import { COMPONENT_COLORS } from '../types/architecture'

interface PropertiesPanelProps {
  selected: ArchitectureComponent | null
  onUpdate: (id: string, updates: { label?: string; description?: string }) => void
  onDelete: (id: string) => void
}

export function PropertiesPanel({ selected, onUpdate, onDelete }: PropertiesPanelProps) {
  if (!selected) {
    return (
      <div className="p-4 text-gray-500 text-sm italic">
        Select a component to view its properties
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4" data-testid="properties-panel">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Properties
      </h2>
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: COMPONENT_COLORS[selected.type] }}
        />
        <span className="text-xs text-gray-400 uppercase">{selected.type}</span>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Label</span>
        <input
          value={selected.label}
          onChange={(e) => onUpdate(selected.id, { label: e.target.value })}
          className="px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          data-testid="property-label"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-gray-400">Description</span>
        <textarea
          value={selected.description}
          onChange={(e) => onUpdate(selected.id, { description: e.target.value })}
          className="px-3 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg text-sm resize-none h-20 focus:outline-none focus:border-blue-500"
          data-testid="property-description"
        />
      </label>
      <button
        onClick={() => onDelete(selected.id)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 transition-colors"
        data-testid="delete-component-btn"
      >
        Delete Component
      </button>
    </div>
  )
}
