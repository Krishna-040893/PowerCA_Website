import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'
import { logger } from '@/lib/logger'

/**
 * Error handling middleware wrapper for API routes
 *
 * Automatically catches and handles errors in API routes, ensuring
 * consistent error responses and proper logging.
 *
 * Usage:
 * ```typescript
 * import { withErrorHandling } from '@/lib/middleware/with-error-handling'
 *
 * export const POST = withErrorHandling(async (req: NextRequest) => {
 *   // Your handler code
 *   // Errors are automatically caught and handled
 *   const data = await someOperation()
 *   return NextResponse.json({ success: true, data })
 * })
 * ```
 *
 * @param handler The route handler function
 * @param options Configuration options
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  options: {
    /** Custom error type for this route (default: INTERNAL) */
    errorType?: ErrorType
    /** Whether to log errors (default: true) */
    logErrors?: boolean
    /** Route name for logging context */
    routeName?: string
  } = {}
) {
  const {
    errorType = ErrorType.INTERNAL,
    logErrors = true,
    routeName = 'API Route',
  } = options

  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      // Call the actual handler
      return await handler(req, ...args)
    } catch (error) {
      // Log the error with context
      if (logErrors) {
        logger.error(`${routeName} error`, error, {
          method: req.method,
          url: req.url,
          userAgent: req.headers.get('user-agent'),
        })
      }

      // Return standardized error response
      return createErrorResponse(errorType, error as Error, {
        logError: false, // Already logged above
      })
    }
  }
}

/**
 * Combine multiple middleware functions
 *
 * Usage:
 * ```typescript
 * import { withMiddleware } from '@/lib/middleware/with-error-handling'
 * import { withRateLimit, RateLimits } from '@/lib/middleware/with-rate-limit'
 *
 * export const POST = withMiddleware(
 *   async (req) => {
 *     // Your handler code
 *     return NextResponse.json({ success: true })
 *   },
 *   withRateLimit({ limit: RateLimits.AUTH }),
 *   withErrorHandling({ routeName: 'Auth Login' })
 * )
 * ```
 */
export function withMiddleware(
  handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  ...middlewares: Array<
    (
      handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
    ) => (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  >
) {
  // Apply middlewares in reverse order (right to left)
  return middlewares.reduceRight((wrappedHandler, middleware) => {
    return middleware(wrappedHandler)
  }, handler)
}

/**
 * Validation middleware wrapper
 *
 * Validates request body before processing
 *
 * Usage:
 * ```typescript
 * import { withValidation } from '@/lib/middleware/with-error-handling'
 *
 * export const POST = withValidation(
 *   async (req, validatedBody) => {
 *     // validatedBody is type-safe
 *     return NextResponse.json({ success: true })
 *   },
 *   (body) => {
 *     // Validation logic
 *     if (!body.email) {
 *       throw new Error('Email is required')
 *     }
 *     return body
 *   }
 * )
 * ```
 */
export function withValidation<T = unknown>(
  handler: (req: NextRequest, validatedBody: T, ...args: unknown[]) => Promise<NextResponse>,
  validator: (body: unknown) => T
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      // Parse request body
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return createErrorResponse(
          ErrorType.VALIDATION,
          'Invalid JSON body',
          { statusCode: 400 }
        )
      }

      // Validate body
      const validatedBody = validator(body)

      // Call handler with validated body
      return await handler(req, validatedBody, ...args)
    } catch (error) {
      if (error instanceof Error && error.message.includes('required')) {
        return createErrorResponse(ErrorType.VALIDATION, error.message, {
          statusCode: 400,
        })
      }

      logger.error('Validation error', error)
      return createErrorResponse(ErrorType.VALIDATION, error as Error, {
        statusCode: 400,
      })
    }
  }
}
