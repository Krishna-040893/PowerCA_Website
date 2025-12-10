import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = createAdminClient()
    const searchParams = req.nextUrl.searchParams
    const affiliateId = searchParams.get('affiliateId')
    const status = searchParams.get('status')

    // Get existing affiliate_referral_payments records
    let query = supabase
      .from('affiliate_referral_payments')
      .select(`
        *,
        affiliate_referrals!inner(
          id,
          referral_code,
          customer_id,
          referred_email,
          referred_name,
          referred_phone
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by affiliate_id if provided
    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    // Filter by commission payment status if provided
    if (status) {
      if (status === 'pending') {
        query = query.eq('commission_paid', false)
      } else if (status === 'completed') {
        query = query.eq('commission_paid', true)
      }
    }

    const { data: existingPayments, error } = await query

    if (error) {
      logger.error('Failed to fetch affiliate payments', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    // Also get affiliate referrals and match with payments table by email
    // This catches payments made without using the referral link
    const { data: affiliateReferrals } = await supabase
      .from('affiliate_referrals')
      .select('id, referral_code, affiliate_id, customer_id, referred_email, referred_name, referred_phone')

    // Get all payments from payments table
    const { data: allPayments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    // Create a map of existing referral_id -> payment record (to check payment_count)
    const existingPaymentsByReferralId = new Map<string, typeof existingPayments[0]>()
    existingPayments?.forEach(p => {
      if (p.referral_id) {
        existingPaymentsByReferralId.set(p.referral_id, p)
      }
    })

    // Process all payments and merge with existing records
    // Goal: ONE row per customer showing total orders, paid commission, and pending commission
    const mergedPayments: typeof existingPayments = []

    if (affiliateReferrals && allPayments) {
      // Create map of referred emails to referral info
      const referralByEmail = new Map<string, typeof affiliateReferrals[0]>()
      affiliateReferrals.forEach(ref => {
        if (ref.referred_email) {
          referralByEmail.set(ref.referred_email.toLowerCase(), ref)
        }
      })

      // Group payments by referral (since one referral can have multiple payments for different addresses)
      // Also deduplicate by order_id to avoid counting same payment twice
      const paymentsByReferralId = new Map<string, typeof allPayments>()
      const processedOrderIds = new Set<string>()

      allPayments.forEach(payment => {
        // Skip if we've already processed this order_id
        if (payment.order_id && processedOrderIds.has(payment.order_id)) {
          return
        }

        if (payment.email) {
          const referral = referralByEmail.get(payment.email.toLowerCase())
          if (referral) {
            if (!paymentsByReferralId.has(referral.id)) {
              paymentsByReferralId.set(referral.id, [])
            }
            paymentsByReferralId.get(referral.id)!.push(payment)

            // Mark this order_id as processed
            if (payment.order_id) {
              processedOrderIds.add(payment.order_id)
            }
          }
        }
      })

      // Process each referral - create ONE merged row per customer
      const BASE_PRICE = 25000
      const commissionRate = 10

      paymentsByReferralId.forEach((payments, referralId) => {
        const referral = affiliateReferrals.find(r => r.id === referralId)!
        const totalPaymentCount = payments.length
        const existingRecord = existingPaymentsByReferralId.get(referralId)
        const totalPaymentAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        const firstPayment = payments[0]

        if (!existingRecord) {
          // No existing record - all payments are pending
          const commissionAmount = BASE_PRICE * totalPaymentCount * (commissionRate / 100)

          mergedPayments.push({
            id: `email-match-${referralId}`,
            referral_id: referral.id,
            referral_code: referral.referral_code,
            customer_id: referral.customer_id,
            affiliate_id: referral.affiliate_id,
            order_id: firstPayment.order_id,
            payment_id: firstPayment.id,
            customer_name: referral.referred_name,
            customer_email: referral.referred_email,
            customer_phone: referral.referred_phone,
            customer_firm_name: firstPayment.firm_name || firstPayment.company || '',
            payment_amount: totalPaymentAmount,
            commission_amount: commissionAmount,
            commission_rate: commissionRate,
            commission_paid: false,
            commission_paid_at: null,
            payment_status: 'completed',
            payment_completed_at: firstPayment.created_at,
            created_at: firstPayment.created_at,
            payment_count: totalPaymentCount,
            paid_count: 0,
            pending_count: totalPaymentCount,
            paid_commission: 0,
            pending_commission: commissionAmount,
            affiliate_referrals: {
              id: referral.id,
              referral_code: referral.referral_code,
              customer_id: referral.customer_id,
              referred_email: referral.referred_email,
              referred_name: referral.referred_name,
              referred_phone: referral.referred_phone
            }
          })
        } else {
          // Existing record - merge with new payment info
          const paidCount = existingRecord.payment_count || 0
          const newPaymentsCount = totalPaymentCount - paidCount
          const paidCommission = existingRecord.commission_amount || 0
          const pendingCommission = newPaymentsCount > 0 ? BASE_PRICE * newPaymentsCount * (commissionRate / 100) : 0
          const totalCommission = paidCommission + pendingCommission

          // Determine overall status
          const allPaid = newPaymentsCount <= 0
          const partiallyPaid = paidCount > 0 && newPaymentsCount > 0

          mergedPayments.push({
            ...existingRecord,
            payment_amount: totalPaymentAmount,
            commission_amount: totalCommission,
            commission_paid: allPaid ? existingRecord.commission_paid : false,
            payment_count: totalPaymentCount,
            paid_count: paidCount,
            pending_count: newPaymentsCount > 0 ? newPaymentsCount : 0,
            paid_commission: paidCommission,
            pending_commission: pendingCommission,
            is_partially_paid: partiallyPaid,
            affiliate_referrals: existingRecord.affiliate_referrals || {
              id: referral.id,
              referral_code: referral.referral_code,
              customer_id: referral.customer_id,
              referred_email: referral.referred_email,
              referred_name: referral.referred_name,
              referred_phone: referral.referred_phone
            }
          })
        }
      })

      // Add existing records that don't have matching payments (shouldn't happen, but just in case)
      existingPayments?.forEach(ep => {
        if (!paymentsByReferralId.has(ep.referral_id)) {
          mergedPayments.push({
            ...ep,
            paid_count: ep.payment_count || 0,
            pending_count: 0,
            paid_commission: ep.commission_amount || 0,
            pending_commission: 0
          })
        }
      })
    } else {
      // No affiliate referrals or payments - just use existing payments
      existingPayments?.forEach(ep => {
        mergedPayments.push({
          ...ep,
          paid_count: ep.payment_count || 0,
          pending_count: 0,
          paid_commission: ep.commission_amount || 0,
          pending_commission: 0
        })
      })
    }

    // Use merged payments instead of combining
    let allAffiliatePayments = mergedPayments

    // Apply status filter to combined results
    if (status === 'pending') {
      allAffiliatePayments = allAffiliatePayments.filter(p => !p.commission_paid)
    } else if (status === 'completed') {
      allAffiliatePayments = allAffiliatePayments.filter(p => p.commission_paid)
    }

    // Sort by created_at descending
    allAffiliatePayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Calculate summary statistics
    const summary = {
      totalPayments: allAffiliatePayments.length,
      totalAmount: allAffiliatePayments.reduce((sum, p) => sum + (Number(p.payment_amount) || 0), 0),
      totalCommission: allAffiliatePayments.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0),
      pendingCommission: allAffiliatePayments.filter(p => !p.commission_paid).reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0),
      paidCommission: allAffiliatePayments.filter(p => p.commission_paid).reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0),
    }

    return NextResponse.json({
      success: true,
      payments: allAffiliatePayments,
      summary
    })

  } catch (error) {
    logger.error('Error in affiliate payments API', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mark commission as paid
export async function PUT(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await req.json()
    const { paymentId, commissionPaid, paymentMode, paymentDate, paymentData } = body

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Validate payment details if marking as paid
    if (commissionPaid && (!paymentMode || !paymentDate)) {
      return NextResponse.json(
        { success: false, error: 'Payment mode and date are required when marking as paid' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if this is an email-matched payment (synthetic ID starting with "email-match-")
    const isEmailMatched = paymentId.startsWith('email-match-')

    if (isEmailMatched && paymentData) {
      // For email-matched payments, we need to CREATE a record in affiliate_referral_payments first
      // total_amount includes GST (payment_amount * 1.18)
      const paymentAmount = Number(paymentData.payment_amount) || 0
      const totalAmount = paymentData.total_amount || Math.round(paymentAmount * 1.18)

      const insertData = {
        referral_id: paymentData.referral_id,
        referral_code: paymentData.referral_code,
        affiliate_id: paymentData.affiliate_id,
        customer_id: paymentData.customer_id,
        order_id: paymentData.order_id,
        payment_id: paymentData.payment_id,
        customer_name: paymentData.customer_name,
        customer_email: paymentData.customer_email,
        customer_phone: paymentData.customer_phone,
        customer_firm_name: paymentData.customer_firm_name,
        payment_amount: paymentAmount,
        total_amount: totalAmount,
        commission_amount: paymentData.commission_amount,
        commission_rate: paymentData.commission_rate,
        commission_paid: commissionPaid,
        commission_paid_at: commissionPaid ? new Date().toISOString() : null,
        payment_mode: commissionPaid ? paymentMode : null,
        payment_date: commissionPaid ? paymentDate : null,
        payment_status: 'completed',
        payment_completed_at: paymentData.payment_completed_at,
        payment_count: paymentData.payment_count || 1,
      }

      const { data, error } = await supabase
        .from('affiliate_referral_payments')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        logger.error('Failed to create affiliate payment record', { error, paymentData })
        return NextResponse.json(
          { success: false, error: `Failed to create payment record: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        payment: data
      })
    }

    // For existing records, update them
    const updateData: Record<string, unknown> = {
      commission_paid: commissionPaid,
    }

    if (commissionPaid) {
      updateData.commission_paid_at = new Date().toISOString()
      updateData.payment_mode = paymentMode
      updateData.payment_date = paymentDate
    }

    const { data, error } = await supabase
      .from('affiliate_referral_payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update commission status', { error, paymentId })
      return NextResponse.json(
        { success: false, error: `Failed to update commission: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: data
    })

  } catch (error) {
    logger.error('Error updating commission status', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
