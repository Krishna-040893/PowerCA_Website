import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Fetch affiliate details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // First check if user is an affiliate
    const { data: userData, error: userError } = await supabase
      .from('registrations')
      .select('id, role, affiliate_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.role !== 'Affiliate') {
      return NextResponse.json(
        { error: 'User is not an affiliate' },
        { status: 403 }
      )
    }

    // Fetch affiliate details (using affiliate_profiles table)
    const { data: affiliateDetails, error: detailsError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single()

    if (detailsError && detailsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching affiliate details:', detailsError)
      return NextResponse.json(
        { error: 'Failed to fetch affiliate details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      affiliateDetails: affiliateDetails || null,
      userId: userData.id,
      affiliateId: userData.affiliate_id
    })

  } catch (error) {
    console.error('Error in GET /api/affiliate/details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new affiliate details
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/affiliate/details - Starting')

    // Ensure we always return JSON
    const headers = {
      'Content-Type': 'application/json',
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401, headers }
      )
    }

    console.log('Session user:', session.user.id, session.user.email)

    const body = await request.json()
    console.log('Request body:', body)

    const supabase = createAdminClient()

    // Verify user is an affiliate
    console.log('Checking user in registrations table for ID:', session.user.id)

    const { data: userData, error: userError } = await supabase
      .from('registrations')
      .select('id, role, affiliate_id')
      .eq('id', session.user.id)
      .single()

    console.log('User data from DB:', userData)
    console.log('User error:', userError)

    if (userError || !userData) {
      console.error('User not found in database:', {
        error: userError,
        userData: userData
      })
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check role case-insensitively
    if (userData.role?.toLowerCase() !== 'affiliate') {
      console.error('User is not an affiliate:', {
        role: userData.role,
        expected: 'Affiliate'
      })
      return NextResponse.json(
        { error: `User is not an affiliate. Current role: ${userData.role}` },
        { status: 403 }
      )
    }

    console.log('User verified as affiliate with ID:', userData.affiliate_id)

    // Check if affiliate details already exist
    console.log('Checking for existing profile for user:', userData.id)

    const { data: existingDetails, error: checkError } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', userData.id)
      .single()

    console.log('Existing details check:', { existingDetails, checkError })

    if (existingDetails) {
      console.log('Profile already exists, should use PUT instead')
      return NextResponse.json(
        { error: 'Affiliate profile already exists. Please refresh the page.' },
        { status: 400 }
      )
    }

    // Generate a simple referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = 'REF-'
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    // Prepare insert data
    const insertData = {
      user_id: userData.id,
      affiliate_id: body.affiliateId || userData.affiliate_id, // Use admin-assigned ID
      referral_code: generateReferralCode(),
      firm_name: body.firmName,
      firm_address: body.firmAddress,
      contact_person: body.contactPerson || null,
      contact_email: body.contactEmail || null,
      contact_phone: body.contactPhone || null,
      product_url: body.productUrl || 'https://powerca.in/demo',
      website_url: body.websiteUrl || 'https://powerca.in',
      status: 'active'
    }

    console.log('Attempting to insert affiliate profile:', insertData)

    // Create affiliate details with minimal required fields
    const { data: newDetails, error: createError } = await supabase
      .from('affiliate_profiles')
      .insert(insertData)
      .select()
      .single()

    console.log('Insert result:', { newDetails, createError })

    if (createError) {
      console.error('Error creating affiliate details:', {
        error: createError,
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        code: createError.code
      })
      return NextResponse.json(
        { error: `Failed to create affiliate details: ${createError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Update user's affiliate_details_completed flag in registrations table
    await supabase
      .from('registrations')
      .update({
        affiliate_details_completed: true,
        affiliate_id: newDetails.affiliate_id || userData.affiliate_id
      })
      .eq('id', userData.id)

    return NextResponse.json({
      success: true,
      message: 'Affiliate details created successfully',
      affiliateDetails: newDetails
    })

  } catch (error) {
    console.error('Error in POST /api/affiliate/details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update existing affiliate details
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Verify user is an affiliate
    console.log('Checking user in registrations table for ID:', session.user.id)

    const { data: userData, error: userError } = await supabase
      .from('registrations')
      .select('id, role, affiliate_id')
      .eq('id', session.user.id)
      .single()

    console.log('User data from DB:', userData)
    console.log('User error:', userError)

    if (userError || !userData) {
      console.error('User not found in database:', {
        error: userError,
        userData: userData
      })
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check role case-insensitively
    if (userData.role?.toLowerCase() !== 'affiliate') {
      console.error('User is not an affiliate:', {
        role: userData.role,
        expected: 'Affiliate'
      })
      return NextResponse.json(
        { error: `User is not an affiliate. Current role: ${userData.role}` },
        { status: 403 }
      )
    }

    console.log('User verified as affiliate with ID:', userData.affiliate_id)

    // Update affiliate details
    const { data: updatedDetails, error: updateError } = await supabase
      .from('affiliate_profiles')
      .update({
        firm_name: body.firmName,
        firm_address: body.firmAddress,
        contact_person: body.contactPerson || null,
        contact_email: body.contactEmail || null,
        contact_phone: body.contactPhone || null,
        product_url: body.productUrl || 'https://powerca.in/demo',
        website_url: body.websiteUrl || 'https://powerca.in',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userData.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating affiliate details:', updateError)
      return NextResponse.json(
        { error: 'Failed to update affiliate details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate details updated successfully',
      affiliateDetails: updatedDetails
    })

  } catch (error) {
    console.error('Error in PUT /api/affiliate/details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}