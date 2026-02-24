import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    const supabase = createAdminClient()

    // Check if user has an affiliate referral (pending payment)
    const { data: referral, error } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        affiliate_profiles!affiliate_profile_id (
          referral_code,
          affiliate_id
        )
      `)
      .eq('referred_email', userEmail)
      .in('status', ['pending', 'converted'])
      .single()

    if (error || !referral) {
      return NextResponse.json({
        hasReferral: false,
        referralInfo: null
      })
    }

    // If referral is still 'pending', check if user actually has a successful payment
    // (the status may not have been updated during payment verification)
    if (referral.status === 'pending') {
      const { data: paidPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('email', userEmail)
        .in('status', ['captured', 'paid', 'authorized', 'success'])
        .limit(1)
        .single()

      if (paidPayment) {
        // User has paid - update the referral status to 'converted'
        await supabase
          .from('affiliate_referrals')
          .update({
            status: 'converted',
            converted_at: new Date().toISOString()
          })
          .eq('id', referral.id)

        // Don't show referral info since payment is done
        return NextResponse.json({
          hasReferral: false,
          referralInfo: null
        })
      }
    }

    // Only show referral info if status is still genuinely pending
    if (referral.status !== 'pending') {
      return NextResponse.json({
        hasReferral: false,
        referralInfo: null
      })
    }

    // Return referral information for pending users
    return NextResponse.json({
      hasReferral: true,
      referralInfo: {
        customerId: referral.customer_id,
        referralCode: referral.referral_code || referral.affiliate_profiles?.referral_code,
        affiliateId: referral.affiliate_id || referral.affiliate_profiles?.affiliate_id,
        status: referral.status,
        createdAt: referral.created_at
      }
    })
  } catch (error) {
    logger.error('Error fetching referral info', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral information' },
      { status: 500 }
    )
  }
}
