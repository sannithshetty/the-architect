import { toPng } from 'html-to-image'
import type { ArchitectureGraph } from '../types/architecture'

export function exportAsJson(graph: ArchitectureGraph): string {
  return JSON.stringify(graph, null, 2)
}

export function downloadJson(graph: ArchitectureGraph, filename = 'architecture.json'): void {
  const json = exportAsJson(graph)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function downloadPng(
  element: HTMLElement,
  filename = 'architecture.png'
): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#111827',
    quality: 1,
  })
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}
