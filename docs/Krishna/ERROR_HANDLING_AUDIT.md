# PowerCA Website - Error Handling & Monitoring Audit

## Executive Summary

Date: 2025-01-26
Auditor: Claude Code QA Agent
Status: **CRITICAL GAPS IDENTIFIED** ⚠️

The PowerCA website shows sophisticated API-level error handling but lacks critical client-side error boundaries and production monitoring. This audit provides actionable recommendations to improve reliability and user experience.

## Overall Assessment

| Category | Status | Priority | Impact |
|----------|--------|----------|---------|
| API Error Handling | ✅ **Excellent** | - | Solid foundation |
| React Error Boundaries | ❌ **Missing** | 🚨 Critical | White screen crashes |
| Production Monitoring | ❌ **Missing** | 🚨 Critical | No error visibility |
| Form Error Handling | ⚠️ **Partial** | ⚠️ High | Data loss risk |
| Loading States | ⚠️ **Inconsistent** | 📋 Medium | Poor UX |
| Custom Error Pages | ❌ **Missing** | ⚠️ High | Generic error pages |

---

## 🚨 Critical Issues (Fix Immediately)

### 1. Missing React Error Boundaries

**Problem**: JavaScript errors crash the entire application with white screen of death.

**Files to Create**:
- `src/components/error-boundary.tsx`
- Update `src/app/layout.tsx`

**Implementation**: See [Error Boundary Implementation](#error-boundary-implementation)

---

### 2. No Production Error Monitoring

**Problem**: Zero visibility into production errors and user issues.

**Files to Create**:
- `src/lib/monitoring.ts`
- Update `src/lib/logger.ts`

**Implementation**: See [Monitoring Setup](#monitoring-setup)

---

### 3. Missing Custom Error Pages

**Problem**: Users see generic browser error pages instead of branded experience.

**Files to Create**:
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/global-error.tsx`

**Implementation**: See [Custom Error Pages](#custom-error-pages)

---

## ⚠️ High Priority Issues

### 4. Inconsistent Client-Side Error Handling

**Problem**: Network errors not handled consistently across components.

**Files to Create**:
- `src/hooks/use-api-call.ts`
- `src/lib/api-client.ts`

**Implementation**: See [Client-Side Error Handling](#client-side-error-handling)

---

### 5. Form Data Loss on Errors

**Problem**: Users lose form data when submission fails.

**Files to Update**:
- All form components
- Create form error handling utilities

**Implementation**: See [Form Error Handling](#form-error-handling)

---

## 📋 Medium Priority Issues

### 6. Inconsistent Loading States

**Problem**: Loading indicators are inconsistent across the application.

**Files to Create**:
- `src/components/ui/loading-states.tsx`
- `src/contexts/loading-context.tsx`

---

## Implementation Guide

### Error Boundary Implementation

Create `src/components/error-boundary.tsx`:

```tsx
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
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: level === 'global',
          error_id: this.state.errorId,
        })
      }

      // Future Sentry integration point
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          tags: {
            errorBoundary: level,
            errorId: this.state.errorId
          },
          extra: {
            componentStack: errorInfo.componentStack,
          }
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
```

**Update `src/app/layout.tsx`:**

```tsx
import { GlobalErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`}>
        <GlobalErrorBoundary>
          <GoogleTagManager />
          <GoogleTagManagerNoscript />
          <GoogleAnalytics />
          <SessionProvider>
            <ConditionalLayoutWrapper>
              {children}
            </ConditionalLayoutWrapper>
            <Toaster />
          </SessionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
```

---

### Monitoring Setup

Create `src/lib/monitoring.ts`:

```tsx
import { logger } from './logger'

// Types for monitoring
interface ErrorEvent {
  message: string
  stack?: string
  url: string
  line?: number
  column?: number
  userAgent: string
  timestamp: string
  userId?: string
  sessionId: string
}

interface PerformanceEvent {
  metric: string
  value: number
  context?: Record<string, any>
  timestamp: string
}

class MonitoringService {
  private sessionId: string
  private userId?: string
  private queue: any[] = []
  private flushInterval = 30000 // 30 seconds
  private maxQueueSize = 50

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupErrorHandlers()
    this.setupPerformanceMonitoring()
    this.startPeriodicFlush()
  }

  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('monitoring_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('monitoring_session_id', sessionId)
      }
      return sessionId
    }
    return 'server_session'
  }

  private setupErrorHandlers() {
    if (typeof window === 'undefined') return

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
      })
    })

    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        line: event.lineno,
        column: event.colno,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
      })
    })

    // Send queued events before page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.capturePerformance({
            metric: 'LCP',
            value: entry.startTime,
            timestamp: new Date().toISOString(),
          })
        }
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        logger.debug('LCP observer not supported')
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.capturePerformance({
            metric: 'FID',
            value: (entry as any).processingStart - entry.startTime,
            timestamp: new Date().toISOString(),
          })
        }
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        logger.debug('FID observer not supported')
      }

      // Long Tasks (performance bottlenecks)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.capturePerformance({
              metric: 'LongTask',
              value: entry.duration,
              context: {
                name: entry.name,
                startTime: entry.startTime,
              },
              timestamp: new Date().toISOString(),
            })
          }
        }
      })

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        logger.debug('Long task observer not supported')
      }
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        this.capturePerformance({
          metric: 'PageLoad',
          value: navigation.loadEventEnd - navigation.navigationStart,
          context: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            firstPaint: this.getFirstPaint(),
          },
          timestamp: new Date().toISOString(),
        })
      }, 100)
    })
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint?.startTime
  }

  private startPeriodicFlush() {
    if (typeof window === 'undefined') return

    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  public captureError(error: ErrorEvent) {
    logger.error('Monitoring captured error', error)

    this.queue.push({
      type: 'error',
      ...error,
    })

    this.checkQueueSize()
  }

  public capturePerformance(event: PerformanceEvent) {
    logger.info('Performance event', event)

    this.queue.push({
      type: 'performance',
      ...event,
    })

    this.checkQueueSize()
  }

  public captureUserAction(action: string, context?: Record<string, any>) {
    this.queue.push({
      type: 'user_action',
      action,
      context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
    })

    this.checkQueueSize()
  }

  private checkQueueSize() {
    if (this.queue.length >= this.maxQueueSize) {
      this.flush()
    }
  }

  private async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      // Send to your monitoring endpoint
      await fetch('/api/monitoring/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          metadata: {
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
            timestamp: new Date().toISOString(),
          }
        }),
      })
    } catch (error) {
      // If sending fails, put events back in queue
      this.queue.unshift(...events)
      logger.error('Failed to send monitoring events', error)
    }
  }

  // Method to manually flush (useful for critical errors)
  public async forceFlush() {
    await this.flush()
  }
}

// Singleton instance
export const monitoring = new MonitoringService()

// Initialize monitoring in production
export function initMonitoring() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Monitor is already initialized as singleton
    logger.info('Monitoring service initialized')
  }
}

// Helper functions for common use cases
export function trackError(error: Error | string, context?: Record<string, any>) {
  const errorObj = error instanceof Error ? error : new Error(error)

  monitoring.captureError({
    message: errorObj.message,
    stack: errorObj.stack,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    timestamp: new Date().toISOString(),
    sessionId: monitoring['sessionId'],
    userId: monitoring['userId'],
    ...context,
  })
}

export function trackPerformance(metric: string, value: number, context?: Record<string, any>) {
  monitoring.capturePerformance({
    metric,
    value,
    context,
    timestamp: new Date().toISOString(),
  })
}

export function trackUserAction(action: string, context?: Record<string, any>) {
  monitoring.captureUserAction(action, context)
}
```

**Create monitoring API endpoint `src/app/api/monitoring/events/route.ts`:**

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, rateLimitPresets } from '@/lib/rate-limit'

const checkRateLimit = rateLimit(rateLimitPresets.api)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many monitoring requests' },
        { status: 429 }
      )
    }

    const { events, metadata } = await request.json()

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events must be an array' },
        { status: 400 }
      )
    }

    // Process each event
    for (const event of events) {
      switch (event.type) {
        case 'error':
          logger.error('Client error reported', {
            message: event.message,
            stack: event.stack,
            url: event.url,
            userAgent: event.userAgent,
            sessionId: event.sessionId,
            userId: event.userId,
          })
          break

        case 'performance':
          logger.info('Performance metric', {
            metric: event.metric,
            value: event.value,
            context: event.context,
          })
          break

        case 'user_action':
          logger.info('User action', {
            action: event.action,
            context: event.context,
            sessionId: event.sessionId,
            userId: event.userId,
          })
          break

        default:
          logger.warn('Unknown monitoring event type', { event })
      }
    }

    return NextResponse.json({ success: true, processed: events.length })

  } catch (error) {
    logger.error('Monitoring endpoint error', error)
    return NextResponse.json(
      { error: 'Failed to process monitoring events' },
      { status: 500 }
    )
  }
}
```

**Update `src/app/layout.tsx` to initialize monitoring:**

```tsx
import { initMonitoring } from '@/lib/monitoring'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize monitoring in production
  if (typeof window !== 'undefined') {
    initMonitoring()
  }

  return (
    // ... rest of layout
  )
}
```

---

### Custom Error Pages

Create `src/app/error.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { trackError } from '@/lib/monitoring'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error
    logger.error('Application error page triggered', error, {
      digest: error.digest,
      url: window.location.href,
    })

    // Track in monitoring
    trackError(error, {
      page: 'error_page',
      digest: error.digest,
    })
  }, [error])

  const handleReset = () => {
    trackUserAction('error_page_retry', { error: error.message })
    reset()
  }

  const handleGoHome = () => {
    trackUserAction('error_page_go_home', { error: error.message })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h1>

            {/* Description */}
            <p className="mt-2 text-sm text-gray-600">
              We're sorry, but something unexpected happened. Don't worry - our team has been
              automatically notified and we're working to fix the issue.
            </p>

            {/* Error ID for support */}
            {error.digest && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500">
                  Error ID: <code className="font-mono">{error.digest}</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please include this ID when contacting support.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleReset}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={handleGoHome}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Homepage
              </button>

              <Link
                href="/contact"
                className="block w-full text-center py-2 px-4 text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Contact Support
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Here are some things you can try:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Refresh the page (Ctrl/Cmd + R)</li>
                <li>• Clear your browser cache</li>
                <li>• Check your internet connection</li>
                <li>• Try again in a few minutes</li>
              </ul>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  🔧 Developer Details
                </summary>
                <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
                  <pre className="text-xs text-red-800 overflow-auto max-h-40">
                    {error.stack || error.message}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

Create `src/app/not-found.tsx`:

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Home, Search, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 - Page Not Found | PowerCA',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to PowerCA
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl font-bold text-blue-600">404</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
            It might have been moved, deleted, or the URL might be incorrect.
          </p>

          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="Search our site..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value
                    if (query.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(query)}`
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>

            <Link
              href="/contact"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </div>

          {/* Popular Pages */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Popular Pages
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Link
                href="/pricing"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Pricing Plans
              </Link>
              <Link
                href="/book-demo"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Book Demo
              </Link>
              <Link
                href="/tools"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                CA Tools
              </Link>
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-xs text-gray-500">
            <p>Still can't find what you're looking for?</p>
            <p className="mt-1">
              <Link href="/contact" className="text-blue-600 hover:underline">
                Get in touch with our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

Create `src/app/global-error.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the global error
    logger.error('Global error handler triggered', error, {
      digest: error.digest,
      level: 'global',
    })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                <h1 className="mt-4 text-xl font-bold text-gray-900">
                  Application Error
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                  The application encountered a critical error and needs to be restarted.
                </p>

                <div className="mt-6">
                  <button
                    onClick={() => reset()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Restart Application
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full text-center py-2 px-4 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Go to Homepage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
```

---

### Client-Side Error Handling

Create `src/hooks/use-api-call.ts`:

```tsx
import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { trackError } from '@/lib/monitoring'

interface UseApiCallOptions {
  retry?: number
  retryDelay?: number
  timeout?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showErrorToast?: boolean
}

interface ApiCallState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useApiCall<T = any>() {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (
    apiCall: (signal?: AbortSignal) => Promise<Response>,
    options: UseApiCallOptions = {}
  ) => {
    const {
      retry = 3,
      retryDelay = 1000,
      timeout = 10000,
      onSuccess,
      onError,
      showErrorToast = true,
    } = options

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setState(prev => ({ ...prev, loading: true, error: null }))

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        // Setup timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort()
        }, timeout)

        const response = await apiCall(signal)

        clearTimeout(timeoutId)

        // Check if request was aborted
        if (signal.aborted) {
          throw new Error('Request was cancelled')
        }

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error?.message ||
                             errorData.message ||
                             `HTTP ${response.status}: ${response.statusText}`

          throw new ApiError(errorMessage, response.status, errorData)
        }

        // Parse response
        const data = await response.json()

        setState({
          data,
          loading: false,
          error: null,
        })

        onSuccess?.(data)
        return data

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        // Handle specific error types
        if (lastError.name === 'AbortError' || lastError.message.includes('cancelled')) {
          setState(prev => ({ ...prev, loading: false }))
          return // Don't retry cancelled requests
        }

        // Log error for monitoring
        logger.error('API call failed', lastError, {
          attempt: attempt + 1,
          maxRetries: retry + 1,
          url: 'api-call', // You might want to pass URL for better tracking
        })

        trackError(lastError, {
          context: 'api_call',
          attempt: attempt + 1,
          maxRetries: retry + 1,
        })

        // Determine if we should retry
        const shouldRetry = attempt < retry && isRetryableError(lastError)

        if (shouldRetry) {
          // Exponential backoff with jitter
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // All retries exhausted or non-retryable error
        setState({
          data: null,
          loading: false,
          error: lastError,
        })

        onError?.(lastError)

        if (showErrorToast) {
          showErrorToast && displayErrorToast(lastError)
        }

        throw lastError
      }
    }

    throw lastError || new Error('API call failed')
  }, [])

  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Retry last failed request
  const retry = useCallback(async (options?: UseApiCallOptions) => {
    // This would need the last apiCall stored, which is complex
    // For now, just reset the error state
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    execute,
    cancel,
    retry,
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Determine if an error is retryable
function isRetryableError(error: Error): boolean {
  if (error instanceof ApiError) {
    // Retry server errors but not client errors
    return error.status >= 500 || error.status === 0
  }

  // Retry network errors and timeouts
  return (
    error.message.includes('NetworkError') ||
    error.message.includes('timeout') ||
    error.message.includes('fetch') ||
    error.name === 'TypeError'
  )
}

// Display appropriate error toast based on error type
function displayErrorToast(error: Error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        toast.error('Invalid request. Please check your input.')
        break
      case 401:
        toast.error('Please log in to continue.')
        break
      case 403:
        toast.error('You don\'t have permission to perform this action.')
        break
      case 404:
        toast.error('The requested resource was not found.')
        break
      case 429:
        toast.error('Too many requests. Please wait a moment and try again.')
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      default:
        toast.error(error.message || 'An error occurred. Please try again.')
    }
  } else if (error.message.includes('NetworkError') || error.name === 'TypeError') {
    toast.error('Network connection error. Please check your internet and try again.')
  } else if (error.message.includes('timeout')) {
    toast.error('Request timed out. Please try again.')
  } else {
    toast.error(error.message || 'An unexpected error occurred.')
  }
}

// Convenience hook for simple GET requests
export function useApiGet<T = any>(url: string, options?: UseApiCallOptions) {
  const { execute, ...rest } = useApiCall<T>()

  const get = useCallback(() => {
    return execute(
      (signal) => fetch(url, { signal }),
      options
    )
  }, [url, execute, options])

  return {
    ...rest,
    get,
  }
}

// Convenience hook for POST requests
export function useApiPost<T = any>(url: string, options?: UseApiCallOptions) {
  const { execute, ...rest } = useApiCall<T>()

  const post = useCallback((data?: any) => {
    return execute(
      (signal) => fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal,
      }),
      options
    )
  }, [url, execute, options])

  return {
    ...rest,
    post,
  }
}
```

---

### Form Error Handling

Create `src/hooks/use-form-with-error-handling.ts`:

```tsx
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface FormFieldError {
  field: string
  message: string
}

interface FormState<T> {
  data: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  submitError: string | null
  isValid: boolean
}

interface FormOptions<T> {
  initialData: T
  validate?: (data: T) => Record<keyof T, string> | Promise<Record<keyof T, string>>
  onSubmit: (data: T) => Promise<void>
  persistKey?: string // Key for sessionStorage persistence
  resetOnSuccess?: boolean
}

export function useFormWithErrorHandling<T extends Record<string, any>>({
  initialData,
  validate,
  onSubmit,
  persistKey,
  resetOnSuccess = true,
}: FormOptions<T>) {
  // Initialize form data with persisted data if available
  const [formState, setFormState] = useState<FormState<T>>(() => {
    let data = initialData

    // Try to restore from sessionStorage
    if (persistKey && typeof window !== 'undefined') {
      try {
        const persisted = sessionStorage.getItem(`form_${persistKey}`)
        if (persisted) {
          const parsedData = JSON.parse(persisted)
          data = { ...initialData, ...parsedData }
        }
      } catch (error) {
        logger.warn('Failed to restore form data from sessionStorage', error)
      }
    }

    return {
      data,
      errors: {} as Record<keyof T, string>,
      touched: {} as Record<keyof T, boolean>,
      isSubmitting: false,
      submitError: null,
      isValid: true,
    }
  })

  // Persist form data to sessionStorage
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`form_${persistKey}`, JSON.stringify(formState.data))
      } catch (error) {
        logger.warn('Failed to persist form data to sessionStorage', error)
      }
    }
  }, [formState.data, persistKey])

  // Validate form data
  const validateForm = useCallback(async (data: T): Promise<Record<keyof T, string>> => {
    if (!validate) return {} as Record<keyof T, string>

    try {
      return await validate(data)
    } catch (error) {
      logger.error('Form validation error', error)
      return {} as Record<keyof T, string>
    }
  }, [validate])

  // Update field value
  const setFieldValue = useCallback(async (field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      touched: { ...prev.touched, [field]: true },
      // Clear field error when user starts typing
      errors: { ...prev.errors, [field]: '' },
      // Clear submit error when user makes changes
      submitError: null,
    }))

    // Real-time validation after a short delay
    if (validate) {
      setTimeout(async () => {
        const newData = { ...formState.data, [field]: value }
        const errors = await validateForm(newData)

        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, ...errors },
          isValid: Object.keys(errors).length === 0,
        }))
      }, 500) // Debounce validation
    }
  }, [formState.data, validate, validateForm])

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }))
  }, [])

  // Clear field error
  const clearFieldError = useCallback((field: keyof T) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors }
      delete newErrors[field]

      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      }
    })
  }, [])

  // Set multiple field errors (useful for server-side validation)
  const setFieldErrors = useCallback((errors: Record<keyof T, string>) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.keys(errors).length === 0,
    }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitError: null
    }))

    try {
      // Validate form
      const errors = await validateForm(formState.data)

      if (Object.keys(errors).length > 0) {
        setFormState(prev => ({
          ...prev,
          errors,
          isSubmitting: false,
          isValid: false,
        }))

        // Focus first error field
        const firstErrorField = Object.keys(errors)[0]
        setTimeout(() => {
          const element = document.getElementById(firstErrorField)
          element?.focus()
        }, 100)

        return
      }

      // Submit form
      await onSubmit(formState.data)

      // Success handling
      if (resetOnSuccess) {
        setFormState(prev => ({
          ...prev,
          data: initialData,
          errors: {} as Record<keyof T, string>,
          touched: {} as Record<keyof T, boolean>,
          isSubmitting: false,
          submitError: null,
          isValid: true,
        }))

        // Clear persisted data on success
        if (persistKey && typeof window !== 'undefined') {
          sessionStorage.removeItem(`form_${persistKey}`)
        }
      } else {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          submitError: null,
        }))
      }

      toast.success('Form submitted successfully!')

    } catch (error) {
      logger.error('Form submission error', error)

      let errorMessage = 'An error occurred. Please try again.'

      if (error instanceof Error) {
        // Handle different types of errors
        if (error.message.includes('validation')) {
          errorMessage = 'Please check your input and try again.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        } else {
          errorMessage = error.message
        }

        // Handle server validation errors
        if ((error as any).status === 400 && (error as any).data?.errors) {
          const serverErrors = (error as any).data.errors
          if (typeof serverErrors === 'object') {
            setFieldErrors(serverErrors)
            return
          }
        }
      }

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: errorMessage,
      }))

      toast.error(errorMessage)
    }
  }, [formState.data, validateForm, onSubmit, resetOnSuccess, initialData, persistKey])

  // Reset form
  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {} as Record<keyof T, string>,
      touched: {} as Record<keyof T, boolean>,
      isSubmitting: false,
      submitError: null,
      isValid: true,
    })

    // Clear persisted data
    if (persistKey && typeof window !== 'undefined') {
      sessionStorage.removeItem(`form_${persistKey}`)
    }
  }, [initialData, persistKey])

  // Get field props for easier integration
  const getFieldProps = useCallback((field: keyof T) => ({
    value: formState.data[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(field, e.target.value)
    },
    onBlur: () => {
      setFormState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: true },
      }))
    },
    'aria-invalid': !!formState.errors[field],
    'aria-describedby': formState.errors[field] ? `${String(field)}-error` : undefined,
  }), [formState.data, formState.errors, setFieldValue])

  return {
    // Form state
    data: formState.data,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    submitError: formState.submitError,
    isValid: formState.isValid,

    // Actions
    setFieldValue,
    setFieldError,
    clearFieldError,
    setFieldErrors,
    handleSubmit,
    reset,
    getFieldProps,

    // Computed values
    hasErrors: Object.keys(formState.errors).length > 0,
    isDirty: Object.keys(formState.touched).length > 0,
  }
}
```

Example usage in a form component:

```tsx
// Example: Enhanced contact form with error handling
import { useFormWithErrorHandling } from '@/hooks/use-form-with-error-handling'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

export function ContactForm() {
  const {
    data,
    errors,
    isSubmitting,
    submitError,
    isValid,
    getFieldProps,
    handleSubmit,
    reset,
  } = useFormWithErrorHandling<ContactFormData>({
    initialData: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
    persistKey: 'contact_form',
    validate: async (data) => {
      const errors: Partial<Record<keyof ContactFormData, string>> = {}

      if (!data.name.trim()) {
        errors.name = 'Name is required'
      } else if (data.name.length < 2) {
        errors.name = 'Name must be at least 2 characters'
      }

      if (!data.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address'
      }

      if (!data.message.trim()) {
        errors.message = 'Message is required'
      } else if (data.message.length < 10) {
        errors.message = 'Message must be at least 10 characters'
      }

      return errors as Record<keyof ContactFormData, string>
    },
    onSubmit: async (data) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Submission failed')
      }
    },
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit Error Display */}
      {submitError && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center justify-between">
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-400 hover:text-red-600"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...getFieldProps('name')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...getFieldProps('email')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          {...getFieldProps('phone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          {...getFieldProps('message')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.message
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300'
          }`}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isSubmitting || !isValid
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>

        <button
          type="button"
          onClick={reset}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
```

---

## Implementation Timeline

### Phase 1: Critical Fixes (Week 1)
- [ ] Implement React Error Boundaries
- [ ] Create custom error pages
- [ ] Set up basic monitoring infrastructure

### Phase 2: Enhanced Error Handling (Week 2)
- [ ] Implement client-side error handling hooks
- [ ] Enhance form error handling
- [ ] Add timeout and retry logic

### Phase 3: Monitoring & Analytics (Week 3)
- [ ] Complete monitoring service integration
- [ ] Add performance tracking
- [ ] Set up error alerting

### Phase 4: Testing & Optimization (Week 4)
- [ ] Write comprehensive error handling tests
- [ ] Performance optimization
- [ ] Documentation and team training

---

## Testing Checklist

- [ ] Error boundaries catch and display errors properly
- [ ] Custom error pages render correctly
- [ ] Form data persists on submission errors
- [ ] Network errors show appropriate messages
- [ ] Loading states are consistent
- [ ] Monitoring captures and reports errors
- [ ] API timeouts are handled gracefully
- [ ] Retry logic works for transient failures

---

## Monitoring & Alerting Setup

1. **Set up external monitoring service** (Sentry, LogRocket, etc.)
2. **Configure alert rules** for critical errors
3. **Set up dashboard** for error tracking and performance
4. **Create escalation procedures** for critical issues
5. **Regular error review process** with development team

---

This documentation provides a complete roadmap for implementing robust error handling across the PowerCA website. Each section includes practical, production-ready code that can be implemented incrementally.

The priority should be on implementing the critical fixes first (Error Boundaries, Custom Error Pages, Basic Monitoring) to prevent user experience degradation, then progressively enhancing the error handling system with the advanced features.