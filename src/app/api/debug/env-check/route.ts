import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

// IMPORTANT: Only enable this in development or when debugging
// DELETE THIS FILE after debugging is complete for security

export async function GET() {
  try {
    // Only allow in development or when explicitly enabled
    const isDev = process.env.NODE_ENV === 'development'
    const allowDebug = process.env.ALLOW_ENV_DEBUG === 'true'

    if (!isDev && !allowDebug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

  // Check critical environment variables (don't expose actual values)
  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    checks: {
      nextauth: {
        url: {
          exists: !!process.env.NEXTAUTH_URL,
          value: process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : 'NOT SET',
          isDefault: process.env.NEXTAUTH_URL === 'http://localhost:3009',
        },
        secret: {
          exists: !!process.env.NEXTAUTH_SECRET,
          length: process.env.NEXTAUTH_SECRET?.length || 0,
          isDefault: process.env.NEXTAUTH_SECRET === 'your-nextauth-secret-here-generate-with-openssl',
        },
      },
      supabase: {
        url: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'NOT SET',
          isDefault: process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url',
        },
        anonKey: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        },
        serviceRoleKey: {
          exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        },
      },
    },
    recommendations: [] as string[],
  }

  // Generate recommendations
  if (!envCheck.checks.nextauth.url.exists) {
    envCheck.recommendations.push('❌ CRITICAL: NEXTAUTH_URL is not set')
  } else if (envCheck.checks.nextauth.url.isDefault) {
    envCheck.recommendations.push('⚠️ WARNING: NEXTAUTH_URL is still set to localhost - update to your Vercel URL')
  }

  if (!envCheck.checks.nextauth.secret.exists) {
    envCheck.recommendations.push('❌ CRITICAL: NEXTAUTH_SECRET is not set')
  } else if (envCheck.checks.nextauth.secret.isDefault) {
    envCheck.recommendations.push('⚠️ WARNING: NEXTAUTH_SECRET is using default value - generate a secure secret')
  } else if (envCheck.checks.nextauth.secret.length < 32) {
    envCheck.recommendations.push('⚠️ WARNING: NEXTAUTH_SECRET is too short (should be at least 32 characters)')
  }

  if (!envCheck.checks.supabase.url.exists) {
    envCheck.recommendations.push('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set')
  } else if (envCheck.checks.supabase.url.isDefault) {
    envCheck.recommendations.push('⚠️ WARNING: NEXT_PUBLIC_SUPABASE_URL is using default value')
  }

  if (!envCheck.checks.supabase.anonKey.exists) {
    envCheck.recommendations.push('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  if (!envCheck.checks.supabase.serviceRoleKey.exists) {
    envCheck.recommendations.push('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  if (envCheck.recommendations.length === 0) {
    envCheck.recommendations.push('✅ All critical environment variables appear to be set correctly')
  }

    return NextResponse.json(envCheck, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    logger.error('Environment check endpoint error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error instanceof Error ? error : 'Failed to check environment variables'
    )
  }
}
