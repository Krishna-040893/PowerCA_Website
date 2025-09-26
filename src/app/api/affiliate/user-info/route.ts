import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {createAdminClient  } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get user data from registrations including affiliate_id
    const { data: userData, error: userError } = await supabase
      .from('registrations')
      .select('id, email, name, role, affiliate_id, affiliate_status, affiliate_details_completed')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Check if user is an affiliate
    if (userData.role !== 'Affiliate') {
      return NextResponse.json(
        { error: 'User is not an affiliate' },
        { status: 403 }
      )
    }

    // Get affiliate profile if exists
    const { data: affiliateProfile, error: _profileError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      user: userData,
      profile: affiliateProfile,
      hasProfile: !!affiliateProfile,
      affiliateId: userData.affiliate_id || affiliateProfile?.affiliate_id,
      needsSetup: !affiliateProfile || !affiliateProfile.firm_name || userData.affiliate_details_completed === false
    })

  } catch (error) {
    console.error('Error in affiliate user-info API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}