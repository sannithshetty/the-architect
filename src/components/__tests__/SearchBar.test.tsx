import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'
import type { ArchitectureComponent } from '../../types/architecture'

const mockComponents: ArchitectureComponent[] = [
  { id: 'c1', type: 'service', label: 'API Service', description: 'Main API', x: 0, y: 0 },
  { id: 'c2', type: 'database', label: 'User DB', description: 'User storage', x: 100, y: 0 },
  { id: 'c3', type: 'cache', label: 'Redis Cache', description: 'Session cache', x: 200, y: 0 },
]

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar components={mockComponents} onSelectComponent={vi.fn()} />)
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('shows results when typing a matching query', async () => {
    const user = userEvent.setup()
    render(<SearchBar components={mockComponents} onSelectComponent={vi.fn()} />)
    await user.type(screen.getByTestId('search-input'), 'API')
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
    expect(screen.getByTestId('search-result-c1')).toBeInTheDocument()
  })

  it('filters by component type', async () => {
    const user = userEvent.setup()
    render(<SearchBar components={mockComponents} onSelectComponent={vi.fn()} />)
    await user.type(screen.getByTestId('search-input'), 'database')
    expect(screen.getByTestId('search-result-c2')).toBeInTheDocument()
  })

  it('shows no results for non-matching query', async () => {
    const user = userEvent.setup()
    render(<SearchBar components={mockComponents} onSelectComponent={vi.fn()} />)
    await user.type(screen.getByTestId('search-input'), 'zzzzzzz')
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument()
  })

  it('calls onSelectComponent when result is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<SearchBar components={mockComponents} onSelectComponent={onSelect} />)
    await user.type(screen.getByTestId('search-input'), 'Redis')
    await user.click(screen.getByTestId('search-result-c3'))
    expect(onSelect).toHaveBeenCalledWith('c3')
  })
})
