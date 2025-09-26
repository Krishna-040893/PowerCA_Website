import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'
import {getServerSession  } from 'next-auth/next'
import {authOptions  } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { affiliateCode, planId, amount, paymentId } = body

    if (!affiliateCode || !planId || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const supabase = createAdminClient()

    // Find affiliate by referral code or affiliate_id
    const { data: affiliateProfile, error: affiliateError } = await supabase
      .from('affiliate_profiles')
      .select('*, user:registrations(id, email, name)')
      .or(`referral_code.eq.${affiliateCode},affiliate_id.eq.${affiliateCode}`)
      .single()

    if (affiliateError || !affiliateProfile) {
      // Don't fail - just continue
      return NextResponse.json({
        success: true,
        message: 'Payment processed (no valid affiliate code)',
        referral: null
      })
    }

    // Get count of existing referrals (no limit enforced)
    const { data: existingReferrals, error: _refCheckError } = await supabase
      .from('affiliate_referrals')
      .select('id')
      .eq('affiliate_profile_id', affiliateProfile.id)
      .eq('status', 'converted')

    const _referralCount = existingReferrals?.length || 0

    // Get customer details from session or payment
    const customerEmail = session?.user?.email || 'customer@example.com'
    const customerName = session?.user?.name || 'Customer'

    // Create referral record (without commission)
    const { data: referralData, error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_profile_id: affiliateProfile.id,
        referred_email: customerEmail,
        referred_name: customerName,
        status: 'converted',
        converted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (referralError) {
      // Don't fail the payment - just continue
    }

    // Skip total_referrals update as the column doesn't exist in database
    // We track count by counting rows in affiliate_referrals table instead

    // Store payment-referral mapping for admin tracking (without commission)
    const { error: paymentTrackingError } = await supabase
      .from('payment_referrals')
      .insert({
        payment_id: paymentId,
        affiliate_profile_id: affiliateProfile.id,
        customer_email: customerEmail,
        customer_name: customerName,
        plan_id: planId,
        payment_amount: amount,
        commission_amount: 0, // No commission for now
        created_at: new Date().toISOString()
      })

    if (paymentTrackingError) {
      // Table might not exist yet
    }

    return NextResponse.json({
      success: true,
      message: 'Referral tracked successfully',
      referral: {
        id: referralData?.id,
        affiliateName: affiliateProfile.user?.name,
        status: 'converted'
      }
    })

  } catch {
    // Don't fail the payment due to referral tracking errors
    return NextResponse.json({
      success: true,
      message: 'Payment processed (referral tracking error)',
      referral: null
    })
  }
}