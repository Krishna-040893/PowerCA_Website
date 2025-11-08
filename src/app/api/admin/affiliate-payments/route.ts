import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const supabase = createAdminClient()
    const searchParams = req.nextUrl.searchParams
    const affiliateId = searchParams.get('affiliateId')
    const status = searchParams.get('status')

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

    const { data: payments, error } = await query

    if (error) {
      logger.error('Failed to fetch affiliate payments', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const summary = {
      totalPayments: payments?.length || 0,
      totalAmount: payments?.reduce((sum, p) => sum + (Number(p.payment_amount) || 0), 0) || 0,
      totalCommission: payments?.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0) || 0,
      pendingCommission: payments?.filter(p => !p.commission_paid).reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0) || 0,
      paidCommission: payments?.filter(p => p.commission_paid).reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0) || 0,
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
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
    const body = await req.json()
    const { paymentId, commissionPaid, paymentMode, paymentDate } = body

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
      logger.error('Failed to update commission status', error)
      console.error('Database error details:', error)
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
