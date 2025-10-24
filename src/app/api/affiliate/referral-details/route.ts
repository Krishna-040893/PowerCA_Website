import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/affiliate/referral-details
 * Fetches detailed referral information including payment status and commission data
 * for the logged-in affiliate
 */
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

    // Get affiliate profile (contains referral counters and commission data)
    const { data: affiliateProfile } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('referral_code', affiliateReg.referral_code)
      .maybeSingle()

    // Get all referrals for this affiliate using referral_code
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

    // For each referral, get payment information
    const referralDetails = await Promise.all(
      (referrals || []).map(async (referral) => {
        // Get payment data from affiliate_referral_payments table
        const { data: paymentData } = await supabase
          .from('affiliate_referral_payments')
          .select('*')
          .eq('referral_id', referral.id)
          .maybeSingle()

        // If no payment in affiliate_referral_payments, check payment_orders
        let paymentInfo = null
        if (paymentData) {
          paymentInfo = {
            payment_id: paymentData.payment_id,
            order_id: paymentData.order_id,
            payment_amount: paymentData.payment_amount,
            total_amount: paymentData.total_amount,
            commission_amount: paymentData.commission_amount,
            commission_rate: paymentData.commission_rate,
            commission_paid: paymentData.commission_paid,
            payment_status: paymentData.payment_status,
            payment_completed_at: paymentData.payment_completed_at,
            customer_firm_name: paymentData.customer_firm_name,
            created_at: paymentData.created_at
          }
        } else if (referral.customer_id) {
          // Fallback: Check payment_orders table for this customer
          const { data: orderData } = await supabase
            .from('payment_orders')
            .select('*')
            .eq('customer_id', referral.customer_id)
            .eq('referral_code', affiliateReg.referral_code)
            .maybeSingle()

          if (orderData) {
            // orderData.amount is TOTAL (including GST)
            // Calculate base amount: base = total / 1.18
            const totalAmount = parseFloat(orderData.amount)
            const baseAmount = parseFloat((totalAmount / 1.18).toFixed(2))
            const gstAmount = parseFloat((totalAmount - baseAmount).toFixed(2))

            // Calculate commission on BASE amount (10% by default)
            const commissionRate = affiliateProfile?.commission_rate || 10.00
            const commissionAmount = parseFloat((baseAmount * (commissionRate / 100)).toFixed(2))

            paymentInfo = {
              payment_id: null,
              order_id: orderData.order_id,
              payment_amount: baseAmount,           // Base amount (excluding GST)
              gst_amount: gstAmount,                // 18% GST
              total_amount: totalAmount,            // Total (including GST)
              commission_amount: commissionAmount,   // 10% of base amount
              commission_rate: commissionRate,
              commission_paid: false,
              payment_status: orderData.status === 'paid' ? 'completed' : orderData.status,
              payment_completed_at: orderData.status === 'paid' ? orderData.updated_at : null,
              customer_firm_name: orderData.firm_name || orderData.company,
              created_at: orderData.created_at
            }
          }
        }

        return {
          ...referral,
          payment_info: paymentInfo,
          has_payment: !!paymentInfo,
          payment_status: paymentInfo?.payment_status || 'pending'
        }
      })
    )

    // Calculate summary statistics
    const totalReferrals = referralDetails.length
    const paidReferrals = referralDetails.filter(r =>
      r.payment_info?.payment_status === 'completed'
    )
    const pendingReferrals = referralDetails.filter(r =>
      !r.payment_info || r.payment_info.payment_status === 'pending'
    )

    const totalCommissionEarned = paidReferrals.reduce((sum, r) =>
      sum + parseFloat(r.payment_info?.commission_amount || '0'), 0
    )

    const pendingCommission = paidReferrals
      .filter(r => !r.payment_info?.commission_paid)
      .reduce((sum, r) => sum + parseFloat(r.payment_info?.commission_amount || '0'), 0)

    const paidCommission = paidReferrals
      .filter(r => r.payment_info?.commission_paid)
      .reduce((sum, r) => sum + parseFloat(r.payment_info?.commission_amount || '0'), 0)

    return NextResponse.json({
      success: true,
      affiliate_info: {
        affiliate_id: affiliateReg.affiliate_id,
        referral_code: affiliateReg.referral_code,
        full_name: affiliateReg.full_name,
        email: affiliateReg.email,
        commission_rate: affiliateProfile?.commission_rate || 10.00
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
