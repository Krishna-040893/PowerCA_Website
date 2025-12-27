import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

interface PaymentOrder {
  order_id: string
  payment_id: string | null
  amount: number
  status: string
  discount_percentage: number
  discount_amount: number
  address_id: string | null
}

interface Referral {
  id: string
  customer_id: string
  referred_email: string
  referred_name: string
  referred_phone: string
  status: string
  created_at: string
  converted_at: string | null
  payment_amount: number | null
  total_payment_amount: number | null
  order_id: string | null
  payment_id: string | null
  referral_code: string
  affiliate_id: string
  payment_count: number
  payments: PaymentOrder[]
}

interface AffiliateGroup {
  affiliate_id: string
  affiliate_name: string
  affiliate_email: string
  affiliate_company: string
  referral_code: string
  referrals: Referral[]
  stats: {
    total: number
    pending: number
    completed: number
    converted: number
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = req.nextUrl.searchParams
    const affiliateId = searchParams.get('affiliateId')

    // First, get all affiliate registrations to use as a lookup
    const { data: affiliateRegs, error: regError } = await supabase
      .from('affiliate_registrations')
      .select('affiliate_id, full_name, email, company_name, referral_code')

    if (regError) {
      logger.error('Failed to fetch affiliate registrations', regError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch affiliate data' },
        { status: 500 }
      )
    }

    // Create a lookup map by affiliate_id
    const affiliateMap = new Map<string, Record<string, unknown>>()
    affiliateRegs?.forEach((reg: Record<string, unknown>) => {
      if (reg.affiliate_id) {
        affiliateMap.set(reg.affiliate_id as string, reg)
      }
    })

    // Get all affiliate referrals
    let query = supabase
      .from('affiliate_referrals')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by specific affiliate if provided
    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data: referrals, error } = await query

    if (error) {
      logger.error('Failed to fetch affiliate referrals', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch referrals' },
        { status: 500 }
      )
    }

    // Get ALL payment orders with status 'paid' to check actual payment status
    // We need ALL paid orders, not just those with referral_code, because customers
    // might pay without using the referral link
    const { data: paymentOrders } = await supabase
      .from('payment_orders')
      .select('order_id, customer_id, referral_code, status, amount, customer_email, discount_percentage, discount_amount, original_amount, address_id')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    // Create maps for looking up payment orders
    // Map 1: customer_id + referral_code -> array of payment orders (for multiple address purchases)
    const paymentOrderMap = new Map<string, Record<string, unknown>[]>()
    // Map 2: email + referral_code -> array of payment orders (fallback for referral-linked payments)
    const paymentOrderByEmailMap = new Map<string, Record<string, unknown>[]>()
    // Map 3: email only -> array of payment orders (for payments made without referral link)
    const paymentOrderByEmailOnlyMap = new Map<string, Record<string, unknown>[]>()

    paymentOrders?.forEach((order) => {
      if (order.customer_id && order.referral_code) {
        const key = `${order.customer_id}_${order.referral_code}`
        if (!paymentOrderMap.has(key)) {
          paymentOrderMap.set(key, [])
        }
        paymentOrderMap.get(key)!.push(order)
      }
      // Also index by email + referral_code for fallback lookup
      if (order.customer_email && order.referral_code) {
        const emailKey = `${order.customer_email.toLowerCase()}_${order.referral_code}`
        if (!paymentOrderByEmailMap.has(emailKey)) {
          paymentOrderByEmailMap.set(emailKey, [])
        }
        paymentOrderByEmailMap.get(emailKey)!.push(order)
      }
      // Index by email only (for payments made without referral link)
      if (order.customer_email) {
        const emailOnlyKey = order.customer_email.toLowerCase()
        if (!paymentOrderByEmailOnlyMap.has(emailOnlyKey)) {
          paymentOrderByEmailOnlyMap.set(emailOnlyKey, [])
        }
        paymentOrderByEmailOnlyMap.get(emailOnlyKey)!.push(order)
      }
    })

    // FALLBACK: Also get payments from the 'payments' table since payment_orders may be empty
    // The 'payments' table stores successful payments with email from payment verification
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    // Track which order_ids we've already added to avoid duplicates
    const addedOrderIds = new Set<string>()

    // First, collect all order_ids from payment_orders
    paymentOrderByEmailOnlyMap.forEach((orders) => {
      orders.forEach((order) => {
        if (order.order_id) {
          addedOrderIds.add(order.order_id as string)
        }
      })
    })

    // Index payments by email (case-insensitive)
    // Only add if not already present from payment_orders (deduplicate by order_id)
    paymentsData?.forEach((payment) => {
      // Skip if this order_id already exists from payment_orders
      if (payment.order_id && addedOrderIds.has(payment.order_id)) {
        return
      }

      // The payments table stores successful payments - if a record exists, it means payment was made
      if (payment.email) {
        const emailOnlyKey = payment.email.toLowerCase()
        if (!paymentOrderByEmailOnlyMap.has(emailOnlyKey)) {
          paymentOrderByEmailOnlyMap.set(emailOnlyKey, [])
        }
        // Convert payments table format to payment_orders format
        paymentOrderByEmailOnlyMap.get(emailOnlyKey)!.push({
          order_id: payment.order_id,
          customer_email: payment.email,
          status: 'paid', // Treat all records in payments table as paid
          amount: payment.amount,
          payment_id: payment.id,
          customer_id: null,
          referral_code: null,
          discount_percentage: 0,
          discount_amount: 0,
          original_amount: payment.amount,
          address_id: null
        })

        // Mark this order_id as added
        if (payment.order_id) {
          addedOrderIds.add(payment.order_id)
        }
      }
    })

    // Get affiliate_referral_payments for additional payment info
    const { data: referralPayments } = await supabase
      .from('affiliate_referral_payments')
      .select('referral_id, payment_id, order_id, payment_status, payment_amount, customer_id')

    // Create a map of referral_id -> payment info
    const referralPaymentMap = new Map<string, Record<string, unknown>>()
    referralPayments?.forEach((payment) => {
      if (payment.referral_id) {
        referralPaymentMap.set(payment.referral_id, payment)
      }
    })

    // Group referrals by affiliate
    const groupedByAffiliate: Record<string, AffiliateGroup> = {}

    referrals?.forEach((referral: Record<string, unknown>) => {
      const affId = referral.affiliate_id as string
      const customerId = referral.customer_id as string
      const referralCode = referral.referral_code as string
      const referralId = referral.id as string

      // Get affiliate details from the map
      const affiliateInfo = affiliateMap.get(affId) || {}

      // Check payment status from payment_orders (now returns array for multiple address purchases)
      const paymentOrderKey = `${customerId}_${referralCode}`
      let paymentOrdersList = paymentOrderMap.get(paymentOrderKey)

      // Fallback 1: try email + referral_code lookup if customer_id lookup fails
      const referredEmail = referral.referred_email as string
      if ((!paymentOrdersList || paymentOrdersList.length === 0) && referredEmail) {
        const emailKey = `${referredEmail.toLowerCase()}_${referralCode}`
        paymentOrdersList = paymentOrderByEmailMap.get(emailKey)
      }

      // Fallback 2: try email-only lookup (for payments made without referral link)
      // This catches cases where the customer paid without using the ?ref=XXX&cus=YYY link
      if ((!paymentOrdersList || paymentOrdersList.length === 0) && referredEmail) {
        const emailOnlyKey = referredEmail.toLowerCase()
        paymentOrdersList = paymentOrderByEmailOnlyMap.get(emailOnlyKey)
      }

      // Check affiliate_referral_payments
      const referralPayment = referralPaymentMap.get(referralId)

      // Determine actual status based on payments
      let actualStatus = referral.status as string
      let paymentAmount: number | null = referral.payment_amount as number | null
      let totalPaymentAmount: number | null = null
      let orderId: string | null = referral.order_id as string | null
      let paymentId: string | null = referral.payment_id as string | null
      let paymentCount = 0
      const payments: PaymentOrder[] = []

      // Priority: affiliate_referral_payments > payment_orders > affiliate_referrals
      if (referralPayment) {
        if (referralPayment.payment_status === 'completed') {
          actualStatus = 'completed'
        }
        paymentAmount = referralPayment.payment_amount as number | null
        orderId = referralPayment.order_id as string | null
        paymentId = referralPayment.payment_id as string | null
      }

      // Process all payment orders (for multiple address purchases)
      if (paymentOrdersList && paymentOrdersList.length > 0) {
        const paidOrders = paymentOrdersList.filter(o => o.status === 'paid')

        if (paidOrders.length > 0) {
          actualStatus = 'completed'
          paymentCount = paidOrders.length

          // Sum up all paid amounts
          totalPaymentAmount = paidOrders.reduce((sum, o) => sum + (o.amount as number || 0), 0)

          // Use the first paid order for backward compatibility
          if (!paymentAmount) {
            paymentAmount = paidOrders[0].amount as number | null
          }
          if (!orderId) {
            orderId = paidOrders[0].order_id as string | null
          }
          if (!paymentId) {
            paymentId = paidOrders[0].payment_id as string | null
          }

          // Build array of all payments for detailed view
          paidOrders.forEach(o => {
            payments.push({
              order_id: o.order_id as string,
              payment_id: o.payment_id as string | null,
              amount: o.amount as number,
              status: o.status as string,
              discount_percentage: o.discount_percentage as number || 0,
              discount_amount: o.discount_amount as number || 0,
              address_id: o.address_id as string | null
            })
          })
        }
      }

      if (!groupedByAffiliate[affId]) {
        groupedByAffiliate[affId] = {
          affiliate_id: affId,
          affiliate_name: (affiliateInfo.full_name as string) || 'Unknown',
          affiliate_email: (affiliateInfo.email as string) || '',
          affiliate_company: (affiliateInfo.company_name as string) || '',
          referral_code: referralCode || '',
          referrals: [],
          stats: {
            total: 0,
            pending: 0,
            completed: 0,
            converted: 0,
          }
        }
      }

      // Build enriched referral object
      const enrichedReferral: Referral = {
        id: referralId,
        customer_id: customerId,
        referred_email: referral.referred_email as string,
        referred_name: referral.referred_name as string,
        referred_phone: referral.referred_phone as string,
        status: actualStatus,
        created_at: referral.created_at as string,
        converted_at: referral.converted_at as string | null,
        payment_amount: paymentAmount,
        total_payment_amount: totalPaymentAmount,
        order_id: orderId,
        payment_id: paymentId,
        referral_code: referralCode,
        affiliate_id: affId,
        payment_count: paymentCount,
        payments: payments
      }

      groupedByAffiliate[affId].referrals.push(enrichedReferral)
      groupedByAffiliate[affId].stats.total++

      // Use actual status for stats
      if (actualStatus === 'pending') groupedByAffiliate[affId].stats.pending++
      if (actualStatus === 'completed') groupedByAffiliate[affId].stats.completed++
      if (actualStatus === 'converted') groupedByAffiliate[affId].stats.converted++
    })

    const result = Object.values(groupedByAffiliate)

    return NextResponse.json({
      success: true,
      data: result,
      totalReferrals: referrals?.length || 0
    })

  } catch (error) {
    logger.error('Error in affiliate referrals API', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verify admin authentication using NextAuth session
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await req.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No referral IDs provided' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Delete referrals by IDs
    const { error } = await supabase
      .from('affiliate_referrals')
      .delete()
      .in('id', ids)

    if (error) {
      logger.error('Failed to delete affiliate referrals', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete referrals' },
        { status: 500 }
      )
    }

    logger.info(`Admin ${session.user?.id || 'unknown'} deleted ${ids.length} affiliate referral(s)`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} referral(s)`
    })

  } catch (error) {
    logger.error('Error deleting affiliate referrals', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
