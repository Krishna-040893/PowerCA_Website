/**
 * Middleware exports for API routes
 *
 * This module provides reusable middleware functions for API routes
 * to handle common concerns like rate limiting, error handling, and validation.
 */

export {
  withRateLimit,
  RateLimits,
} from './with-rate-limit'

export {
  withErrorHandling,
  withMiddleware,
  withValidation,
} from './with-error-handling'

export {
  withZodValidation,
  CommonSchemas,
  ExampleSchemas,
} from './with-zod-validation'

/**
 * Quick Start Guide
 * =================
 *
 * 1. Simple error handling:
 * ```typescript
 * import { withErrorHandling } from '@/lib/middleware'
 *
 * export const POST = withErrorHandling(async (req) => {
 *   // Your code here
 *   return NextResponse.json({ success: true })
 * })
 * ```
 *
 * 2. Add rate limiting:
 * ```typescript
 * import { withRateLimit, RateLimits } from '@/lib/middleware'
 *
 * export const POST = withRateLimit(async (req) => {
 *   // Your code here
 *   return NextResponse.json({ success: true })
 * }, RateLimits.AUTH) // 5 requests per minute
 * ```
 *
 * 3. Combine multiple middleware:
 * ```typescript
 * import { withMiddleware, withRateLimit, withErrorHandling, RateLimits } from '@/lib/middleware'
 *
 * const handler = async (req: NextRequest) => {
 *   // Your code here
 *   return NextResponse.json({ success: true })
 * }
 *
 * export const POST = withMiddleware(
 *   handler,
 *   (h) => withRateLimit(h, RateLimits.AUTH),
 *   (h) => withErrorHandling(h, { routeName: 'Auth Login' })
 * )
 * ```
 *
 * 4. With validation:
 * ```typescript
 * import { withValidation } from '@/lib/middleware'
 *
 * export const POST = withValidation(
 *   async (req, validatedBody) => {
 *     // validatedBody is type-safe
 *     return NextResponse.json({ success: true })
 *   },
 *   (body) => {
 *     if (!body.email || !body.password) {
 *       throw new Error('Email and password are required')
 *     }
 *     return body as { email: string; password: string }
 *   }
 * )
 * ```
 */
