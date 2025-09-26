import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {hubspotService  } from '@/lib/hubspot-service'
import {createErrorResponse, ErrorType  } from '@/lib/error-handler'

// Force Node.js runtime for HubSpot API client
export const runtime = 'nodejs'

// Get HubSpot configuration status (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    // Check environment variables
    const hasToken = !!process.env.HUBSPOT_PRIVATE_APP_TOKEN
    const hasPortalId = !!process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID

    // Basic configuration check
    const configStatus = {
      configured: hasToken && hasPortalId,
      hasToken,
      hasPortalId,
      tokenLength: process.env.HUBSPOT_PRIVATE_APP_TOKEN?.length || 0,
      portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || null
    }

    if (!configStatus.configured) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'HubSpot integration not properly configured',
        config: configStatus,
        requiredEnvVars: [
          'HUBSPOT_PRIVATE_APP_TOKEN',
          'NEXT_PUBLIC_HUBSPOT_PORTAL_ID'
        ]
      })
    }

    // Test API connection if configured
    try {
      // Try to search for a test contact to verify connection
      const _testResult = await hubspotService.searchContactByEmail('test@powerca.in')

      return NextResponse.json({
        status: 'connected',
        message: 'HubSpot integration is configured and working',
        config: {
          configured: true,
          hasToken: true,
          hasPortalId: true,
          portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID
        },
        connectionTest: {
          success: true,
          message: 'API connection successful'
        }
      })
    } catch {
      return NextResponse.json({
        status: 'configuration_error',
        message: 'HubSpot is configured but connection failed',
        config: configStatus,
        connectionTest: {
          success: false,
          error: 'Connection test failed'
        }
      })
    }

  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}