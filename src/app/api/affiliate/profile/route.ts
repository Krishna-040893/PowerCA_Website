/**
 * API Route: Affiliate Profile
 * GET - Fetch affiliate profile data from affiliate_registrations table
 * PUT - Update affiliate profile data in affiliate_registrations table
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/affiliate/profile
 * Fetch affiliate profile data from affiliate_registrations table
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = session.user.role

    // Check if user is an affiliate
    if (userRole !== 'affiliate' && userRole !== 'Affiliate') {
      return NextResponse.json(
        { error: 'Access denied. Only affiliates can access this endpoint.' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Fetch affiliate data from affiliate_registrations table
    const { data: affiliateData, error } = await supabase
      .from('affiliate_registrations')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error) {
      console.error('Error fetching affiliate profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      )
    }

    if (!affiliateData) {
      return NextResponse.json(
        { error: 'Affiliate profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: affiliateData
    })
  } catch (error) {
    console.error('Affiliate profile fetch error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/affiliate/profile
 * Update affiliate profile data in affiliate_registrations table
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = session.user.role

    // Check if user is an affiliate
    if (userRole !== 'affiliate' && userRole !== 'Affiliate') {
      return NextResponse.json(
        { error: 'Access denied. Only affiliates can access this endpoint.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      full_name,
      phone,
      city,
      state,
      company_name,
      designation,
      experience,
      website,
      promotion_method,
      target_audience,
      monthly_leads,
      account_number,
      ifsc_code,
      pan_number,
      gst_number,
    } = body

    // Validate required fields
    if (!full_name || !phone || !city || !state) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, phone, city, state' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update affiliate data
    const { data: updatedData, error } = await supabase
      .from('affiliate_registrations')
      .update({
        full_name,
        phone,
        city,
        state,
        company_name,
        designation,
        experience,
        website,
        promotion_method,
        target_audience,
        monthly_leads,
        account_number,
        ifsc_code,
        pan_number,
        gst_number,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.user.email)
      .select()
      .single()

    if (error) {
      console.error('Error updating affiliate profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedData
    })
  } catch (error) {
    console.error('Affiliate profile update error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
