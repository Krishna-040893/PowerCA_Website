import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Maximum number of unique tokens to track
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: async (limit: number, token: string): Promise<RateLimitResult> => {
      const tokenCount = tokenCache.get(token) || [0, Date.now()]

      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount)
      }

      tokenCount[0] += 1

      const currentUsage = tokenCount[0]
      const resetTime = tokenCount[1] + options.interval
      const isRateLimited = currentUsage > limit

      return {
        success: !isRateLimited,
        limit,
        remaining: Math.max(0, limit - currentUsage),
        reset: resetTime,
      }
    },
  }
}

// Pre-configured rate limiters for different use cases
export const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
})

export const strictLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
})

/**
 * Get client IP address from request headers
 * Handles proxied requests (Vercel, CloudFlare, etc.)
 */
export function getClientIp(request: Request): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  return 'unknown'
}

/**
 * Create a rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  )
}
