import { useState } from 'react'
import { useGraphStore } from '../store/graphStore'

export function GraphTabs() {
  const graphs = useGraphStore((s) => s.graphs)
  const activeGraphId = useGraphStore((s) => s.activeGraphId)
  const createGraph = useGraphStore((s) => s.createGraph)
  const deleteGraph = useGraphStore((s) => s.deleteGraph)
  const renameGraph = useGraphStore((s) => s.renameGraph)
  const setActiveGraph = useGraphStore((s) => s.setActiveGraph)
  const duplicateGraph = useGraphStore((s) => s.duplicateGraph)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreate = () => {
    createGraph(`Graph ${graphs.length + 1}`)
  }

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const handleFinishRename = () => {
    if (editingId && editName.trim()) {
      renameGraph(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-700 overflow-x-auto" data-testid="graph-tabs">
      {graphs.map((g) => (
        <div
          key={g.id}
          className={`group flex items-center gap-1 px-3 py-1.5 rounded-t text-xs cursor-pointer shrink-0 ${
            g.id === activeGraphId
              ? 'bg-gray-800 text-white border-t border-x border-gray-600'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
          onClick={() => setActiveGraph(g.id)}
          data-testid={`graph-tab-${g.id}`}
        >
          {editingId === g.id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename()
                if (e.key === 'Escape') setEditingId(null)
              }}
              className="bg-gray-700 text-white text-xs px-1 py-0.5 rounded w-24 outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              data-testid="graph-tab-rename-input"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation()
                handleStartRename(g.id, g.name)
              }}
              className="truncate max-w-[120px]"
            >
              {g.name}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              duplicateGraph(g.id)
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 text-xs ml-1"
            title="Duplicate"
            data-testid={`graph-tab-duplicate-${g.id}`}
          >
            ⧉
          </button>
          {graphs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteGraph(g.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs"
              title="Close"
              data-testid={`graph-tab-close-${g.id}`}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        onClick={handleCreate}
        className="px-2 py-1.5 text-gray-500 hover:text-white text-sm shrink-0"
        title="New Graph"
        data-testid="graph-tab-new"
      >
        +
      </button>
    </div>
  )
}
