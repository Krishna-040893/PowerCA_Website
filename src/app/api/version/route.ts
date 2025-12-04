import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { logger } from '@/lib/logger'

/**
 * Version API Endpoint
 *
 * Returns deployment information to verify which version is deployed
 * Useful for debugging deployment issues
 */
export async function GET() {
  try {
    // Get git commit information
    let commitHash = 'unknown'
    let commitDate = 'unknown'
    let branch = 'unknown'
    let commitMessage = 'unknown'

    try {
      // Get current commit hash
      commitHash = execSync('git rev-parse HEAD', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim()

      // Get short commit hash
      const shortHash = execSync('git rev-parse --short HEAD', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim()

      // Get commit date
      commitDate = execSync('git log -1 --format=%cd', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim()

      // Get branch name
      branch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim()

      // Get commit message
      commitMessage = execSync('git log -1 --pretty=%B', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim()

      commitHash = shortHash // Use short hash for display
    } catch (error) {
      // Git commands might fail in production environment
      logger.info('Could not retrieve git information', error)
    }

    const versionInfo = {
      version: '1.0.0',
      commit: commitHash,
      commitDate: commitDate,
      branch: branch,
      commitMessage: commitMessage,
      deploymentDate: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      apiStatus: {
        contact: 'available',
        bookings: 'available',
        registrations: 'available'
      },
      corsEnabled: true,
      features: {
        emailService: !!process.env.RESEND_API_KEY,
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        razorpay: !!process.env.RAZORPAY_KEY_ID,
        auth: !!process.env.NEXTAUTH_SECRET
      }
    }

    return NextResponse.json(versionInfo, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    logger.error('Error in version endpoint', error)

    return NextResponse.json(
      {
        error: 'Failed to retrieve version information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
