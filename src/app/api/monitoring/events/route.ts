import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { apiLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute
    const ip = getClientIp(request)
    const rateLimitResult = await apiLimiter.check(100, ip)

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Parse request body with validation
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Invalid JSON body',
        { statusCode: 400 }
      )
    }

    if (!body || typeof body !== 'object') {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Invalid request body',
        { statusCode: 400 }
      )
    }

    const { events, metadata } = body as {
      events: Array<Record<string, unknown>>
      metadata?: Record<string, unknown>
    }

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events must be an array' },
        { status: 400 }
      )
    }

    if (events.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No events to process' },
        { status: 200 }
      )
    }

    // Validate events array size to prevent abuse
    if (events.length > 100) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Too many events in a single request (max: 100)',
        { statusCode: 400 }
      )
    }

    // Process each event - log to console/monitoring service
    for (const event of events) {
      switch (event.type) {
        case 'error':
          logger.error('Client error reported', {
            message: event.message,
            stack: event.stack,
            url: event.url,
            userAgent: event.userAgent,
            sessionId: event.sessionId,
            userId: event.userId,
            context: event.context,
          })
          break

        case 'performance':
          logger.info('Performance metric', {
            metric: event.metric,
            value: event.value,
            context: event.context,
            sessionId: event.sessionId,
          })
          break

        case 'user_action':
          logger.info('User action', {
            action: event.action,
            context: event.context,
            sessionId: event.sessionId,
            userId: event.userId,
          })
          break

        default:
          logger.warn('Unknown monitoring event type', { event })
      }
    }

    // Store events in database for analysis
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Prepare events for insertion
        const eventsToInsert = events.map(event => ({
          type: String(event.type || 'unknown'),
          event_data: {
            ...event,
            metadata,
          },
          session_id: event.sessionId ? String(event.sessionId) : null,
          user_id: event.userId ? String(event.userId) : null,
          created_at: event.timestamp ? new Date(String(event.timestamp)) : new Date(),
        }))

        // Insert events into database
        const { error: dbError } = await supabase
          .from('monitoring_events')
          .insert(eventsToInsert)

        if (dbError) {
          // If table doesn't exist, log warning but don't fail the request
          if (dbError.code === '42P01') {
            logger.warn('monitoring_events table does not exist', {
              hint: 'Run migration to create the table',
            })
          } else {
            logger.error('Failed to store monitoring events', dbError)
          }
        } else {
          logger.debug('Monitoring events stored in database', {
            count: events.length,
          })
        }
      }
    } catch (dbError) {
      // Don't fail the request if database storage fails
      // This ensures monitoring doesn't break the app
      logger.warn('Database storage failed for monitoring events', dbError)
    }

    return NextResponse.json({ success: true, processed: events.length })

  } catch (error) {
    logger.error('Monitoring endpoint error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error instanceof Error ? error : 'Failed to process monitoring events',
      { statusCode: 500 }
    )
  }
}