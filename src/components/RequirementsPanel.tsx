import { useState } from 'react'

interface RequirementsPanelProps {
  onGenerate: (text: string) => void
}

export function RequirementsPanel({ onGenerate }: RequirementsPanelProps) {
  const [text, setText] = useState('')

  const handleGenerate = () => {
    if (text.trim()) {
      onGenerate(text)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border-b border-gray-700 bg-gray-900">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Requirements
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe your system requirements...&#10;e.g., A web app with user authentication, REST API, database, caching, and real-time notifications"
        className="w-full h-28 p-3 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg resize-none text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
        data-testid="requirements-input"
      />
      <button
        onClick={handleGenerate}
        disabled={!text.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        data-testid="generate-btn"
      >
        Generate Architecture
      </button>
    </div>
  )
}
