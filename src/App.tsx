import { useCallback, useRef, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import type { ComponentType } from './types/architecture'
import { COMPONENT_LABELS } from './types/architecture'
import { parseRequirements, generateArchitecture } from './engine/architectureEngine'
import { downloadJson, downloadPng } from './engine/exportService'
import { importJson } from './engine/importService'
import { useGraphStore, getActiveGraph, getSelectedComponent } from './store/graphStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { RequirementsPanel } from './components/RequirementsPanel'
import { ComponentPalette } from './components/ComponentPalette'
import { PropertiesPanel } from './components/PropertiesPanel'
import { ArchitectureCanvas } from './components/ArchitectureCanvas'
import { GraphTabs } from './components/GraphTabs'
import { TemplateSelector } from './components/TemplateSelector'
import { SearchBar } from './components/SearchBar'
import { PluginPalette } from './components/PluginPalette'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  const store = useGraphStore()
  const graph = getActiveGraph(store)
  const selectedComponent = getSelectedComponent(store)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useKeyboardShortcuts()

  // Create a default graph if none exist
  useEffect(() => {
    if (store.graphs.length === 0) {
      store.createGraph('Untitled')
    }
  }, [store])

  const handleGenerate = useCallback(
    (text: string) => {
      const reqs = parseRequirements(text)
      const arch = generateArchitecture(reqs)
      store.setGraph(arch)
      store.setSelectedComponent(null)
    },
    [store]
  )

  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      const x = 100 + Math.random() * 400
      const y = 100 + Math.random() * 300
      store.addComponent(type, COMPONENT_LABELS[type], x, y)
    },
    [store]
  )

  const handleUpdateComponent = useCallback(
    (id: string, updates: { label?: string; description?: string }) => {
      store.updateComponent(id, updates)
    },
    [store]
  )

  const handleDeleteComponent = useCallback(
    (id: string) => {
      store.removeComponent(id)
    },
    [store]
  )

  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      store.updatePosition(id, x, y)
    },
    [store]
  )

  const handleConnect = useCallback(
    (source: string, target: string) => {
      store.addConnection(source, target, 'connects to')
    },
    [store]
  )

  const handleRemoveConnection = useCallback(
    (connectionId: string) => {
      store.removeConnection(connectionId)
    },
    [store]
  )

  const handleExportJson = useCallback(() => {
    downloadJson(graph)
  }, [graph])

  const handleExportPng = useCallback(async () => {
    const el = canvasRef.current?.querySelector('.react-flow') as HTMLElement | null
    if (el) {
      await downloadPng(el)
    }
  }, [])

  const handleImportJson = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        try {
          const result = importJson(text)
          if (result.valid && result.graph) {
            store.importGraph(file.name.replace('.json', ''), result.graph)
          } else {
            console.error('Invalid architecture JSON:', result.error)
          }
        } catch (err) {
          console.error('Failed to import JSON:', err)
        }
      }
      reader.readAsText(file)
      // Reset so the same file can be re-imported
      e.target.value = ''
    },
    [store]
  )

  const handleSelectFromSearch = useCallback(
    (id: string) => {
      store.setSelectedComponent(id)
    },
    [store]
  )

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-950 text-gray-100">
        {/* Left Sidebar */}
        <aside className="w-72 flex flex-col border-r border-gray-700 overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-lg font-bold text-white">The Architect</h1>
            <p className="text-xs text-gray-400 mt-1">
              Advanced multi-graph architecture platform
            </p>
          </div>
          <RequirementsPanel onGenerate={handleGenerate} />
          <TemplateSelector />
          <ComponentPalette onAddComponent={handleAddComponent} />
          <PluginPalette />
          <PropertiesPanel
            selected={selectedComponent}
            onUpdate={handleUpdateComponent}
            onDelete={handleDeleteComponent}
          />
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 flex flex-col">
          <GraphTabs />
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {graph.components.length} components &middot; {graph.connections.length} connections
              </span>
              <SearchBar
                components={graph.components}
                onSelectComponent={handleSelectFromSearch}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImportJson}
                className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600 transition-colors"
                data-testid="import-json-btn"
              >
                Import JSON
              </button>
              <button
                onClick={handleExportJson}
                disabled={graph.components.length === 0}
                className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600 disabled:opacity-40 transition-colors"
                data-testid="export-json-btn"
              >
                Export JSON
              </button>
              <button
                onClick={handleExportPng}
                disabled={graph.components.length === 0}
                className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded text-xs hover:bg-gray-600 disabled:opacity-40 transition-colors"
                data-testid="export-png-btn"
              >
                Export PNG
              </button>
            </div>
          </div>
          <div className="flex-1" ref={canvasRef}>
            <ReactFlowProvider>
              <ArchitectureCanvas
                graph={graph}
                onSelectComponent={store.setSelectedComponent}
                onPositionChange={handlePositionChange}
                onConnect={handleConnect}
                onRemoveConnection={handleRemoveConnection}
              />
            </ReactFlowProvider>
          </div>
        </main>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
          data-testid="import-file-input"
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
