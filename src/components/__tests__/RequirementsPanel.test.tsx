import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RequirementsPanel } from '../RequirementsPanel'

describe('RequirementsPanel', () => {
  it('renders textarea and button', () => {
    render(<RequirementsPanel onGenerate={vi.fn()} />)
    expect(screen.getByTestId('requirements-input')).toBeInTheDocument()
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
  })

  it('disables button when input is empty', () => {
    render(<RequirementsPanel onGenerate={vi.fn()} />)
    expect(screen.getByTestId('generate-btn')).toBeDisabled()
  })

  it('enables button when input has text', async () => {
    const user = userEvent.setup()
    render(<RequirementsPanel onGenerate={vi.fn()} />)
    await user.type(screen.getByTestId('requirements-input'), 'web app')
    expect(screen.getByTestId('generate-btn')).toBeEnabled()
  })

  it('calls onGenerate with text on button click', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<RequirementsPanel onGenerate={onGenerate} />)
    await user.type(screen.getByTestId('requirements-input'), 'web app with database')
    await user.click(screen.getByTestId('generate-btn'))
    expect(onGenerate).toHaveBeenCalledWith('web app with database')
  })

  it('does not call onGenerate when text is only whitespace', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<RequirementsPanel onGenerate={onGenerate} />)
    await user.type(screen.getByTestId('requirements-input'), '   ')
    await user.click(screen.getByTestId('generate-btn'))
    expect(onGenerate).not.toHaveBeenCalled()
  })
})
