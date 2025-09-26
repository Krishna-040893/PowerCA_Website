import {NextRequest, NextResponse  } from 'next/server'
import {logger  } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()

    // Log CSP violations for security monitoring
    logger.security('CSP Violation Detected', {
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      report: report['csp-report'] || report,
      timestamp: new Date().toISOString(),
    })

    // In production, you might want to:
    // 1. Store in database for analysis
    // 2. Send alerts for certain violations
    // 3. Track violation trends

    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    logger.error('CSP Report processing failed', error)
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}