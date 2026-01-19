import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/affiliate/referral-details
 * Fetches detailed referral information including payment status and commission data
 * for the logged-in affiliate
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

        // Check payment_orders/payments table to get current total payment count
        let paymentInfo = null
        let totalActualPayments = 0

        // First, get all payments from payments table for this email
        if (referral.referred_email) {
          const { data: paymentsFromTable } = await supabase
            .from('payments')
            .select('order_id')
            .eq('email', referral.referred_email)

          // Deduplicate by order_id
          const uniqueOrderIds = new Set<string>()
          paymentsFromTable?.forEach(p => {
            if (p.order_id) uniqueOrderIds.add(p.order_id)
          })
          totalActualPayments = uniqueOrderIds.size
        }

        if (paymentData) {
          // Use stored commission from affiliate_referral_payments
          // Commission = Base Amount × 10% (Base = payment without GST)
          const commissionRate = paymentData.commission_rate || 10
          const paidOrderCount = paymentData.paid_order_count || 0
          const pendingOrderCount = totalActualPayments > 0 ? totalActualPayments - paidOrderCount : (paymentData.commission_paid ? 0 : 1)

          // Get CURRENT total payment amount from payments table (not stored old value)
          // This ensures we calculate commission based on ALL payments including new ones
          let currentTotalBaseAmount = 0
          if (referral.referred_email) {
            const { data: allPaymentsForCustomer } = await supabase
              .from('payments')
              .select('amount, order_id')
              .eq('email', referral.referred_email)

            // Deduplicate by order_id and sum amounts
            const uniquePayments = new Map<string, number>()
            allPaymentsForCustomer?.forEach(p => {
              if (p.order_id && !uniquePayments.has(p.order_id)) {
                // amount includes GST, so we calculate base = amount / 1.18
                const baseAmount = parseFloat(((Number(p.amount) || 0) / 1.18).toFixed(2))
                uniquePayments.set(p.order_id, baseAmount)
              }
            })
            currentTotalBaseAmount = Array.from(uniquePayments.values()).reduce((sum, amt) => sum + amt, 0)
          }

          // Use current total base amount if available, otherwise fall back to stored
          const effectiveBaseAmount = currentTotalBaseAmount > 0
            ? currentTotalBaseAmount
            : parseFloat(paymentData.payment_amount as string) || 0
          const totalCommissionAmount = parseFloat((effectiveBaseAmount * (commissionRate / 100)).toFixed(2))

          // Use STORED paid commission amount (not order counts) since each order may have different amounts
          const storedPaidCommission = paymentData.commission_paid
            ? parseFloat(paymentData.commission_amount as string) || 0
            : 0

          // Calculate pending commission as difference between current total and what was paid
          const pendingCommission = paymentData.commission_paid
            ? Math.max(0, parseFloat((totalCommissionAmount - storedPaidCommission).toFixed(2)))
            : totalCommissionAmount
          const paidCommission = paymentData.commission_paid ? storedPaidCommission : 0

          // Commission is fully paid only if pending commission is 0
          const isFullyPaid = pendingCommission === 0 && paymentData.commission_paid

          paymentInfo = {
            payment_id: paymentData.payment_id,
            order_id: paymentData.order_id,
            payment_amount: effectiveBaseAmount,
            total_amount: paymentData.total_amount,
            commission_amount: totalCommissionAmount,
            commission_rate: commissionRate,
            commission_paid: isFullyPaid,
            payment_status: paymentData.payment_status,
            payment_completed_at: paymentData.payment_completed_at,
            customer_firm_name: paymentData.customer_firm_name,
            created_at: paymentData.created_at,
            payment_count: totalActualPayments,
            paid_order_count: paidOrderCount,
            pending_order_count: pendingOrderCount,
            paid_commission: paidCommission,
            pending_commission: pendingCommission,
            total_payment_count: totalActualPayments
          }
        } else {
          // Fallback: Check payment_orders table for ALL paid orders (multiple address purchases)
          let ordersList: Record<string, unknown>[] = []

          // Method 1: Try by customer_id + referral_code
          if (referral.customer_id) {
            const { data: ordersByCustomerId } = await supabase
              .from('payment_orders')
              .select('*')
              .eq('customer_id', referral.customer_id)
              .eq('referral_code', affiliateReg.referral_code)
              .eq('status', 'paid')
              .order('created_at', { ascending: false })

            if (ordersByCustomerId && ordersByCustomerId.length > 0) {
              ordersList = ordersByCustomerId
            }
          }

          // Method 2: Try by email + referral_code
          if (ordersList.length === 0 && referral.referred_email) {
            const { data: ordersByEmailAndCode } = await supabase
              .from('payment_orders')
              .select('*')
              .eq('customer_email', referral.referred_email)
              .eq('referral_code', affiliateReg.referral_code)
              .eq('status', 'paid')
              .order('created_at', { ascending: false })

            if (ordersByEmailAndCode && ordersByEmailAndCode.length > 0) {
              ordersList = ordersByEmailAndCode
            }
          }

          // Method 3: Try by email only (for payments made without referral link)
          // This catches cases where the customer paid without using the ?ref=XXX&cus=YYY link
          if (ordersList.length === 0 && referral.referred_email) {
            const { data: ordersByEmailOnly } = await supabase
              .from('payment_orders')
              .select('*')
              .eq('customer_email', referral.referred_email)
              .eq('status', 'paid')
              .order('created_at', { ascending: false })

            if (ordersByEmailOnly && ordersByEmailOnly.length > 0) {
              ordersList = ordersByEmailOnly
            }
          }

          // Method 4: FALLBACK - Check payments table directly (for cases where payment_orders is empty)
          // The payments table stores successful payments with email from payment verification
          if (ordersList.length === 0 && referral.referred_email) {
            const { data: paymentsFromTable } = await supabase
              .from('payments')
              .select('*')
              .eq('email', referral.referred_email)
              .order('created_at', { ascending: false })

            if (paymentsFromTable && paymentsFromTable.length > 0) {
              // Convert payments table format to ordersList format
              ordersList = paymentsFromTable.map(payment => ({
                order_id: payment.order_id,
                payment_id: payment.id,
                customer_email: payment.email,
                amount: payment.amount,
                status: 'paid', // Treat all records in payments table as paid
                firm_name: payment.firm_name,
                company: payment.company,
                discount_percentage: 0,
                discount_amount: 0,
                address_id: null,
                created_at: payment.created_at,
                updated_at: payment.created_at
              }))
            }
          }

          if (ordersList.length > 0) {
            // Sum up ALL paid orders for this customer
            // Commission is 10% of BASE amount (excluding GST)
            // Example: Monthly ₹100 × 5 users = ₹500 base → Commission = ₹50
            let totalBaseAmount = 0
            let totalGstAmount = 0
            let totalAmountSum = 0
            const allPayments: Record<string, unknown>[] = []

            ordersList.forEach(orderData => {
              // orderData.amount is TOTAL (including GST)
              const orderTotal = parseFloat(orderData.amount as string) || 0
              // Always calculate: base = total / 1.18 (removes 18% GST)
              const orderBase = parseFloat((orderTotal / 1.18).toFixed(2))
              const orderGst = parseFloat((orderTotal - orderBase).toFixed(2))

              totalBaseAmount += orderBase
              totalGstAmount += orderGst
              totalAmountSum += orderTotal

              allPayments.push({
                order_id: orderData.order_id,
                payment_id: orderData.payment_id || null,
                amount: orderTotal,
                base_amount: orderBase,
                gst_amount: orderGst,
                discount_percentage: orderData.discount_percentage || 0,
                discount_amount: orderData.discount_amount || 0,
                address_id: orderData.address_id,
                created_at: orderData.created_at
              })
            })

            // Calculate commission on actual BASE amount (excluding GST)
            // Commission = Base Amount × 10%
            const commissionRate = affiliateProfile?.commission_rate || 10.00
            const totalCommissionAmount = parseFloat((totalBaseAmount * (commissionRate / 100)).toFixed(2))

            // Use the first (most recent) order for primary display
            const firstOrder = ordersList[0]

            paymentInfo = {
              payment_id: firstOrder.payment_id || null,
              order_id: firstOrder.order_id,
              payment_amount: totalBaseAmount,           // Total base amount (excluding GST)
              gst_amount: totalGstAmount,                // Total 18% GST
              total_amount: totalAmountSum,              // Grand total (including GST)
              commission_amount: totalCommissionAmount,  // 10% of total base amount
              commission_rate: commissionRate,
              commission_paid: false,
              payment_status: 'completed',
              payment_completed_at: firstOrder.updated_at,
              customer_firm_name: firstOrder.firm_name || firstOrder.company,
              created_at: firstOrder.created_at,
              // Additional info for multiple purchases
              payment_count: ordersList.length,
              paid_order_count: 0,
              pending_order_count: ordersList.length,
              paid_commission: 0,
              pending_commission: totalCommissionAmount,
              all_payments: allPayments
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

    // Calculate commission totals using paid_commission and pending_commission fields
    const totalCommissionEarned = paidReferrals.reduce((sum, r) =>
      sum + parseFloat(r.payment_info?.commission_amount || '0'), 0
    )

    // Sum up pending_commission from all referrals
    const pendingCommission = paidReferrals.reduce((sum, r) =>
      sum + parseFloat(r.payment_info?.pending_commission || '0'), 0
    )

    // Sum up paid_commission from all referrals
    const paidCommission = paidReferrals.reduce((sum, r) =>
      sum + parseFloat(r.payment_info?.paid_commission || '0'), 0
    )

    // Legacy calculation as fallback
    const _legacyPaidCommission = paidReferrals
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
