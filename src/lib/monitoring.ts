import { logger } from './logger'
import { toISOStringSafely } from './browser-compat'

// Types for monitoring
interface ErrorEvent {
  type: 'error'
  message: string
  stack?: string
  url: string
  line?: number
  column?: number
  userAgent: string
  timestamp: string
  context?: Record<string, unknown>
  userId?: string
  sessionId: string
}

interface PerformanceEvent {
  type: 'performance'
  metric: string
  value: number
  context?: Record<string, unknown>
  timestamp: string
  sessionId: string
  userId?: string
}

interface UserActionEvent {
  type: 'user_action'
  action: string
  context?: Record<string, unknown>
  timestamp: string
  sessionId: string
  userId?: string
}

class MonitoringService {
  private sessionId: string
  private userId?: string
  private queue: Array<ErrorEvent | PerformanceEvent | UserActionEvent> = []
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
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: toISOStringSafely(new Date()),
        sessionId: this.sessionId,
        userId: this.userId,
      })
    })

    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        line: event.lineno,
        column: event.colno,
        userAgent: navigator.userAgent,
        timestamp: toISOStringSafely(new Date()),
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
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.capturePerformance({
              type: 'performance',
              metric: 'LCP',
              value: entry.startTime,
              timestamp: toISOStringSafely(new Date()),
              sessionId: this.sessionId,
              userId: this.userId,
            })
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch {
        logger.debug('LCP observer not supported')
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.capturePerformance({
              type: 'performance',
              metric: 'FID',
              value: ((entry as PerformanceEntry & { processingStart?: number }).processingStart ?? 0) - entry.startTime,
              timestamp: toISOStringSafely(new Date()),
              sessionId: this.sessionId,
              userId: this.userId,
            })
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch {
        logger.debug('FID observer not supported')
      }

      // Long Tasks (performance bottlenecks)
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.capturePerformance({
                type: 'performance',
                metric: 'LongTask',
                value: entry.duration,
                context: {
                  name: entry.name,
                  startTime: entry.startTime,
                },
                timestamp: toISOStringSafely(new Date()),
                sessionId: this.sessionId,
                userId: this.userId,
              })
            }
          }
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch {
        logger.debug('Long task observer not supported')
      }
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        if (navigation) {
          this.capturePerformance({
            type: 'performance',
            metric: 'PageLoad',
            value: navigation.loadEventEnd - navigation.fetchStart,
            context: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstPaint: this.getFirstPaint(),
            },
            timestamp: toISOStringSafely(new Date()),
            sessionId: this.sessionId,
            userId: this.userId,
          })
        }
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

    this.queue.push(error)

    this.checkQueueSize()
  }

  public capturePerformance(event: PerformanceEvent) {
    // Only log in development, skip in production to reduce noise
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Performance metric', { metric: event.metric, value: event.value, context: event.context })
    }

    this.queue.push(event)

    this.checkQueueSize()
  }

  public captureUserAction(action: string, context?: Record<string, unknown>) {
    this.queue.push({
      type: 'user_action',
      action,
      context,
      timestamp: toISOStringSafely(new Date()),
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

    // Skip flushing in development mode to avoid unnecessary errors
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Monitoring: Skipping flush in development mode')
      this.queue = []
      return
    }

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
            timestamp: toISOStringSafely(new Date()),
          }
        }),
      })
    } catch (error) {
      // If sending fails, put events back in queue (but limit queue size)
      if (this.queue.length < this.maxQueueSize) {
        this.queue.unshift(...events.slice(0, this.maxQueueSize - this.queue.length))
      }
      logger.debug('Failed to send monitoring events (non-critical)', error)
    }
  }

  // Method to manually flush (useful for critical errors)
  public async forceFlush() {
    await this.flush()
  }
}

// Singleton instance
let monitoringInstance: MonitoringService | null = null

// Get or create monitoring instance
function getMonitoring(): MonitoringService {
  if (typeof window !== 'undefined' && !monitoringInstance) {
    monitoringInstance = new MonitoringService()
  }
  return monitoringInstance || new MonitoringService()
}

// Initialize monitoring in production
export function initMonitoring() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const monitoring = getMonitoring()
    logger.info('Monitoring service initialized')
    return monitoring
  }
  return undefined
}

// Helper functions for common use cases
export function trackError(error: Error | string, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  const errorObj = error instanceof Error ? error : new Error(error)

  monitoring.captureError({
    type: 'error',
    message: errorObj.message,
    stack: errorObj.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: monitoring['sessionId'],
    userId: monitoring['userId'],
    context,
  })
}

export function trackPerformance(metric: string, value: number, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  monitoring.capturePerformance({
    type: 'performance',
    metric,
    value,
    context,
    timestamp: new Date().toISOString(),
    sessionId: monitoring['sessionId'],
    userId: monitoring['userId'],
  })
}

export function trackUserAction(action: string, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  monitoring.captureUserAction(action, context)
}

export function setMonitoringUserId(userId: string) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  monitoring.setUserId(userId)
}
