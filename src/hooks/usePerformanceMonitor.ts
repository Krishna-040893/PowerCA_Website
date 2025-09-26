import { useEffect, useRef, useCallback } from 'react'
import { logger } from '@/lib/logger'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  renderCount: number
}

interface PerformanceOptions {
  trackRenders?: boolean
  logThreshold?: number // Log if render takes longer than this (ms)
  reportToAnalytics?: boolean
}

/**
 * Hook to monitor component performance
 * Tracks render times and counts
 */
export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceOptions = {}
) => {
  const {
    trackRenders = true,
    logThreshold = 16, // 16ms = 60fps
    reportToAnalytics = false
  } = options

  const renderCount = useRef(0)
  const renderStartTime = useRef<number>(0)
  const lastRenderTime = useRef<number>(0)

  // Track render start
  if (trackRenders && typeof window !== 'undefined' && window.performance) {
    renderStartTime.current = performance.now()
  }

  useEffect(() => {
    if (!trackRenders || typeof window === 'undefined' || !window.performance) {
      return
    }

    // Calculate render time
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current
    renderCount.current += 1

    // Store metrics
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      renderCount: renderCount.current
    }

    // Log slow renders
    if (renderTime > logThreshold) {
      logger.warn(`Slow render detected: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current,
        threshold: `${logThreshold}ms`
      })
    }

    // Report to analytics if enabled
    if (reportToAnalytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'Component Performance',
        event_label: componentName,
        value: Math.round(renderTime),
        custom_parameters: {
          render_count: renderCount.current
        }
      })
    }

    lastRenderTime.current = renderTime
  })

  // Return performance data and utilities
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
    reset: useCallback(() => {
      renderCount.current = 0
      lastRenderTime.current = 0
    }, [])
  }
}

/**
 * Hook to debounce expensive operations
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook to throttle expensive operations
 */
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRun = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value)
        lastRun.current = Date.now()
      }
    }, limit - (Date.now() - lastRun.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Hook to detect and prevent memory leaks
 */
export const useMemoryLeakDetector = (componentName: string) => {
  const mountedRef = useRef(true)
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        callback()
      }
      timeoutsRef.current.delete(timeout)
    }, delay)

    timeoutsRef.current.add(timeout)
    return timeout
  }, [])

  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(() => {
      if (mountedRef.current) {
        callback()
      }
    }, delay)

    intervalsRef.current.add(interval)
    return interval
  }, [])

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    intervalsRef.current.forEach(interval => clearInterval(interval))
    timeoutsRef.current.clear()
    intervalsRef.current.clear()
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearAllTimers()

      // Log if there were active timers on unmount
      if (timeoutsRef.current.size > 0 || intervalsRef.current.size > 0) {
        logger.warn(`Memory leak detected in ${componentName}`, {
          activeTimeouts: timeoutsRef.current.size,
          activeIntervals: intervalsRef.current.size
        })
      }
    }
  }, [componentName, clearAllTimers])

  return {
    isMounted: () => mountedRef.current,
    safeSetTimeout,
    safeSetInterval,
    clearAllTimers
  }
}

// Add missing import
import { useState } from 'react'