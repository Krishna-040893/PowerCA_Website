import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'
import { handleValidationError } from '@/lib/error-handler'
import { logger } from '@/lib/logger'

/**
 * Zod validation middleware wrapper for API routes
 *
 * Provides type-safe validation using Zod schemas
 *
 * Usage:
 * ```typescript
 * import { withZodValidation } from '@/lib/middleware/with-zod-validation'
 * import { z } from 'zod'
 *
 * const ContactSchema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email(),
 *   message: z.string().min(10).max(1000)
 * })
 *
 * export const POST = withZodValidation(
 *   ContactSchema,
 *   async (req, validatedData) => {
 *     // validatedData is fully typed!
 *     const { name, email, message } = validatedData
 *     return NextResponse.json({ success: true })
 *   }
 * )
 * ```
 */
export function withZodValidation<T extends ZodSchema>(
  schema: T,
  handler: (
    req: NextRequest,
    validatedData: z.infer<T>,
    ...args: unknown[]
  ) => Promise<NextResponse>,
  options: {
    /** Whether to log validation errors (default: true) */
    logErrors?: boolean
    /** Route name for logging context */
    routeName?: string
  } = {}
) {
  const { logErrors = true, routeName = 'API Route' } = options

  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      // Parse request body
      let body: unknown
      try {
        body = await req.json()
      } catch {
        if (logErrors) {
          logger.warn(`${routeName} - Invalid JSON body`)
        }
        return handleValidationError(['Invalid JSON body'])
      }

      // Validate with Zod
      const result = schema.safeParse(body)

      if (!result.success) {
        // Extract error messages
        const errors = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        )

        if (logErrors) {
          logger.warn(`${routeName} - Validation failed`, {
            errors,
            body: typeof body === 'object' ? Object.keys(body as object) : typeof body,
          })
        }

        return handleValidationError(errors)
      }

      // Call handler with validated data
      return await handler(req, result.data, ...args)
    } catch (error) {
      logger.error(`${routeName} - Unexpected error in validation`, error)
      return handleValidationError(['An unexpected error occurred during validation'])
    }
  }
}

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  /** Email validation */
  email: z.string().email('Invalid email address'),

  /** Phone number validation (Indian format) */
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .length(10, 'Phone number must be 10 digits'),

  /** PAN number validation */
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number')
    .length(10, 'PAN must be 10 characters'),

  /** GST number validation */
  gst: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GST number'
    )
    .length(15, 'GST must be 15 characters'),

  /** IFSC code validation */
  ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
    .length(11, 'IFSC must be 11 characters'),

  /** URL validation */
  url: z.string().url('Invalid URL'),

  /** Required string with min/max length */
  requiredString: (min: number = 1, max: number = 255) =>
    z.string().min(min).max(max),

  /** Optional string with max length */
  optionalString: (max: number = 255) => z.string().max(max).optional(),

  /** Positive integer */
  positiveInt: z.number().int().positive(),

  /** Positive number (decimal allowed) */
  positiveNumber: z.number().positive(),

  /** Amount in rupees (2 decimal places) */
  amount: z.number().positive().multipleOf(0.01),
}

/**
 * Example schemas for common API endpoints
 */
export const ExampleSchemas = {
  /** Contact form schema */
  contact: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: CommonSchemas.email,
    phone: CommonSchemas.phone.optional(),
    message: z.string().min(10).max(1000),
  }),

  /** Affiliate registration schema */
  affiliateRegistration: z.object({
    fullName: z.string().min(2),
    email: CommonSchemas.email,
    phone: CommonSchemas.phone,
    password: z.string().min(8),
    city: z.string().min(2),
    state: z.string().min(2),
    businessType: z.enum(['individual', 'company']).optional(),
    companyName: z.string().optional(),
    promotionMethod: z.string().min(10),
    targetAudience: z.string().min(10),
    accountNumber: z.string().optional(),
    ifscCode: CommonSchemas.ifsc.optional(),
    panNumber: CommonSchemas.pan.optional(),
    gstNumber: CommonSchemas.gst.optional(),
  }),

  /** Payment order creation schema */
  paymentOrder: z.object({
    amount: CommonSchemas.amount,
    customerName: z.string().min(2),
    customerEmail: CommonSchemas.email,
    customerPhone: CommonSchemas.phone,
    firmName: z.string().optional(),
    gstNumber: CommonSchemas.gst.optional(),
    address: z.string().optional(),
  }),

  /** Booking schema */
  booking: z.object({
    name: z.string().min(2),
    email: CommonSchemas.email,
    phone: CommonSchemas.phone,
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    message: z.string().max(500).optional(),
  }),
}

/**
 * Example usage with common schemas:
 *
 * ```typescript
 * import { withZodValidation, ExampleSchemas } from '@/lib/middleware/with-zod-validation'
 *
 * export const POST = withZodValidation(
 *   ExampleSchemas.contact,
 *   async (req, data) => {
 *     // data is typed as { name: string, email: string, ... }
 *     await sendContactEmail(data)
 *     return NextResponse.json({ success: true })
 *   },
 *   { routeName: 'Contact Form' }
 * )
 * ```
 */
