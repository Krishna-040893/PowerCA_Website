/**
 * @fileoverview Sentry configuration for Edge Runtime error tracking
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
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter out sensitive data before sending to Sentry
    beforeSend(event) {
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

      return event
    },
  })
}
