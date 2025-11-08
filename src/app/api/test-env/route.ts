import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID

    return NextResponse.json({
      keyIdPrefix: keyId?.substring(0, 15),
      isLiveMode: keyId?.startsWith('rzp_live'),
      hasKey: !!keyId
    })
  } catch (error) {
    logger.error('Test environment endpoint error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error instanceof Error ? error : 'Failed to check test environment'
    )
  }
}
