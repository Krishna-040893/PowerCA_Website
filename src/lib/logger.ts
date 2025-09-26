/* eslint-disable no-console */
/**
 * Secure logging utility that prevents sensitive data exposure
 * Use this instead of console.log/error in production code
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Sanitizes sensitive data from objects before logging
   */
  private sanitize(data: unknown): unknown {
    if (!data) return data

    // List of sensitive keys to redact
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'api_key', 'apiKey',
      'authorization', 'cookie', 'session', 'jwt', 'bearer',
      'credit_card', 'card_number', 'cvv', 'ssn', 'tax_id',
      'email', 'phone', 'address', 'ip', 'user_id', 'userId',
      'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'SUPABASE_SERVICE_ROLE_KEY',
      'NEXTAUTH_SECRET', 'RESEND_API_KEY', 'password_hash', 'passwordHash'
    ]

    // Handle different data types
    if (typeof data === 'string') {
      // Check if string contains sensitive patterns
      if (data && typeof data === 'string' && (data.includes('Bearer ') || data.includes('Basic '))) {
        return '[REDACTED_AUTH_TOKEN]'
      }
      return data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase()

        // Check if key contains sensitive data
        const isSensitive = sensitiveKeys.some(sensitive =>
          lowerKey.includes(sensitive.toLowerCase())
        )

        if (isSensitive) {
          sanitized[key] = '[REDACTED]'
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitize(value as Record<string, unknown>)
        } else {
          sanitized[key] = value
        }
      }
      return sanitized
    }

    return data
  }

  /**
   * Formats the log message with timestamp and level
   */
  private format(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const sanitizedData = data ? this.sanitize(data) : undefined

    if (this.isDevelopment) {
      // More verbose in development
      return sanitizedData
        ? `[${timestamp}] [${level.toUpperCase()}] ${message}`
        : `[${timestamp}] [${level.toUpperCase()}] ${message}`
    } else {
      // Minimal in production
      return `[${level}] ${message}`
    }
  }

  debug(message: string, data?: unknown) {
    // Only log debug in development
    if (this.isDevelopment) {
      const formatted = this.format('debug', message, data)
      const sanitizedData = data ? this.sanitize(data) : undefined
      console.log(formatted, sanitizedData || '')
    }
  }

  info(message: string, data?: unknown) {
    const formatted = this.format('info', message, data)
    const sanitizedData = data ? this.sanitize(data) : undefined

    if (this.isDevelopment || !this.isProduction) {
      console.log(formatted, sanitizedData || '')
    }
    // In production, you might want to send to a logging service
  }

  warn(message: string, data?: unknown) {
    const formatted = this.format('warn', message, data)
    const sanitizedData = data ? this.sanitize(data) : undefined
    console.warn(formatted, sanitizedData || '')
  }

  error(message: string, error?: unknown, data?: unknown) {
    const formatted = this.format('error', message, data)
    const sanitizedData = data ? this.sanitize(data) : undefined

    // Handle error objects specially
    if (error instanceof Error) {
      console.error(formatted, {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        ...(sanitizedData && typeof sanitizedData === 'object' ? sanitizedData as Record<string, unknown> : {})
      })
    } else {
      console.error(formatted, this.sanitize(error), sanitizedData || '')
    }
  }

  /**
   * Logs admin actions for audit trail
   */
  adminAction(action: string, adminId: string, details?: unknown) {
    this.info(`Admin Action: ${action}`, {
      adminId,
      action,
      timestamp: new Date().toISOString(),
      details: this.sanitize(details)
    })
  }

  /**
   * Logs security events
   */
  security(event: string, details?: unknown) {
    this.warn(`Security Event: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      details: this.sanitize(details)
    })
  }
}

// Export singleton instance
export const logger = new SecureLogger()

// Also export the class for testing
export { SecureLogger }