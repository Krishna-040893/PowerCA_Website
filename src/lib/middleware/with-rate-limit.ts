import { NextRequest, NextResponse } from 'next/server'
import { apiLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

/**
 * Rate limiting middleware wrapper for API routes
 *
 * Usage:
 * ```typescript
 * import { withRateLimit } from '@/lib/middleware/with-rate-limit'
 *
 * // Apply default rate limit (10 requests/minute)
 * export const POST = withRateLimit(async (req: NextRequest) => {
 *   // Your handler code
 *   return NextResponse.json({ success: true })
 * })
 *
 * // Custom rate limit (5 requests/minute)
 * export const POST = withRateLimit(async (req: NextRequest) => {
 *   // Your handler code
 *   return NextResponse.json({ success: true })
 * }, 5)
 * ```
 *
 * @param handler The route handler function
 * @param limit Maximum requests per minute (default: 10)
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  limit: number = 10
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      // Get client IP for rate limiting
      const identifier = getClientIp(req)

      // Check rate limit
      const rateLimitResult = await apiLimiter.check(limit, identifier)

      if (!rateLimitResult.success) {
        return createRateLimitResponse(rateLimitResult)
      }

      // Call the actual handler
      return await handler(req, ...args)
    } catch (error) {
      // If rate limiting fails, allow the request to proceed
      // This ensures rate limiting issues don't break the API
      console.error('Rate limiting error:', error)
      return await handler(req, ...args)
    }
  }
}

/**
 * Predefined rate limit configurations for common use cases
 */
export const RateLimits = {
  /** Very strict rate limit for sensitive operations (3 req/min) */
  STRICT: 3,

  /** Strict rate limit for auth and contact forms (5 req/min) */
  AUTH: 5,

  /** Standard rate limit for most API endpoints (10 req/min) */
  STANDARD: 10,

  /** Relaxed rate limit for read operations (30 req/min) */
  RELAXED: 30,

  /** Lenient rate limit for admin operations (100 req/min) */
  ADMIN: 100,

  /** Very lenient rate limit for monitoring (200 req/min) */
  MONITORING: 200,
} as const

/**
 * Example usage with predefined limits:
 *
 * ```typescript
 * import { withRateLimit, RateLimits } from '@/lib/middleware/with-rate-limit'
 *
 * // Strict rate limit for auth endpoints
 * export const POST = withRateLimit(authHandler, RateLimits.AUTH)
 *
 * // Standard rate limit
 * export const GET = withRateLimit(getHandler, RateLimits.STANDARD)
 *
 * // Admin rate limit
 * export const PUT = withRateLimit(adminHandler, RateLimits.ADMIN)
 * ```
 */
