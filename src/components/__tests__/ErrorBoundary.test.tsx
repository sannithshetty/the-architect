import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../ErrorBoundary'

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('resets error state when Try Again is clicked', async () => {
    const user = userEvent.setup()

    // We need a component that can toggle between throwing and not
    let shouldThrow = true
    function ToggleThrow() {
      if (shouldThrow) throw new Error('Oops')
      return <div>Recovered</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleThrow />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()

    // Fix the error condition
    shouldThrow = false
    await user.click(screen.getByTestId('error-boundary-reset'))

    // After reset, it should try to re-render children
    rerender(
      <ErrorBoundary>
        <ToggleThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText('Recovered')).toBeInTheDocument()
  })
})
