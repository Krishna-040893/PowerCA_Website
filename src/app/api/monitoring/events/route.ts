import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { rateLimit, rateLimitPresets } from '@/lib/rate-limit'

const checkRateLimit = rateLimit(rateLimitPresets.api)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many monitoring requests' },
        { status: 429 }
      )
    }

    const { events, metadata } = await request.json()

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events must be an array' },
        { status: 400 }
      )
    }

    // Process each event
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
          })
          break

        case 'performance':
          logger.info('Performance metric', {
            metric: event.metric,
            value: event.value,
            context: event.context,
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

    return NextResponse.json({ success: true, processed: events.length })

  } catch (error) {
    logger.error('Monitoring endpoint error', error)
    return NextResponse.json(
      { error: 'Failed to process monitoring events' },
      { status: 500 }
    )
  }
}