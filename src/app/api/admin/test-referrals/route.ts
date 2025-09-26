import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {createAdminClient  } from '@/lib/supabase/admin'
import {isTestMode  } from '@/lib/payment-config'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized) {
      return auth.error
    }

    // Only allow in test mode
    if (!isTestMode()) {
      return NextResponse.json(
        { error: 'Test mode is not enabled' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Fetch test referrals with affiliate information
    const { data: referrals, error } = await supabase
      .from('payment_referrals')
      .select(`
        *,
        affiliate_profiles (
          referral_code,
          firm_name,
          user_id
        )
      `)
      .or('payment_id.ilike.TEST_%,payment_id.ilike.test_%')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching test referrals:', error)
      return NextResponse.json({
        success: false,
        referrals: []
      })
    }

    const formattedReferrals = referrals?.map(referral => ({
      id: referral.id,
      affiliateCode: referral.affiliate_profiles?.referral_code || 'N/A',
      affiliateName: referral.affiliate_profiles?.firm_name || 'N/A',
      customerEmail: referral.customer_email || 'N/A',
      customerName: referral.customer_name || 'N/A',
      paymentAmount: referral.payment_amount || 0,
      planId: referral.plan_id || 'N/A',
      status: 'converted',
      createdAt: referral.created_at
    })) || []

    return NextResponse.json({
      success: true,
      referrals: formattedReferrals,
      total: formattedReferrals.length
    })

  } catch (error) {
    console.error('Error fetching test referrals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test referrals',
        referrals: []
      },
      { status: 500 }
    )
  }
}