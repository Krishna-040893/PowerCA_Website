/**
 * @fileoverview Tests for Error Boundary component
 * Tests cover error capturing, logging, recovery, and different error levels
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../error-boundary'
import { logger } from '@/lib/logger'

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock Google Analytics
const mockGtag = jest.fn()
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
})

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that throws an async error
const ThrowAsyncError = () => {
  setTimeout(() => {
    throw new Error('Async error')
  }, 0)
  return <div>Async component</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Error Capturing', () => {
    it('should catch and display errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByText(/test error message/i)).toBeInTheDocument()
    })

    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child component')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })

    it('should catch errors and log them', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (component)',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
          errorBoundary: 'component',
        })
      )
    })

    it('should track errors in Google Analytics', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'exception',
        expect.objectContaining({
          description: 'Test error message',
          fatal: false,
        })
      )
    })
  })

  describe('Error Levels', () => {
    it('should handle component-level errors', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (component)',
        expect.any(Error),
        expect.objectContaining({
          errorBoundary: 'component',
        })
      )
    })

    it('should handle page-level errors', () => {
      render(
        <ErrorBoundary level="page">
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (page)',
        expect.any(Error),
        expect.objectContaining({
          errorBoundary: 'page',
        })
      )
    })

    it('should handle global-level errors as fatal', () => {
      render(
        <ErrorBoundary level="global">
          <ThrowError />
        </ErrorBoundary>
      )

      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'exception',
        expect.objectContaining({
          fatal: true,
        })
      )
    })
  })

  describe('Error Recovery', () => {
    it('should provide a reset button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const resetButton = screen.getByRole('button', { name: /try again/i })
      expect(resetButton).toBeInTheDocument()
    })

    it('should reset error state when reset button is clicked', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      // Don't throw error on next render
      shouldThrow = false

      const resetButton = screen.getByRole('button', { name: /try again/i })
      await user.click(resetButton)

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('Error ID Generation', () => {
    it('should generate a unique error ID for each error', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const errorId1 = screen.getByText(/error id:/i).textContent

      // Reset and trigger another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const errorId2 = screen.getByText(/error id:/i).textContent

      expect(errorId1).not.toBe(errorId2)
    })

    it('should include error ID in logs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (component)',
        expect.any(Error),
        expect.objectContaining({
          errorId: expect.stringMatching(/^err_\d+_[a-z0-9]+$/),
        })
      )
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (
        <div>
          <h1>Custom Error</h1>
          <p>Please contact support</p>
        </div>
      )

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom Error')).toBeInTheDocument()
      expect(screen.getByText('Please contact support')).toBeInTheDocument()
    })

    it('should render custom fallback function with error details', () => {
      const fallbackFn = (error: Error, errorId: string) => (
        <div>
          <h1>Error: {error.message}</h1>
          <p>ID: {errorId}</p>
        </div>
      )

      render(
        <ErrorBoundary fallback={fallbackFn}>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Error: Test error message/i)).toBeInTheDocument()
      expect(screen.getByText(/ID: err_/)).toBeInTheDocument()
    })
  })

  describe('Error Information', () => {
    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/test error message/i)).toBeInTheDocument()
    })

    it('should display error ID for support reference', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const errorId = screen.getByText(/error id:/i)
      expect(errorId).toBeInTheDocument()
      expect(errorId.textContent).toMatch(/err_\d+_[a-z0-9]+/)
    })

    it('should include component stack in logs', () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <ThrowError />
            </div>
          </div>
        </ErrorBoundary>
      )

      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (component)',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining('ThrowError'),
        })
      )
    })
  })

  describe('Browser Information', () => {
    it('should log URL when error occurs', () => {
      // Set a specific URL
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com/test-page',
        },
        writable: true,
      })

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (component)',
        expect.any(Error),
        expect.objectContaining({
          url: 'https://example.com/test-page',
        })
      )
    })

    it('should log user agent when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(logger.error).toHaveBeenCalledWith(
        'React Error Boundary (component)',
        expect.any(Error),
        expect.objectContaining({
          userAgent: expect.any(String),
        })
      )
    })
  })

  describe('Multiple Errors', () => {
    it('should handle multiple sequential errors', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/test error message/i)).toBeInTheDocument()

      // Reset
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // Throw another error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/test error message/i)).toBeInTheDocument()
      expect(logger.error).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined children', () => {
      const { container } = render(<ErrorBoundary>{null}</ErrorBoundary>)

      expect(container.firstChild).toBeNull()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should not catch errors outside the boundary', () => {
      // This test verifies the boundary doesn't interfere with errors outside it
      expect(() => {
        render(
          <div>
            <ErrorBoundary>
              <div>Safe component</div>
            </ErrorBoundary>
            <ThrowError />
          </div>
        )
      }).toThrow('Test error message')
    })
  })
})
