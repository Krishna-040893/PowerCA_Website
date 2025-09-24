import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET affiliate profile
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    const userId = 'current-user-id' // This should come from session

    const supabase = createAdminClient()

    // Get affiliate profile
    const { data: profile, error } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return NextResponse.json({
          success: false,
          needsProfile: true,
          message: 'Affiliate profile not found'
        })
      }

      console.error('Error fetching affiliate profile:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error('Error in GET /api/affiliate/profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create affiliate profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company_name,
      website_url,
      description,
      address,
      city,
      state,
      country,
      postal_code,
      bank_name,
      account_number,
      ifsc_code,
      pan_number,
      gst_number
    } = body

    // TODO: Get user ID from session
    const userId = 'current-user-id' // This should come from session

    const supabase = createAdminClient()

    // Check if user is an affiliate
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'affiliate') {
      return NextResponse.json(
        { success: false, error: 'User is not an affiliate' },
        { status: 403 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Affiliate profile already exists' },
        { status: 400 }
      )
    }

    // Generate unique affiliate code
    const affiliateCode = 'AFF' + Math.random().toString(36).substr(2, 7).toUpperCase()

    // Create affiliate profile
    const { data: newProfile, error: insertError } = await supabase
      .from('affiliate_profiles')
      .insert({
        user_id: userId,
        affiliate_code: affiliateCode,
        company_name,
        website_url,
        description,
        address,
        city,
        state,
        country: country || 'India',
        postal_code,
        bank_name,
        account_number,
        ifsc_code,
        pan_number,
        gst_number,
        status: 'approved', // Auto-approve for now
        approved_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating affiliate profile:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Affiliate profile created successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/affiliate/profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}