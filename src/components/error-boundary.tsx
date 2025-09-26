'use client'
import React, { Component, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  level?: 'page' | 'component' | 'global'
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { level = 'component' } = this.props

    // Log error with context
    logger.error(`React Error Boundary (${level})`, error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: level,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      errorId: this.state.errorId,
    })

    // Send to external monitoring when available
    if (typeof window !== 'undefined') {
      // Google Analytics error tracking
      if ((window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: level === 'global',
          error_id: this.state.errorId,
        })
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, level = 'component' } = this.props

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={this.handleReset}
          />
        )
      }

      // Default fallbacks based on level
      if (level === 'global') {
        return <GlobalErrorFallback error={this.state.error!} reset={this.handleReset} />
      }

      if (level === 'page') {
        return <PageErrorFallback error={this.state.error!} reset={this.handleReset} />
      }

      return <ComponentErrorFallback error={this.state.error!} reset={this.handleReset} />
    }

    return this.props.children
  }
}

// Fallback components
function GlobalErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>

            <a
              href="/contact"
              className="block text-sm text-blue-600 hover:underline"
            >
              Contact Support
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

function PageErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Page Error</h2>
        <p className="text-gray-600 mb-4">This page encountered an error.</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

function ComponentErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Component Error</h3>
          <div className="mt-2">
            <p className="text-sm text-red-700">
              This component failed to load. You can try reloading it.
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={reset}
              className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Convenience wrapper components
export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary level="global">{children}</ErrorBoundary>
}

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary level="page">{children}</ErrorBoundary>
}

export function ComponentErrorBoundary({
  children,
  fallback
}: {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}) {
  return <ErrorBoundary level="component" fallback={fallback}>{children}</ErrorBoundary>
}