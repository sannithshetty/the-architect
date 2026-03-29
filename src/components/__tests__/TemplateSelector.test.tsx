import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateSelector } from '../TemplateSelector'
import { useGraphStore } from '../../store/graphStore'
import { TEMPLATES } from '../../engine/templates'

describe('TemplateSelector', () => {
  beforeEach(() => {
    useGraphStore.setState({
      graphs: [],
      activeGraphId: null,
      selectedComponentId: null,
    })
  })

  it('renders the template selector container', () => {
    render(<TemplateSelector />)
    expect(screen.getByTestId('template-selector')).toBeInTheDocument()
  })

  it('renders the Templates heading', () => {
    render(<TemplateSelector />)
    expect(screen.getByText('Templates')).toBeInTheDocument()
  })

  it('renders a button for each template', () => {
    render(<TemplateSelector />)
    for (const t of TEMPLATES) {
      expect(screen.getByTestId(`template-${t.id}`)).toBeInTheDocument()
    }
  })

  it('displays template names', () => {
    render(<TemplateSelector />)
    for (const t of TEMPLATES) {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    }
  })

  it('displays template descriptions', () => {
    render(<TemplateSelector />)
    for (const t of TEMPLATES) {
      expect(screen.getByText(t.description)).toBeInTheDocument()
    }
  })

  it('creates a new graph from template on click', async () => {
    const user = userEvent.setup()
    render(<TemplateSelector />)
    await user.click(screen.getByTestId(`template-${TEMPLATES[0].id}`))
    const state = useGraphStore.getState()
    expect(state.graphs).toHaveLength(1)
    expect(state.graphs[0].name).toBe(TEMPLATES[0].name)
    expect(state.graphs[0].graph.components.length).toBeGreaterThan(0)
  })

  it('creates graph with deep-cloned data (not same reference)', async () => {
    const user = userEvent.setup()
    render(<TemplateSelector />)
    await user.click(screen.getByTestId(`template-${TEMPLATES[0].id}`))
    const state = useGraphStore.getState()
    expect(state.graphs[0].graph).not.toBe(TEMPLATES[0].graph)
    expect(state.graphs[0].graph.components).not.toBe(TEMPLATES[0].graph.components)
  })

  it('renders all 4 built-in templates', () => {
    render(<TemplateSelector />)
    expect(TEMPLATES).toHaveLength(4)
    expect(screen.getByTestId('template-microservices')).toBeInTheDocument()
    expect(screen.getByTestId('template-serverless')).toBeInTheDocument()
    expect(screen.getByTestId('template-monolith')).toBeInTheDocument()
    expect(screen.getByTestId('template-event-driven')).toBeInTheDocument()
  })
})
