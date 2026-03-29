import { useEffect } from 'react'
import { useGraphStore } from '../store/graphStore'

function getTemporalStore() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useGraphStore as any).temporal?.getState?.() as
    | { undo: () => void; redo: () => void }
    | undefined
}

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      // Don't intercept when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+Z: Undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const temporal = getTemporalStore()
        temporal?.undo()
        return
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        const temporal = getTemporalStore()
        temporal?.redo()
        return
      }

      // Delete/Backspace: Remove selected component
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedComponentId, removeComponent } = useGraphStore.getState()
        if (selectedComponentId) {
          e.preventDefault()
          removeComponent(selectedComponentId)
        }
        return
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        useGraphStore.getState().setSelectedComponent(null)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
