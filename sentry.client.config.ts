/**
 * @fileoverview Sentry configuration for client-side error tracking
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

    // Session replay sampling
    // 0.1 = 10% of sessions will be recorded
    replaysSessionSampleRate: 0.1,

    // 100% of sessions with errors will be recorded
    replaysOnErrorSampleRate: 1.0,

    // Integrate session replay
    integrations: [
      new Sentry.Replay({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media for privacy
      }),
      new Sentry.BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/[^/]*\.vercel\.app/,
          /^https:\/\/powerca\.in/,
        ],
      }),
    ],

    // Filter out sensitive data before sending to Sentry
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_SENTRY_DEBUG !== 'true'
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

      // Filter out sensitive query params
      if (event.request?.query_string) {
        const queryString = event.request.query_string
        // Remove tokens, keys, secrets from query string
        event.request.query_string = queryString
          .replace(/([?&])(token|key|secret|password)=[^&]*/gi, '$1$2=***')
      }

      // Add user context if available (without PII)
      if (typeof window !== 'undefined') {
        const sessionId = sessionStorage.getItem('monitoring_session_id')
        if (sessionId) {
          event.contexts = event.contexts || {}
          event.contexts.session = { session_id: sessionId }
        }
      }

      return event
    },

    // Ignore common errors that don't need tracking
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      // Abort errors from user cancellation
      'AbortError',
      'Request was cancelled',
      // Razorpay expected errors
      'Payment cancelled by user',
    ],

    // Ignore specific URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  })
}
