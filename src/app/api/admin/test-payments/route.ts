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

    // Fetch test payments (identified by TEST_ prefix in order_id)
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .or('order_id.ilike.TEST_ORDER_%,order_id.ilike.test_%')
      .order('created_at', { ascending: false })
      .limit(100)

    if (paymentsError) {
      console.error('Error fetching test payments:', paymentsError)
      return NextResponse.json({
        payments: [],
        referrals: []
      })
    }

    // Format payments for display
    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      orderId: payment.order_id,
      paymentId: payment.payment_id,
      customerName: payment.name || 'N/A',
      customerEmail: payment.email || 'N/A',
      amount: payment.amount || 0,
      status: payment.status || 'pending',
      invoiceNumber: payment.invoice_number,
      createdAt: payment.created_at
    })) || []

    // Fetch test referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('payment_referrals')
      .select(`
        *,
        affiliate_profiles (
          referral_code,
          firm_name
        )
      `)
      .or('payment_id.ilike.TEST_%,payment_id.ilike.test_%')
      .order('created_at', { ascending: false })
      .limit(100)

    if (referralsError) {
      console.error('Error fetching test referrals:', referralsError)
    }

    const formattedReferrals = referrals?.map(referral => ({
      id: referral.id,
      affiliateCode: referral.affiliate_profiles?.referral_code || 'N/A',
      customerEmail: referral.customer_email || 'N/A',
      status: 'converted',
      createdAt: referral.created_at
    })) || []

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      referrals: formattedReferrals
    })

  } catch (error) {
    console.error('Error fetching test data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test data',
        payments: [],
        referrals: []
      },
      { status: 500 }
    )
  }
}