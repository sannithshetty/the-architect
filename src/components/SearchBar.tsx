import { useState, useMemo } from 'react'
import type { ArchitectureComponent } from '../types/architecture'
import { COMPONENT_COLORS } from '../types/architecture'

interface SearchBarProps {
  components: ArchitectureComponent[]
  onSelectComponent: (id: string) => void
}

export function SearchBar({ components, onSelectComponent }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return components.filter(
      (c) =>
        c.label.toLowerCase().includes(lower) ||
        c.type.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower)
    )
  }, [query, components])

  const handleSelect = (id: string) => {
    onSelectComponent(id)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative" data-testid="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Delay to allow click on result
          setTimeout(() => setIsOpen(false), 200)
        }}
        placeholder="Search components..."
        className="w-full px-3 py-1.5 bg-gray-800 text-gray-100 border border-gray-600 rounded text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
        data-testid="search-input"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto" data-testid="search-results">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-gray-700 text-left"
              data-testid={`search-result-${c.id}`}
            >
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: COMPONENT_COLORS[c.type] ?? '#6b7280' }}
              />
              <span className="font-medium">{c.label}</span>
              <span className="text-gray-500 ml-auto">{c.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
