import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertiesPanel } from '../PropertiesPanel'
import type { ArchitectureComponent } from '../../types/architecture'

const mockComponent: ArchitectureComponent = {
  id: 'c1',
  type: 'service',
  label: 'API Service',
  description: 'Handles API requests',
  x: 100,
  y: 200,
}

describe('PropertiesPanel', () => {
  it('shows placeholder when nothing is selected', () => {
    render(<PropertiesPanel selected={null} onUpdate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/select a component/i)).toBeInTheDocument()
  })

  it('shows properties when component is selected', () => {
    render(<PropertiesPanel selected={mockComponent} onUpdate={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByTestId('property-label')).toHaveValue('API Service')
    expect(screen.getByTestId('property-description')).toHaveValue('Handles API requests')
  })

  it('calls onUpdate when label changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<PropertiesPanel selected={mockComponent} onUpdate={onUpdate} onDelete={vi.fn()} />)
    const input = screen.getByTestId('property-label')
    await user.clear(input)
    await user.type(input, 'New Name')
    // onUpdate is called for each character change
    expect(onUpdate).toHaveBeenCalled()
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1]
    expect(lastCall[0]).toBe('c1')
    expect(lastCall[1]).toHaveProperty('label')
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<PropertiesPanel selected={mockComponent} onUpdate={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByTestId('delete-component-btn'))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })
})
