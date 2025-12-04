/**
 * API Route: User Billing Address
 * PUT - Update user billing address in registration_forms table
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * PUT /api/user/billing
 * Update billing address information for a user
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

    // Parse request body
    const body = await request.json()
    const {
      name,
      email,
      phone,
      firmName,
      company,
      address,
      gstNumber,
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update user's billing information in registration_forms
    const { data: updatedData, error } = await supabase
      .from('registration_forms')
      .update({
        name,
        phone: phone || null,
        firm_name: firmName || null,
        company: company || null,
        address: address || null,
        gst_number: gstNumber || null,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.user.email)
      .select()
      .single()

    if (error) {
      logger.error('Error updating billing information', error)
      return NextResponse.json(
        { error: 'Failed to update billing information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Billing information updated successfully',
      data: {
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        firmName: updatedData.firm_name,
        company: updatedData.company,
        address: updatedData.address,
        gstNumber: updatedData.gst_number,
      }
    })
  } catch (error) {
    logger.error('Billing update error', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
