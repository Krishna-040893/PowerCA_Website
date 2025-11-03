/**
 * @fileoverview Sentry configuration for server-side error tracking
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// Only initialize Sentry in production or when DSN is explicitly provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set environment
    environment: process.env.NODE_ENV || 'development',

    // Adjust sample rate for performance monitoring
    // 0.1 = 10% of transactions are sent to Sentry
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter out sensitive data before sending to Sentry
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.SENTRY_DEBUG !== 'true'
      ) {
        return null
      }

      // Filter out sensitive headers
      if (event.request?.headers) {
        const headers = event.request.headers
        delete headers['authorization']
        delete headers['cookie']
        delete headers['x-api-key']
      }

      // Filter out sensitive environment variables
      if (event.contexts?.runtime?.env) {
        const env = event.contexts.runtime.env
        Object.keys(env).forEach(key => {
          const lowerKey = key.toLowerCase()
          if (
            lowerKey.includes('secret') ||
            lowerKey.includes('key') ||
            lowerKey.includes('password') ||
            lowerKey.includes('token')
          ) {
            env[key] = '***'
          }
        })
      }

      return event
    },

    // Ignore common errors that don't need tracking
    ignoreErrors: [
      // Expected validation errors
      'ValidationError',
      'Invalid input',
      // Rate limiting (not really an error)
      'Too many requests',
      // Configuration errors (should be caught during deployment)
      'ENOENT',
      'ECONNREFUSED',
    ],
  })
}
