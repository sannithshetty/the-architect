import { TEMPLATES } from '../engine/templates'
import { useGraphStore } from '../store/graphStore'

export function TemplateSelector() {
  const createGraph = useGraphStore((s) => s.createGraph)

  const handleSelect = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    // Deep clone the template graph so edits don't mutate the template
    const graph = JSON.parse(JSON.stringify(template.graph))
    createGraph(template.name, graph)
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-b border-gray-700 bg-gray-900" data-testid="template-selector">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Templates
      </h2>
      <div className="flex flex-col gap-1">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className="flex flex-col items-start px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-200 hover:border-gray-400 transition-colors text-left"
            data-testid={`template-${t.id}`}
          >
            <span className="font-medium">{t.name}</span>
            <span className="text-gray-500 text-[10px] mt-0.5">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
