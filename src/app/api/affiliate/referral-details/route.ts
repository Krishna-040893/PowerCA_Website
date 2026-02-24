import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/affiliate/referral-details
 * Fetches detailed referral information including payment status and commission data
 * for the logged-in affiliate.
 * Commission amounts are set by admin (no auto-calculation).
 */
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

    // Get affiliate registration by email
    const { data: affiliateReg, error: regError } = await supabase
      .from('affiliate_registrations')
      .select('id, affiliate_id, referral_code, full_name, email')
      .eq('email', session.user.email)
      .eq('status', 'approved')
      .single()

    if (regError || !affiliateReg) {
      return NextResponse.json(
        { error: 'Affiliate not found or not approved' },
        { status: 404 }
      )
    }

    // Get all referrals for this affiliate (includes commission_amount and commission_status)
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('referral_code', affiliateReg.referral_code)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      )
    }

    // Get all paid payments grouped by email for collection amounts
    const referredEmails = (referrals || [])
      .map(r => r.referred_email)
      .filter(Boolean)
      .map((e: string) => e.toLowerCase())

    // Get payments from payments table for collection totals
    const { data: allPayments } = referredEmails.length > 0
      ? await supabase
          .from('payments')
          .select('email, amount, order_id')
          .in('email', referredEmails)
      : { data: [] }

    // Build collection map: email -> total amount (deduplicated by order_id)
    const collectionByEmail = new Map<string, number>()
    const processedOrderIds = new Set<string>()
    allPayments?.forEach(p => {
      if (p.order_id && processedOrderIds.has(p.order_id)) return
      if (p.order_id) processedOrderIds.add(p.order_id)
      const email = p.email?.toLowerCase()
      if (email) {
        collectionByEmail.set(email, (collectionByEmail.get(email) || 0) + (Number(p.amount) || 0))
      }
    })

    // Get affiliate_referral_payments records as the source of truth for commission
    const referralIds = (referrals || []).map(r => r.id)
    const { data: referralPayments } = referralIds.length > 0
      ? await supabase
          .from('affiliate_referral_payments')
          .select('referral_id, commission_amount, commission_paid')
          .in('referral_id', referralIds)
      : { data: [] }

    // Build per-referral commission maps from affiliate_referral_payments
    const totalCommByReferral = new Map<string, number>()
    const paidCommByReferral = new Map<string, number>()
    const processingCommByReferral = new Map<string, number>()
    referralPayments?.forEach(p => {
      const rid = p.referral_id
      const amt = Number(p.commission_amount) || 0
      totalCommByReferral.set(rid, (totalCommByReferral.get(rid) || 0) + amt)
      if (p.commission_paid) {
        paidCommByReferral.set(rid, (paidCommByReferral.get(rid) || 0) + amt)
      } else {
        processingCommByReferral.set(rid, (processingCommByReferral.get(rid) || 0) + amt)
      }
    })

    // Build referral details using affiliate_referral_payments as source of truth
    const referralDetails = (referrals || []).map((referral) => {
      const email = referral.referred_email?.toLowerCase()
      const collection = email ? (collectionByEmail.get(email) || 0) : 0
      const totalComm = totalCommByReferral.get(referral.id) || 0
      const paidComm = paidCommByReferral.get(referral.id) || 0
      const processingComm = processingCommByReferral.get(referral.id) || 0

      // Derive status from actual payment records
      let commissionStatus: string
      if (totalComm === 0) {
        commissionStatus = 'pending'
      } else if (paidComm >= totalComm) {
        commissionStatus = 'paid'
      } else {
        commissionStatus = 'processing'
      }

      return {
        ...referral,
        collection,
        commission_amount: totalComm,
        commission_status: commissionStatus,
        paid_commission: paidComm,
        processing_commission: processingComm,
        has_payment: collection > 0,
        payment_status: collection > 0 ? 'completed' : 'pending',
      }
    })

    // Calculate summary statistics from affiliate_referral_payments
    const totalReferrals = referralDetails.length
    const paidReferrals = referralDetails.filter(r => r.has_payment)
    const pendingReferrals = referralDetails.filter(r => !r.has_payment)

    // Total commission = sum from affiliate_referral_payments
    const totalCommissionEarned = referralDetails.reduce((sum, r) => sum + r.commission_amount, 0)

    // Paid (received) commission = sum where commission_paid = true
    const paidCommission = referralDetails.reduce((sum, r) => sum + r.paid_commission, 0)

    // Processing commission = sum where commission_paid = false
    const pendingCommission = referralDetails.reduce((sum, r) => sum + r.processing_commission, 0)

    return NextResponse.json({
      success: true,
      affiliate_info: {
        affiliate_id: affiliateReg.affiliate_id,
        referral_code: affiliateReg.referral_code,
        full_name: affiliateReg.full_name,
        email: affiliateReg.email,
      },
      summary: {
        total_referrals: totalReferrals,
        paid_referrals: paidReferrals.length,
        pending_referrals: pendingReferrals.length,
        total_commission_earned: totalCommissionEarned.toFixed(2),
        pending_commission: pendingCommission.toFixed(2),
        paid_commission: paidCommission.toFixed(2)
      },
      referrals: referralDetails
    })

  } catch (error) {
    console.error('Error in affiliate referral-details API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
