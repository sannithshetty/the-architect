import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PluginPalette } from '../PluginPalette'
import { useGraphStore } from '../../store/graphStore'
import { BUILTIN_PLUGINS } from '../../plugins/builtinPlugins'

describe('PluginPalette', () => {
  beforeEach(() => {
    useGraphStore.setState({
      graphs: [],
      activeGraphId: null,
      selectedComponentId: null,
    })
    // Create an active graph so addComponent works
    useGraphStore.getState().createGraph('Test Graph')
  })

  it('renders the plugin palette container', () => {
    render(<PluginPalette />)
    expect(screen.getByTestId('plugin-palette')).toBeInTheDocument()
  })

  it('renders the Plugin Components heading', () => {
    render(<PluginPalette />)
    expect(screen.getByText('Plugin Components')).toBeInTheDocument()
  })

  it('renders all plugin component buttons', () => {
    render(<PluginPalette />)
    const allComponents = BUILTIN_PLUGINS.flatMap(p => p.components)
    for (const comp of allComponents) {
      expect(screen.getByTestId(`plugin-${comp.type}`)).toBeInTheDocument()
    }
  })

  it('renders component labels', () => {
    render(<PluginPalette />)
    const allComponents = BUILTIN_PLUGINS.flatMap(p => p.components)
    for (const comp of allComponents) {
      expect(screen.getByText(comp.label)).toBeInTheDocument()
    }
  })

  it('groups components by category', () => {
    render(<PluginPalette />)
    expect(screen.getByText('infrastructure')).toBeInTheDocument()
    expect(screen.getByText('security')).toBeInTheDocument()
    expect(screen.getByText('observability')).toBeInTheDocument()
  })

  it('renders color indicators for each component', () => {
    const { container } = render(<PluginPalette />)
    const allComponents = BUILTIN_PLUGINS.flatMap(p => p.components)
    const colorDots = container.querySelectorAll('[style]')
    // At least one color dot per component
    expect(colorDots.length).toBeGreaterThanOrEqual(allComponents.length)
  })

  it('adds a component to the active graph on click', async () => {
    const user = userEvent.setup()
    render(<PluginPalette />)
    await user.click(screen.getByTestId('plugin-cdn'))
    const state = useGraphStore.getState()
    const activeGraph = state.graphs.find(g => g.id === state.activeGraphId)
    expect(activeGraph?.graph.components).toHaveLength(1)
    expect(activeGraph?.graph.components[0].label).toBe('CDN')
  })

  it('renders buttons with description tooltips', () => {
    render(<PluginPalette />)
    const cdnButton = screen.getByTestId('plugin-cdn')
    expect(cdnButton).toHaveAttribute('title', 'Content Delivery Network')
  })

  it('renders 10 total plugin components across 3 plugins', () => {
    render(<PluginPalette />)
    const allComponents = BUILTIN_PLUGINS.flatMap(p => p.components)
    expect(allComponents).toHaveLength(10)
    expect(BUILTIN_PLUGINS).toHaveLength(3)
  })
})
