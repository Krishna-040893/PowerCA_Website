import {NextRequest  } from 'next/server'
import {logger  } from './logger'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean     // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    requests: number
    resetTime: number
  }
}

// In-memory store for rate limiting (consider Redis for production)
const store: RateLimitStore = {}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 60000) // Clean up every minute

/**
 * Rate limiter for API routes
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(config: RateLimitConfig) {
  return async function checkRateLimit(request: NextRequest, identifier?: string) {
    // Get client identifier (IP address or custom identifier)
    const clientId = identifier ||
                    request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    const now = Date.now()
    const _windowStart = now - config.windowMs

    // Initialize or get client data
    if (!store[clientId] || store[clientId].resetTime < now) {
      store[clientId] = {
        requests: 0,
        resetTime: now + config.windowMs
      }
    }

    const clientData = store[clientId]

    // Check if limit exceeded
    if (clientData.requests >= config.maxRequests) {
      const retryAfter = Math.ceil((clientData.resetTime - now) / 1000)

      logger.security('Rate limit exceeded', {
        clientId,
        requests: clientData.requests,
        limit: config.maxRequests,
        retryAfter
      })

      return {
        allowed: false,
        remaining: 0,
        reset: clientData.resetTime,
        retryAfter
      }
    }

    // Increment request count
    clientData.requests++

    return {
      allowed: true,
      remaining: config.maxRequests - clientData.requests,
      reset: clientData.resetTime,
      retryAfter: 0
    }
  }
}

// Preset configurations for different endpoints
export const rateLimitPresets = {
  // Strict limit for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5            // 5 requests per 15 minutes
  },

  // Moderate limit for admin endpoints
  admin: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30           // 30 requests per minute
  },

  // Standard API limit
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60           // 60 requests per minute
  },

  // Relaxed limit for public endpoints
  public: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100          // 100 requests per minute
  },

  // Very strict for payment endpoints
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10           // 10 requests per hour
  }
}

/**
 * Helper to create rate limit response
 */
export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Please wait ${retryAfter} seconds before making another request`,
      retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString()
      }
    }
  )
}