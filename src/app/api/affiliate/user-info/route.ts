import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {createAdminClient  } from '@/lib/supabase/admin'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'

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

    // Check if user has an approved affiliate registration using email
    const { data: affiliateReg, error: regError } = await supabase
      .from('affiliate_registrations')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (regError || !affiliateReg) {
      console.error('❌ [User Info API] No affiliate registration found:', regError)
      return NextResponse.json(
        { error: 'User is not an affiliate or application not found' },
        { status: 403 }
      )
    }

    // Check if affiliate is approved
    if (affiliateReg.status !== 'approved') {
      return NextResponse.json(
        { error: `Affiliate application is ${affiliateReg.status}. Please wait for approval.` },
        { status: 403 }
      )
    }

    // Get user data from registrations
    const { data: userData } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, email, name, role')
      .eq('email', session.user.email)
      .maybeSingle()

    // Get affiliate profile if exists
    const { data: affiliateProfile } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userData?.id || affiliateReg.user_id)
      .maybeSingle()

    // Get referrer information if this affiliate was referred by another affiliate
    let referrerInfo = null
    if (affiliateReg.referred_by_code) {
      const { data: referrer } = await supabase
        .from('affiliate_registrations')
        .select('full_name, email, affiliate_id, referral_code')
        .eq('referral_code', affiliateReg.referred_by_code)
        .eq('status', 'approved')
        .single()

      if (referrer) {
        referrerInfo = {
          name: referrer.full_name,
          email: referrer.email,
          affiliateId: referrer.affiliate_id,
          referralCode: referrer.referral_code
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: userData || { email: session.user.email, name: session.user.name },
      profile: affiliateProfile,
      affiliateRegistration: affiliateReg,
      hasProfile: !!affiliateProfile,
      affiliateId: affiliateReg.affiliate_id || affiliateProfile?.affiliate_id || null,
      referralCode: affiliateReg.referral_code,
      needsSetup: !affiliateProfile || !affiliateProfile.firm_name,
      referredBy: referrerInfo // Information about the affiliate who referred this user
    })

  } catch (error) {
    console.error('Error in affiliate user-info API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
