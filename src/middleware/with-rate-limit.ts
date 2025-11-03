/**
 * @fileoverview Rate limiting middleware wrapper for API routes
 * @module middleware/with-rate-limit
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiLimiter, authLimiter, strictLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * Rate limit presets for common use cases
 */
export type RateLimitPreset = 'api' | 'auth' | 'strict' | 'custom'

/**
 * Rate limit configuration options
 */
interface RateLimitOptions {
  /**
   * Preset rate limiter to use
   * - 'api': 60 requests per minute (default)
   * - 'auth': 5 requests per minute (for login/signup)
   * - 'strict': 10 requests per minute (for sensitive operations)
   * - 'custom': Use custom limit value
   */
  preset?: RateLimitPreset

  /**
   * Custom limit value (only used when preset is 'custom')
   * Default: 60 requests per minute
   */
  limit?: number

  /**
   * Custom identifier function to use instead of IP address
   * Useful for rate limiting by user ID, API key, etc.
   */
  identifier?: (req: NextRequest) => string | Promise<string>

  /**
   * Skip rate limiting based on a condition
   * Useful for allowing unlimited access for admin users, etc.
   */
  skip?: (req: NextRequest) => boolean | Promise<boolean>

  /**
   * Custom error message when rate limit is exceeded
   */
  errorMessage?: string
}

/**
 * API route handler type
 */
type RouteHandler = (req: NextRequest, context?: unknown) => Promise<NextResponse> | NextResponse

/**
 * Higher-order function that wraps an API route handler with rate limiting
 *
 * @param handler - The API route handler function to wrap
 * @param options - Rate limiting options
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * // Basic usage with default API rate limit (60 req/min)
 * export const POST = withRateLimit(async (req: NextRequest) => {
 *   // Your handler code
 *   return NextResponse.json({ success: true })
 * })
 *
 * // Using auth preset (5 req/min)
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Login handler
 *   },
 *   { preset: 'auth' }
 * )
 *
 * // Custom limit
 * export const POST = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Handler code
 *   },
 *   { preset: 'custom', limit: 3 }
 * )
 *
 * // Skip rate limiting for authenticated users
 * export const GET = withRateLimit(
 *   async (req: NextRequest) => {
 *     // Handler code
 *   },
 *   {
 *     skip: async (req) => {
 *       const token = req.headers.get('authorization')
 *       return !!token // Skip if user is authenticated
 *     }
 *   }
 * )
 * ```
 */
export function withRateLimit(
  handler: RouteHandler,
  options: RateLimitOptions = {}
): RouteHandler {
  return async (req: NextRequest, context?: unknown) => {
    const {
      preset = 'api',
      limit,
      identifier,
      skip,
      errorMessage,
    } = options

    try {
      // Check if rate limiting should be skipped
      if (skip && await skip(req)) {
        return handler(req, context)
      }

      // Get identifier (IP address by default)
      const id = identifier ? await identifier(req) : getClientIp(req)

      // Select rate limiter based on preset
      let limiter
      let requestLimit: number

      switch (preset) {
        case 'auth':
          limiter = authLimiter
          requestLimit = 5 // 5 requests per minute
          break
        case 'strict':
          limiter = strictLimiter
          requestLimit = 10 // 10 requests per minute
          break
        case 'custom':
          limiter = apiLimiter
          requestLimit = limit || 60
          break
        case 'api':
        default:
          limiter = apiLimiter
          requestLimit = 60 // 60 requests per minute
          break
      }

      // Check rate limit
      const rateLimitResult = await limiter.check(requestLimit, id)

      if (!rateLimitResult.success) {
        logger.warn('Rate limit exceeded', {
          identifier: id,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: new Date(rateLimitResult.reset).toISOString(),
          url: req.url,
          method: req.method,
        })

        // Return rate limit error response
        const response = createRateLimitResponse(rateLimitResult)

        // Add custom error message if provided
        if (errorMessage) {
          const body = await response.json()
          return NextResponse.json(
            { ...body, message: errorMessage },
            {
              status: response.status,
              headers: response.headers,
            }
          )
        }

        return response
      }

      // Add rate limit headers to response
      const response = await handler(req, context)

      // Only add headers if response is a NextResponse
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())
      }

      return response
    } catch (error) {
      // If rate limiting fails, log error but allow request to proceed
      // This ensures rate limiting doesn't break the API if there's an issue
      logger.error('Rate limiting middleware error', error, {
        url: req.url,
        method: req.method,
      })

      return handler(req, context)
    }
  }
}

/**
 * Convenience function for auth routes (5 req/min)
 */
export function withAuthRateLimit(handler: RouteHandler): RouteHandler {
  return withRateLimit(handler, { preset: 'auth' })
}

/**
 * Convenience function for strict rate limiting (10 req/min)
 */
export function withStrictRateLimit(handler: RouteHandler): RouteHandler {
  return withRateLimit(handler, { preset: 'strict' })
}

/**
 * Convenience function for custom rate limit
 */
export function withCustomRateLimit(handler: RouteHandler, limit: number): RouteHandler {
  return withRateLimit(handler, { preset: 'custom', limit })
}
