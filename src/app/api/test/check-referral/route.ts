import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const referralCode = searchParams.get('code')
    const affiliateId = searchParams.get('affiliate_id')

    const supabase = createAdminClient()

    // Check by referral code if provided
    if (referralCode) {
      const { data: profile, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('referral_code', referralCode)
        .single()

      if (error) {
        return NextResponse.json({
          error: 'Profile not found',
          details: error.message
        }, { status: 404 })
      }

      // Get referral records
      const { data: referrals } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_profile_id', profile.id)

      // Get payment referrals
      const { data: paymentReferrals } = await supabase
        .from('payment_referrals')
        .select('*')
        .eq('affiliate_profile_id', profile.id)

      return NextResponse.json({
        success: true,
        profile: {
          id: profile.id,
          affiliate_id: profile.affiliate_id,
          referral_code: profile.referral_code,
          firm_name: profile.firm_name,
          total_referrals: profile.total_referrals,
          status: profile.status
        },
        referrals: referrals || [],
        paymentReferrals: paymentReferrals || [],
        summary: {
          totalReferralsInProfile: profile.total_referrals || 0,
          actualReferralRecords: referrals?.length || 0,
          paymentRecords: paymentReferrals?.length || 0
        }
      })
    }

    // Check by affiliate ID if provided
    if (affiliateId) {
      const { data: profile, error } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .single()

      if (error) {
        return NextResponse.json({
          error: 'Profile not found',
          details: error.message
        }, { status: 404 })
      }

      // Get referral records
      const { data: referrals } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_profile_id', profile.id)

      return NextResponse.json({
        success: true,
        profile: {
          id: profile.id,
          affiliate_id: profile.affiliate_id,
          referral_code: profile.referral_code,
          firm_name: profile.firm_name,
          total_referrals: profile.total_referrals
        },
        referrals: referrals || [],
        summary: {
          totalReferralsInProfile: profile.total_referrals || 0,
          actualReferralRecords: referrals?.length || 0
        }
      })
    }

    // Get all affiliate profiles with their referrals
    const { data: profiles } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const summary = []
    for (const profile of profiles || []) {
      const { data: referrals } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_profile_id', profile.id)

      summary.push({
        affiliate_id: profile.affiliate_id,
        referral_code: profile.referral_code,
        firm_name: profile.firm_name,
        total_referrals: profile.total_referrals || 0,
        actual_referral_records: referrals?.length || 0,
        referrals: referrals || []
      })
    }

    return NextResponse.json({
      success: true,
      totalProfiles: profiles?.length || 0,
      profiles: summary
    })

  } catch (error: any) {
    console.error('Error checking referrals:', error)
    return NextResponse.json(
      {
        error: 'Failed to check referrals',
        details: error.message
      },
      { status: 500 }
    )
  }
}