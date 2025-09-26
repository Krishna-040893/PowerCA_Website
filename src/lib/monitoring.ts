import { logger } from './logger'
import { toISOStringSafely } from './browser-compat'

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
        timestamp: toISOStringSafely(new Date()),
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
              metric: 'LCP',
              value: entry.startTime,
              timestamp: toISOStringSafely(new Date()),
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
              metric: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: toISOStringSafely(new Date()),
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
                metric: 'LongTask',
                value: entry.duration,
                context: {
                  name: entry.name,
                  startTime: entry.startTime,
                },
                timestamp: toISOStringSafely(new Date()),
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
            metric: 'PageLoad',
            value: navigation.loadEventEnd - navigation.fetchStart,
            context: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstPaint: this.getFirstPaint(),
            },
            timestamp: toISOStringSafely(new Date()),
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
}

// Helper functions for common use cases
export function trackError(error: Error | string, context?: Record<string, any>) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  const errorObj = error instanceof Error ? error : new Error(error)

  monitoring.captureError({
    message: errorObj.message,
    stack: errorObj.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: monitoring['sessionId'],
    userId: monitoring['userId'],
    ...context,
  })
}

export function trackPerformance(metric: string, value: number, context?: Record<string, any>) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  monitoring.capturePerformance({
    metric,
    value,
    context,
    timestamp: new Date().toISOString(),
  })
}

export function trackUserAction(action: string, context?: Record<string, any>) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  monitoring.captureUserAction(action, context)
}

export function setMonitoringUserId(userId: string) {
  if (typeof window === 'undefined') return

  const monitoring = getMonitoring()
  monitoring.setUserId(userId)
}