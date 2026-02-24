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

    const { data: existingPayments, error } = await query

    if (error) {
      logger.error('Failed to fetch affiliate payments', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    // Also get affiliate referrals (with commission fields) and match with payments table by email
    // This catches payments made without using the referral link
    const { data: affiliateReferrals } = await supabase
      .from('affiliate_referrals')
      .select('id, referral_code, affiliate_id, customer_id, referred_email, referred_name, referred_phone, commission_amount, commission_status')

    // Get affiliate names from affiliate_registrations
    const { data: affiliateRegistrations } = await supabase
      .from('affiliate_registrations')
      .select('referral_code, full_name')

    // Create a mapping: referral_code → full_name
    const affiliateNameMap = new Map<string, string>()
    affiliateRegistrations?.forEach(reg => {
      if (reg.referral_code) {
        affiliateNameMap.set(reg.referral_code, reg.full_name)
      }
    })

    // Get all PAID payments from payments table (only captured/paid status)
    const { data: allPayments } = await supabase
      .from('payments')
      .select('*')
      .in('status', ['captured', 'paid', 'authorized', 'success'])
      .order('created_at', { ascending: false })

    // Create a map of existing referral_id -> payment record (keep first record for ID reference)
    const existingPaymentsByReferralId = new Map<string, typeof existingPayments[0]>()
    existingPayments?.forEach(p => {
      if (p.referral_id && !existingPaymentsByReferralId.has(p.referral_id)) {
        existingPaymentsByReferralId.set(p.referral_id, p)
      }
    })

    // Calculate total paid commission per referral (sum across ALL paid records)
    const totalPaidCommissionByReferral = new Map<string, number>()
    existingPayments?.forEach(p => {
      if (p.referral_id && p.commission_paid) {
        const existing = totalPaidCommissionByReferral.get(p.referral_id) || 0
        totalPaidCommissionByReferral.set(p.referral_id, existing + (Number(p.commission_amount) || 0))
      }
    })

    // Calculate last commission PAID date per referral (only from records where commission was actually paid)
    const lastCommissionDateByReferral = new Map<string, string>()
    existingPayments?.forEach(p => {
      if (p.referral_id && p.commission_paid && p.commission_paid_at) {
        const date = p.commission_paid_at as string
        const existing = lastCommissionDateByReferral.get(p.referral_id)
        if (!existing || date > existing) {
          lastCommissionDateByReferral.set(p.referral_id, date)
        }
      }
    })

    // Calculate last commission SET date per referral (from ALL records, including unpaid)
    const lastCommissionSetDateByReferral = new Map<string, string>()
    existingPayments?.forEach(p => {
      if (p.referral_id && p.created_at) {
        const date = p.created_at as string
        const existing = lastCommissionSetDateByReferral.get(p.referral_id)
        if (!existing || date > existing) {
          lastCommissionSetDateByReferral.set(p.referral_id, date)
        }
      }
    })

    // Calculate UNPAID commission per referral (sum across records where commission_paid = false)
    // This is the most reliable source of "commission due" — directly from unpaid records
    const unpaidCommissionByReferral = new Map<string, number>()
    existingPayments?.forEach(p => {
      if (p.referral_id && !p.commission_paid) {
        const existing = unpaidCommissionByReferral.get(p.referral_id) || 0
        unpaidCommissionByReferral.set(p.referral_id, existing + (Number(p.commission_amount) || 0))
      }
    })

    // Process all payments and merge with existing records
    // Goal: ONE row per customer showing total orders, paid commission, and pending commission
    const mergedPayments: typeof existingPayments = []

    if (affiliateReferrals) {
      // Create map of referred emails to referral info
      const referralByEmail = new Map<string, typeof affiliateReferrals[0]>()
      affiliateReferrals.forEach(ref => {
        if (ref.referred_email) {
          referralByEmail.set(ref.referred_email.toLowerCase(), ref)
        }
      })

      // Group payments by referral (since one referral can have multiple payments for different addresses)
      // Also deduplicate by order_id to avoid counting same payment twice
      const paymentsByReferralId = new Map<string, NonNullable<typeof allPayments>>()
      const processedOrderIds = new Set<string>()

      const paymentsToProcess = allPayments || []
      paymentsToProcess.forEach(payment => {
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

      // Create a map of referral_id -> referral (with commission fields)
      const referralById = new Map<string, typeof affiliateReferrals[0]>()
      affiliateReferrals.forEach(ref => {
        referralById.set(ref.id, ref)
      })

      // Process each referral - create ONE merged row per customer
      // Commission comes from admin-set affiliate_referrals.commission_amount (no auto 10%)
      paymentsByReferralId.forEach((payments, referralId) => {
        const referral = referralById.get(referralId)
        if (!referral) return

        const totalPaymentCount = payments.length
        const existingRecord = existingPaymentsByReferralId.get(referralId)
        const firstPayment = payments[0]

        // 3-state split: paid / processing / waiting
        const lastCommPaidDate = lastCommissionDateByReferral.get(referralId)
        const lastCommSetDate = lastCommissionSetDateByReferral.get(referralId)

        const paidOrders: typeof payments = []
        const processingOrders: typeof payments = []
        const waitingOrders: typeof payments = []

        payments.forEach(p => {
          if (!p.created_at) {
            waitingOrders.push(p)
            return
          }
          const orderDate = new Date(p.created_at)
          if (lastCommPaidDate && orderDate <= new Date(lastCommPaidDate)) {
            paidOrders.push(p)
          } else if (lastCommSetDate && orderDate <= new Date(lastCommSetDate)) {
            processingOrders.push(p)
          } else {
            waitingOrders.push(p)
          }
        })

        // Get firm names only from waiting (pending) orders for display
        const waitingFirmNames = [...new Set(waitingOrders
          .map(p => p.firm_name || p.company)
          .filter(Boolean)
        )]
        const allFirmNames = [...new Set(payments
          .map(p => p.firm_name || p.company)
          .filter(Boolean)
        )]
        const firmNamesDisplay = waitingFirmNames.length > 0
          ? waitingFirmNames.join(', ')
          : allFirmNames.join(', ') || ''

        // Commission from admin-set value on affiliate_referrals
        const adminCommission = Number(referral.commission_amount) || 0
        const storedPaidCommission = totalPaidCommissionByReferral.get(referralId) || 0

        // Use UNPAID records as the primary source of commission due
        // This is reliable even when affiliate_referrals.commission_amount is out of sync with paid records
        const unpaidCommission = unpaidCommissionByReferral.get(referralId) || 0
        const derivedDue = Math.max(0, parseFloat((adminCommission - storedPaidCommission).toFixed(2)))
        const commissionDue = Math.max(unpaidCommission, derivedDue)
        const isFullyPaid = commissionDue === 0 && (adminCommission > 0 || storedPaidCommission > 0) && waitingOrders.length === 0 && processingOrders.length === 0

        if (!existingRecord) {
          mergedPayments.push({
            id: `email-match-${referralId}`,
            referral_id: referral.id,
            referral_code: referral.referral_code,
            customer_id: referral.customer_id,
            affiliate_id: referral.affiliate_id,
            affiliate_name: affiliateNameMap.get(referral.referral_code) || '',
            order_id: firstPayment.order_id,
            payment_id: firstPayment.id,
            customer_name: referral.referred_name,
            customer_email: referral.referred_email,
            customer_phone: referral.referred_phone,
            customer_firm_name: firmNamesDisplay,
            payment_amount: waitingOrders.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
            commission_amount: adminCommission,
            commission_rate: 0,
            commission_paid: false,
            commission_paid_at: null,
            payment_status: 'completed',
            payment_completed_at: firstPayment.created_at,
            created_at: firstPayment.created_at,
            payment_count: totalPaymentCount,
            paid_order_count: paidOrders.length,
            processing_order_count: processingOrders.length,
            pending_order_count: waitingOrders.length,
            paid_commission: 0,
            pending_commission: adminCommission,
            commission_due: adminCommission,
            payment_type: 'initial_payment',
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
          mergedPayments.push({
            ...existingRecord,
            affiliate_name: affiliateNameMap.get(referral.referral_code) || '',
            customer_firm_name: firmNamesDisplay || existingRecord.customer_firm_name,
            payment_amount: waitingOrders.length > 0
              ? waitingOrders.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
              : payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
            commission_amount: adminCommission,
            commission_paid: isFullyPaid,
            payment_count: totalPaymentCount,
            paid_order_count: paidOrders.length,
            processing_order_count: processingOrders.length,
            pending_order_count: waitingOrders.length,
            paid_commission: storedPaidCommission,
            pending_commission: commissionDue,
            commission_due: commissionDue,
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

      // Add referrals that have commission set but weren't matched via customer payments
      // This handles: (a) commission-only referrals, (b) existing affiliate_referral_payments records without email match
      const addedReferralIds = new Set(mergedPayments.map(m => m.referral_id))

      affiliateReferrals.forEach(referral => {
        const adminCommission = Number(referral.commission_amount) || 0
        const unpaidCommission = unpaidCommissionByReferral.get(referral.id) || 0
        // Skip if no commission set AND no unpaid records
        if (adminCommission <= 0 && unpaidCommission <= 0) return
        // Skip if already added via payment matching
        if (addedReferralIds.has(referral.id)) return

        const storedPaidCommission = totalPaidCommissionByReferral.get(referral.id) || 0
        const derivedDue = Math.max(0, parseFloat((adminCommission - storedPaidCommission).toFixed(2)))
        const commissionDue = Math.max(unpaidCommission, derivedDue)
        const existingRecord = existingPaymentsByReferralId.get(referral.id)

        mergedPayments.push({
          id: existingRecord?.id || `commission-${referral.id}`,
          referral_id: referral.id,
          referral_code: referral.referral_code,
          customer_id: referral.customer_id,
          affiliate_id: referral.affiliate_id,
          affiliate_name: affiliateNameMap.get(referral.referral_code) || '',
          order_id: existingRecord?.order_id || null,
          payment_id: existingRecord?.payment_id || null,
          customer_name: referral.referred_name,
          customer_email: referral.referred_email,
          customer_phone: referral.referred_phone,
          customer_firm_name: existingRecord?.customer_firm_name || '',
          payment_amount: 0,
          commission_amount: adminCommission,
          commission_rate: 0,
          commission_paid: adminCommission > 0 && commissionDue === 0,
          commission_paid_at: existingRecord?.commission_paid_at || null,
          payment_status: existingRecord?.payment_status || 'completed',
          payment_completed_at: existingRecord?.payment_completed_at || null,
          created_at: existingRecord?.created_at || new Date().toISOString(),
          payment_count: existingRecord?.payment_count || 0,
          paid_order_count: existingRecord?.paid_order_count || 0,
          processing_order_count: 0,
          pending_order_count: existingRecord?.pending_order_count || 0,
          paid_commission: storedPaidCommission,
          pending_commission: commissionDue,
          commission_due: commissionDue,
          payment_type: existingRecord?.payment_type || 'initial_payment',
          affiliate_referrals: {
            id: referral.id,
            referral_code: referral.referral_code,
            customer_id: referral.customer_id,
            referred_email: referral.referred_email,
            referred_name: referral.referred_name,
            referred_phone: referral.referred_phone
          }
        })
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

    // Sort by created_at descending
    mergedPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Calculate summary statistics from FULL dataset (before status filter)
    const summary = {
      totalPayments: mergedPayments.length,
      totalAmount: mergedPayments.reduce((sum, p) => sum + (Number(p.payment_amount) || 0), 0),
      totalCommission: mergedPayments.reduce((sum, p) => {
        const pending = Number(p.pending_commission) || 0
        const paid = Number(p.paid_commission) || 0
        return sum + pending + paid
      }, 0),
      pendingCommission: mergedPayments.reduce((sum, p) => sum + (Number(p.pending_commission) || 0), 0),
      paidCommission: mergedPayments.reduce((sum, p) => sum + (Number(p.paid_commission) || 0), 0),
    }

    // Apply status filter AFTER computing summary
    let allAffiliatePayments = mergedPayments
    if (status === 'pending') {
      allAffiliatePayments = allAffiliatePayments.filter(p => {
        const due = Number(p.commission_due) || Number(p.pending_commission) || 0
        return due > 0
      })
    } else if (status === 'completed') {
      allAffiliatePayments = allAffiliatePayments.filter(p => {
        const due = Number(p.commission_due) || Number(p.pending_commission) || 0
        return due === 0 && (Number(p.commission_amount) > 0 || Number(p.paid_commission) > 0)
      })
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
    const { paymentId, commissionPaid, paymentMode, referenceNo, paymentDate, paymentData } = body

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

    // Check if this is a synthetic payment (no DB record yet)
    const isEmailMatched = paymentId.startsWith('email-match-') || paymentId.startsWith('commission-')

    if (isEmailMatched && paymentData) {
      // For email-matched payments, we need to CREATE a record in affiliate_referral_payments first
      // total_amount includes GST (payment_amount * 1.18)
      const paymentAmount = Number(paymentData.payment_amount) || 0
      const totalAmount = paymentData.total_amount || Math.round(paymentAmount * 1.18)

      // Calculate paid order count - when paying, we pay all pending orders
      const pendingOrderCount = paymentData.pending_order_count || paymentData.payment_count || 1
      const paidOrderCount = commissionPaid ? pendingOrderCount : 0

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
        commission_amount: paymentData.pending_commission || paymentData.commission_amount,
        commission_rate: paymentData.commission_rate,
        commission_paid: commissionPaid,
        commission_paid_at: commissionPaid ? new Date().toISOString() : null,
        payment_mode: commissionPaid ? paymentMode : null,
        reference_no: commissionPaid && referenceNo ? referenceNo : null,
        payment_date: commissionPaid ? paymentDate : null,
        payment_status: 'completed',
        payment_completed_at: paymentData.payment_completed_at,
        payment_count: paymentData.payment_count || 1,
        paid_order_count: paidOrderCount,
        payment_type: paymentData.payment_type || 'initial_payment',
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

      // Also update affiliate_referrals.commission_status to 'paid' if marking as paid
      if (commissionPaid && paymentData.referral_id) {
        await supabase
          .from('affiliate_referrals')
          .update({ commission_status: 'paid' })
          .eq('id', paymentData.referral_id)
      }

      return NextResponse.json({
        success: true,
        payment: data
      })
    }

    // For existing records, update them
    // First, get the current record to calculate new paid_order_count
    const { data: currentRecord } = await supabase
      .from('affiliate_referral_payments')
      .select('paid_order_count, payment_count')
      .eq('id', paymentId)
      .single()

    const currentPaidOrderCount = currentRecord?.paid_order_count || 0
    const totalPaymentCount = paymentData?.payment_count || currentRecord?.payment_count || 1
    const pendingOrderCount = paymentData?.pending_order_count != null && paymentData.pending_order_count > 0
      ? paymentData.pending_order_count
      : (totalPaymentCount - currentPaidOrderCount)

    const updateData: Record<string, unknown> = {}

    if (commissionPaid) {
      // When paying commission, update paid_order_count to include pending orders
      const newPaidOrderCount = currentPaidOrderCount + pendingOrderCount
      updateData.paid_order_count = newPaidOrderCount
      updateData.commission_paid = true
      updateData.commission_paid_at = new Date().toISOString()
      updateData.payment_mode = paymentMode
      updateData.reference_no = referenceNo || null
      updateData.payment_date = paymentDate
      // Set commission amount to just this payment's pending commission (not accumulated total)
      if (paymentData?.pending_commission) {
        updateData.commission_amount = paymentData.pending_commission
      }
    } else {
      updateData.commission_paid = false
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

    // Also update affiliate_referrals.commission_status to 'paid' if marking as paid
    if (commissionPaid && (paymentData?.referral_id || data?.referral_id)) {
      const refId = paymentData?.referral_id || data?.referral_id
      await supabase
        .from('affiliate_referrals')
        .update({ commission_status: 'paid' })
        .eq('id', refId)
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

// Delete affiliate payments
export async function DELETE(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await req.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment IDs are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Separate synthetic IDs (email-match- or commission- prefixed) from real DB IDs
    const realIds: string[] = []
    const syntheticReferralIds: string[] = []

    ids.forEach((id: string) => {
      if (id.startsWith('email-match-')) {
        syntheticReferralIds.push(id.replace('email-match-', ''))
      } else if (id.startsWith('commission-')) {
        syntheticReferralIds.push(id.replace('commission-', ''))
      } else {
        realIds.push(id)
      }
    })

    let deletedCount = 0
    const referralIdsToClear: string[] = [...syntheticReferralIds]

    if (realIds.length > 0) {
      // Get referral_ids from real records before deleting, so we can clear commission on affiliate_referrals
      const { data: recordsToDelete } = await supabase
        .from('affiliate_referral_payments')
        .select('id, referral_id')
        .in('id', realIds)

      if (recordsToDelete) {
        recordsToDelete.forEach(r => {
          if (r.referral_id) {
            referralIdsToClear.push(r.referral_id)
          }
        })
      }

      const { error, count } = await supabase
        .from('affiliate_referral_payments')
        .delete()
        .in('id', realIds)

      if (error) {
        logger.error('Failed to delete affiliate payments', { error, ids: realIds })
        return NextResponse.json(
          { success: false, error: `Failed to delete payments: ${error.message}` },
          { status: 500 }
        )
      }

      deletedCount = count || realIds.length
    }

    // Clear commission_amount and commission_status on affiliate_referrals so entries don't reappear
    if (referralIdsToClear.length > 0) {
      const { error: clearError } = await supabase
        .from('affiliate_referrals')
        .update({ commission_amount: 0, commission_status: null })
        .in('id', referralIdsToClear)

      if (clearError) {
        logger.error('Failed to clear commission on affiliate_referrals', { error: clearError })
      }
    }

    const totalDeleted = deletedCount + syntheticReferralIds.length

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      message: `Successfully deleted ${totalDeleted} payment(s).`
    })

  } catch (error) {
    logger.error('Error deleting affiliate payments', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
