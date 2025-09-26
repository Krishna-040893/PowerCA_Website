import {NextResponse  } from 'next/server'
import {logger  } from './logger'

/**
 * Error types for consistent error handling
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION = 'CONFIGURATION_ERROR',
  INTERNAL = 'INTERNAL_ERROR'
}

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  success: false
  error: {
    type: ErrorType
    message: string
    code?: string
    details?: Record<string, unknown>
  }
  timestamp: string
  requestId?: string
}

/**
 * Error messages for production (generic, safe messages)
 */
const PRODUCTION_ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.VALIDATION]: 'Invalid input provided. Please check your request and try again.',
  [ErrorType.AUTHENTICATION]: 'Authentication failed. Please log in and try again.',
  [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please try again later.',
  [ErrorType.DATABASE]: 'A database error occurred. Please try again later.',
  [ErrorType.PAYMENT]: 'Payment processing failed. Please try again or contact support.',
  [ErrorType.EXTERNAL_SERVICE]: 'An external service is temporarily unavailable. Please try again later.',
  [ErrorType.CONFIGURATION]: 'The service is not properly configured. Please contact support.',
  [ErrorType.INTERNAL]: 'An unexpected error occurred. Please try again later.'
}

/**
 * HTTP status codes for error types
 */
const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.VALIDATION]: 400,
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.DATABASE]: 500,
  [ErrorType.PAYMENT]: 402,
  [ErrorType.EXTERNAL_SERVICE]: 503,
  [ErrorType.CONFIGURATION]: 500,
  [ErrorType.INTERNAL]: 500
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a standardized error response
 * @param type The type of error
 * @param error The actual error object or message
 * @param options Additional options
 * @returns NextResponse with appropriate error details
 */
export function createErrorResponse(
  type: ErrorType,
  error: Error | string | unknown,
  options: {
    statusCode?: number
    details?: Record<string, unknown>
    requestId?: string
    logError?: boolean
  } = {}
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const requestId = options.requestId || generateRequestId()

  // Get the appropriate message
  let message: string
  let errorDetails: Record<string, unknown> | undefined = undefined

  if (isDevelopment) {
    // In development, show actual error messages
    if (error instanceof Error) {
      message = error.message
      errorDetails = {
        stack: error.stack,
        name: error.name,
        ...options.details
      }
    } else if (typeof error === 'string') {
      message = error
      errorDetails = options.details
    } else {
      message = 'An error occurred'
      errorDetails = { error, ...options.details }
    }
  } else {
    // In production, use safe generic messages
    message = PRODUCTION_ERROR_MESSAGES[type]
    // Only include safe details in production
    if (options.details && typeof options.details === 'object') {
      // Filter out sensitive information
      const safeDetails = Object.keys(options.details).reduce((acc, key) => {
        const value = options.details ? options.details[key] : undefined
        // Don't include values that might contain sensitive info
        if (
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('key') ||
          key.toLowerCase().includes('auth')
        ) {
          return acc
        }
        acc[key] = value
        return acc
      }, {} as Record<string, unknown>)

      if (Object.keys(safeDetails).length > 0) {
        errorDetails = safeDetails
      }
    }
  }

  // Log the error if requested (default: true for 5xx errors)
  const shouldLog = options.logError !== false || ERROR_STATUS_CODES[type] >= 500

  if (shouldLog) {
    const logData = {
      type,
      requestId,
      statusCode: options.statusCode || ERROR_STATUS_CODES[type],
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      details: options.details
    }

    if (ERROR_STATUS_CODES[type] >= 500) {
      logger.error(`API Error: ${type}`, undefined, logData)
    } else {
      logger.warn(`API Warning: ${type}`, logData)
    }
  }

  // Create the response
  const responseBody: ErrorResponse = {
    success: false,
    error: {
      type,
      message,
      code: type,
      ...(errorDetails && { details: errorDetails })
    },
    timestamp: new Date().toISOString(),
    requestId
  }

  return NextResponse.json(
    responseBody,
    {
      status: options.statusCode || ERROR_STATUS_CODES[type],
      headers: {
        'X-Request-Id': requestId
      }
    }
  )
}

/**
 * Handle configuration errors without revealing sensitive information
 * @param service The service that is not configured
 * @returns A safe error response
 */
export function handleConfigurationError(service: string): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    return createErrorResponse(
      ErrorType.CONFIGURATION,
      `${service} is not properly configured. Please check your environment variables.`,
      { details: { service } }
    )
  }

  // In production, don't reveal which service is misconfigured
  return createErrorResponse(
    ErrorType.CONFIGURATION,
    'Service configuration error'
  )
}

/**
 * Handle database errors without revealing schema information
 * @param error The database error
 * @returns A safe error response
 */
export function handleDatabaseError(error: unknown): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Log the actual error for debugging
  logger.error('Database error occurred', error)

  if (isDevelopment) {
    return createErrorResponse(
      ErrorType.DATABASE,
      error as Error,
      { details: { query: (error as Record<string, unknown>).query, code: (error as Record<string, unknown>).code } }
    )
  }

  // Generic message for production
  return createErrorResponse(
    ErrorType.DATABASE,
    'Database operation failed'
  )
}

/**
 * Handle validation errors
 * @param errors Validation errors
 * @returns A safe error response
 */
export function handleValidationError(errors: string[] | Record<string, string>): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment || Array.isArray(errors)) {
    // Show specific validation errors even in production (they're usually safe)
    return createErrorResponse(
      ErrorType.VALIDATION,
      'Validation failed',
      {
        details: {
          errors: Array.isArray(errors) ? errors : Object.values(errors)
        }
      }
    )
  }

  return createErrorResponse(
    ErrorType.VALIDATION,
    'Invalid input provided'
  )
}

/**
 * Safely check if an environment variable exists without revealing its name
 * @param varName The environment variable name
 * @param serviceName The service name for error messages
 * @returns The environment variable value or throws a safe error
 */
export function requireEnvVar(varName: string, serviceName: string): string {
  const value = process.env[varName]

  if (!value || value.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing environment variable: ${varName} (required for ${serviceName})`)
    } else {
      throw new Error(`${serviceName} is not configured properly`)
    }
  }

  return value
}

/**
 * Check if a service is configured without revealing details
 * @param envVars Array of environment variable names to check
 * @returns Boolean indicating if all variables are set
 */
export function isServiceConfigured(...envVars: string[]): boolean {
  return envVars.every(varName => {
    const value = process.env[varName]
    return value && value.trim() !== ''
  })
}