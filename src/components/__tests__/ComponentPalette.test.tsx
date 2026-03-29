import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentPalette } from '../ComponentPalette'

describe('ComponentPalette', () => {
  it('renders all component type buttons', () => {
    render(<ComponentPalette onAddComponent={vi.fn()} />)
    expect(screen.getByTestId('palette-service')).toBeInTheDocument()
    expect(screen.getByTestId('palette-database')).toBeInTheDocument()
    expect(screen.getByTestId('palette-queue')).toBeInTheDocument()
    expect(screen.getByTestId('palette-cache')).toBeInTheDocument()
    expect(screen.getByTestId('palette-gateway')).toBeInTheDocument()
    expect(screen.getByTestId('palette-client')).toBeInTheDocument()
    expect(screen.getByTestId('palette-storage')).toBeInTheDocument()
    expect(screen.getByTestId('palette-loadbalancer')).toBeInTheDocument()
  })

  it('calls onAddComponent with correct type on click', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<ComponentPalette onAddComponent={onAdd} />)
    await user.click(screen.getByTestId('palette-database'))
    expect(onAdd).toHaveBeenCalledWith('database')
  })
})
