import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const affiliateCode = searchParams.get('code')

    if (!affiliateCode) {
      return NextResponse.json({
        canRefer: false,
        message: 'No affiliate code provided'
      })
    }

    const supabase = createAdminClient()

    // Find the affiliate profile by referral code
    const { data: affiliateProfile, error: profileError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('referral_code', affiliateCode)
      .single()

    if (profileError || !affiliateProfile) {
      console.error('Affiliate profile not found for code:', affiliateCode)
      return NextResponse.json({
        canRefer: false,
        message: 'Invalid affiliate code'
      })
    }

    // Check how many successful referrals this affiliate has made
    const { data: referrals, error: referralError } = await supabase
      .from('affiliate_referrals')
      .select('id')
      .eq('affiliate_profile_id', affiliateProfile.id)
      .eq('status', 'converted')

    if (referralError) {
      console.error('Error checking referrals:', referralError)
      return NextResponse.json({
        canRefer: true,
        message: 'Unable to verify referral status'
      })
    }

    const referralCount = referrals?.length || 0
    const canRefer = true // No limit on referrals

    return NextResponse.json({
      success: true,
      canRefer,
      referralCount,
      message: 'Affiliate can make referrals',
      affiliateInfo: {
        firm_name: affiliateProfile.firm_name,
        referral_code: affiliateProfile.referral_code
      }
    })

  } catch (error) {
    console.error('Error checking referral limit:', error)
    return NextResponse.json(
      {
        success: false,
        canRefer: false,
        error: 'Failed to check referral limit'
      },
      { status: 500 }
    )
  }
}