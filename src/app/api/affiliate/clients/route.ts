import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = session.user.role
    if (userRole !== 'affiliate' && userRole !== 'Affiliate') {
      return NextResponse.json(
        { error: 'Access denied. Only affiliates can access this endpoint.' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Get the affiliate's referral_code from affiliate_registrations
    const { data: affiliateData, error: affiliateError } = await supabase
      .from('affiliate_registrations')
      .select('referral_code')
      .eq('email', session.user.email)
      .single()

    if (affiliateError || !affiliateData?.referral_code) {
      return NextResponse.json({
        success: true,
        clients: []
      })
    }

    const referralCode = affiliateData.referral_code

    // Fetch affiliate_referrals matching that referral_code
    const { data: referrals } = await supabase
      .from('affiliate_referrals')
      .select('id, referred_email, referred_name, referred_phone, customer_id, created_at')
      .eq('referral_code', referralCode)

    if (!referrals || referrals.length === 0) {
      return NextResponse.json({
        success: true,
        clients: []
      })
    }

    // Get referred emails to look up their payments
    const referredEmails = referrals
      .map(r => r.referred_email?.toLowerCase())
      .filter(Boolean) as string[]

    // Fetch payment_orders for referred customers (source of truth for firm_name, plan_type)
    const { data: paymentOrders } = await supabase
      .from('payment_orders')
      .select('*')
      .in('customer_email', referredEmails)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    // Fetch affiliate_referral_payments to determine commission status per order
    const referralIds = referrals.map(r => r.id)
    const { data: referralPayments } = await supabase
      .from('affiliate_referral_payments')
      .select('referral_id, commission_paid, commission_paid_at, created_at')
      .in('referral_id', referralIds)

    // Build per-referral: last commission paid date & last commission set date
    const lastPaidDateByReferral = new Map<string, Date>()
    const lastSetDateByReferral = new Map<string, Date>()
    referralPayments?.forEach(p => {
      const rid = p.referral_id
      if (p.commission_paid && p.commission_paid_at) {
        const d = new Date(p.commission_paid_at)
        const existing = lastPaidDateByReferral.get(rid)
        if (!existing || d > existing) lastPaidDateByReferral.set(rid, d)
      }
      if (p.created_at) {
        const d = new Date(p.created_at)
        const existing = lastSetDateByReferral.get(rid)
        if (!existing || d > existing) lastSetDateByReferral.set(rid, d)
      }
    })

    // Build client list: one row per order (not per referral) for correct firm_name & plan_type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clients: any[] = []

    referrals.forEach(referral => {
      const email = referral.referred_email?.toLowerCase()
      const customerOrders = paymentOrders?.filter(
        po => po.customer_email?.toLowerCase() === email
      ) || []

      const lastPaidDate = lastPaidDateByReferral.get(referral.id) || null
      const lastSetDate = lastSetDateByReferral.get(referral.id) || null

      if (customerOrders.length === 0) {
        // No orders yet — show as pending
        clients.push({
          customerName: referral.referred_name || referral.referred_email,
          customerEmail: referral.referred_email,
          firmName: '',
          planType: null,
          purchaseDate: null,
          renewalDate: null,
          status: 'pending',
          commissionStatus: 'pending',
          totalPayments: 0,
        })
      } else {
        // One row per order
        customerOrders.forEach(order => {
          const planType = order.plan_type || 'annual'
          const paidAt = order.created_at || null

          let renewalDate: string | null = null
          if (paidAt && planType === 'annual') {
            const d = new Date(paidAt)
            d.setFullYear(d.getFullYear() + 1)
            renewalDate = d.toISOString()
          }

          // Determine commission status for this order using date boundaries
          let commissionStatus = 'pending'
          if (paidAt) {
            const orderDate = new Date(paidAt)
            if (lastPaidDate && orderDate <= lastPaidDate) {
              commissionStatus = 'paid'
            } else if (lastSetDate && orderDate <= lastSetDate) {
              commissionStatus = 'processing'
            }
          }

          clients.push({
            customerName: referral.referred_name || referral.referred_email,
            customerEmail: referral.referred_email,
            firmName: order.firm_name || order.company || '',
            planType,
            purchaseDate: paidAt,
            renewalDate,
            status: 'paid',
            commissionStatus,
            totalPayments: customerOrders.length,
          })
        })
      }
    })

    return NextResponse.json({
      success: true,
      clients
    })

  } catch (error) {
    logger.error('Error fetching affiliate clients', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}
