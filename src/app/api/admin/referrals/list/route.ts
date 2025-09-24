import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Fetch all referrals with affiliate profile information
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        affiliate_profiles (
          id,
          affiliate_id,
          referral_code,
          firm_name,
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch referrals',
        details: referralsError.message,
        referrals: []
      }, { status: 500 })
    }

    // Get user information for affiliates
    let affiliateUsers = new Map()
    if (referrals && referrals.length > 0) {
      const userIds = [...new Set(referrals
        .map(r => r.affiliate_profiles?.user_id)
        .filter(Boolean))]

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('registrations')
          .select('id, name, email')
          .in('id', userIds)

        if (users) {
          users.forEach(user => {
            affiliateUsers.set(user.id, user)
          })
        }
      }
    }

    // Get payment information for referrals
    let paymentInfo = new Map()
    if (referrals && referrals.length > 0) {
      const profileIds = [...new Set(referrals
        .map(r => r.affiliate_profile_id)
        .filter(Boolean))]

      if (profileIds.length > 0) {
        const { data: payments } = await supabase
          .from('payment_referrals')
          .select('*')
          .in('affiliate_profile_id', profileIds)

        if (payments) {
          payments.forEach(payment => {
            // Map by affiliate_profile_id and customer_email for matching
            const key = `${payment.affiliate_profile_id}_${payment.customer_email}`
            paymentInfo.set(key, payment)
          })
        }
      }
    }

    // Format referral data with all information
    const formattedReferrals = (referrals || []).map(referral => {
      const affiliateUser = affiliateUsers.get(referral.affiliate_profiles?.user_id)
      const paymentKey = `${referral.affiliate_profile_id}_${referral.referred_email}`
      const payment = paymentInfo.get(paymentKey)

      return {
        id: referral.id,
        // Affiliate Information
        affiliate_id: referral.affiliate_profiles?.affiliate_id || 'N/A',
        affiliate_name: affiliateUser?.name || 'N/A',
        affiliate_email: affiliateUser?.email || 'N/A',
        affiliate_firm: referral.affiliate_profiles?.firm_name || 'N/A',
        referral_code: referral.affiliate_profiles?.referral_code || 'N/A',
        // Referred Customer Information
        referred_name: referral.referred_name || 'N/A',
        referred_email: referral.referred_email || 'N/A',
        // Status Information
        status: referral.status || 'pending',
        converted_at: referral.converted_at || referral.created_at,
        created_at: referral.created_at,
        // Payment Information
        payment_amount: payment?.payment_amount || 0,
        payment_id: payment?.payment_id || null,
        plan_id: payment?.plan_id || null
      }
    })

    return NextResponse.json({
      success: true,
      referrals: formattedReferrals,
      total: formattedReferrals.length
    })

  } catch (error) {
    console.error('Error in referrals list API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch referrals',
        details: error instanceof Error ? error.message : 'Unknown error',
        referrals: []
      },
      { status: 500 }
    )
  }
}