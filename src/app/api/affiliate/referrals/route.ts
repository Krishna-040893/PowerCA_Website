import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

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

    // Get user's affiliate profile
    const { data: affiliateProfile, error: profileError } = await supabase
      .from('affiliate_profiles')
      .select('id, affiliate_id, referral_code')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !affiliateProfile) {
      return NextResponse.json(
        { error: 'Affiliate profile not found' },
        { status: 404 }
      )
    }

    // Get referrals for this affiliate
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_profile_id', affiliateProfile.id)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      referrals: referrals || [],
      affiliateInfo: {
        affiliate_id: affiliateProfile.affiliate_id,
        referral_code: affiliateProfile.referral_code
      }
    })

  } catch (error) {
    console.error('Error in affiliate referrals API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new referral
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { referred_email, referred_name, referral_source = 'manual' } = body

    if (!referred_email) {
      return NextResponse.json(
        { error: 'Referred email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user's affiliate profile
    const { data: affiliateProfile, error: profileError } = await supabase
      .from('affiliate_profiles')
      .select('id, affiliate_id, referral_code')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !affiliateProfile) {
      return NextResponse.json(
        { error: 'Affiliate profile not found' },
        { status: 404 }
      )
    }

    // Create new referral
    const { data: newReferral, error: createError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_profile_id: affiliateProfile.id,
        referred_email,
        referred_name: referred_name || null,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating referral:', createError)
      return NextResponse.json(
        { error: 'Failed to create referral' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Referral created successfully',
      referral: newReferral
    })

  } catch (error) {
    console.error('Error in creating referral:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}