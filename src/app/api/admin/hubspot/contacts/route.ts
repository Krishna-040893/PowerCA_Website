import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {hubspotService  } from '@/lib/hubspot-service'
import {createErrorResponse, ErrorType  } from '@/lib/error-handler'

// Force Node.js runtime for HubSpot API client
export const runtime = 'nodejs'

// Get HubSpot contacts (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    // Check if HubSpot is configured
    if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
      return NextResponse.json({
        success: false,
        message: 'HubSpot integration not configured. Please add HUBSPOT_PRIVATE_APP_TOKEN to your environment variables.',
        contacts: [],
        sampleData: true
      })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const _limit = parseInt(searchParams.get('limit') || '20')

    if (email) {
      // Search for specific contact by email
      try {
        const contact = await hubspotService.searchContactByEmail(email)

        return NextResponse.json({
          success: true,
          contact: contact || null,
          message: contact ? 'Contact found' : 'Contact not found'
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: `HubSpot API Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          contact: null
        })
      }
    }

    // Return sample data if HubSpot is not configured or fails
    // In a real implementation, this would fetch from HubSpot API
    return NextResponse.json({
      success: false,
      message: 'HubSpot API integration not fully implemented. Showing sample data.',
      contacts: [
        {
          id: 'sample-1',
          email: 'rajesh.kumar@email.com',
          firstname: 'Rajesh',
          lastname: 'Kumar',
          company: 'Kumar & Associates',
          phone: '+91 98765 43210',
          created: new Date().toISOString(),
          hubspotscore: 85
        },
        {
          id: 'sample-2',
          email: 'priya.sharma@email.com',
          firstname: 'Priya',
          lastname: 'Sharma',
          company: 'Sharma CA Firm',
          phone: '+91 98765 43211',
          created: new Date(Date.now() - 86400000).toISOString(),
          hubspotscore: 72
        }
      ],
      sampleData: true,
      total: 2
    })

  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}

// Create or update HubSpot contact (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    // Check if HubSpot is configured
    if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
      return NextResponse.json({
        success: false,
        message: 'HubSpot integration not configured'
      }, { status: 400 })
    }

    const userData = await request.json()

    // Validate required fields
    if (!userData.email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 })
    }

    try {
      const result = await hubspotService.syncUserToHubSpot(userData)

      return NextResponse.json({
        success: true,
        message: result ? 'Contact synced successfully' : 'Sync completed (no changes needed)',
        contact: result
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: `HubSpot sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}