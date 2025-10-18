/**
 * API Route: Sync Payment Status from Razorpay
 * POST - Fetch real-time payment status from Razorpay and update database
 */

import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import jwt from 'jsonwebtoken'

// Admin authentication check
function verifyAdminAuth(req: NextRequest): boolean {
  try {
    const authHeader = req.headers.get('authorization')
    const adminToken = authHeader?.replace('Bearer ', '')

    logger.info('Auth check', {
      hasAuthHeader: !!authHeader,
      hasToken: !!adminToken,
      tokenLength: adminToken?.length,
      hasSecret: !!process.env.NEXTAUTH_SECRET
    })

    if (!adminToken || !process.env.NEXTAUTH_SECRET) {
      logger.warn('Missing token or secret')
      return false
    }

    // Verify JWT token
    const decoded = jwt.verify(adminToken, process.env.NEXTAUTH_SECRET) as { role?: string }

    logger.info('JWT verified', { role: decoded.role })

    // Check if token has admin role
    return decoded.role === 'admin'
  } catch (error) {
    logger.error('Admin auth verification failed', error)
    return false
  }
}

// Helper function to update affiliate referrals
async function updateAffiliateReferrals(supabase: ReturnType<typeof createAdminClient>, order_id: string, dbStatus: string, paymentAmount?: number) {
  try {
    const { data: referrals } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('order_id', order_id)

    if (referrals && referrals.length > 0) {
      // Map Razorpay payment status to referral status
      const referralStatus = dbStatus === 'captured' ? 'completed' : dbStatus === 'failed' ? 'failed' : 'pending'

      // Get payment details to update payment_amount
      const { data: paymentData } = await supabase
        .from('payments')
        .select('amount')
        .eq('order_id', order_id)
        .single()

      const updateData: Record<string, unknown> = {
        status: referralStatus,
        updated_at: new Date().toISOString(),
        converted_at: dbStatus === 'captured' ? new Date().toISOString() : null
      }

      // Update payment_amount with total amount (including GST)
      if (paymentData?.amount || paymentAmount) {
        updateData.payment_amount = paymentData?.amount || paymentAmount
      }

      const { error } = await supabase
        .from('affiliate_referrals')
        .update(updateData)
        .eq('order_id', order_id)

      if (error) {
        logger.error('Failed to update affiliate referrals', { order_id, error })
      } else {
        logger.info('Updated affiliate referral status and payment', {
          order_id,
          count: referrals.length,
          status: referralStatus,
          payment_amount: updateData.payment_amount
        })
      }
    }
  } catch (error) {
    logger.error('Error updating affiliate referrals', { order_id, error })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    if (!verifyAdminAuth(req)) {
      logger.warn('Unauthorized sync attempt')
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    if (!razorpay) {
      logger.error('Razorpay not configured')
      return NextResponse.json(
        { error: 'Razorpay not configured. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { payment_id, order_id } = body

    logger.info('Sync status request received', { payment_id, order_id })

    if (!payment_id && !order_id) {
      return NextResponse.json(
        { error: 'Either payment_id or order_id is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Strategy: Always try to use order_id first since it's always present
    // Then fall back to payment_id if order_id is not available

    let razorpayPaymentData = null
    let effectiveOrderId = order_id

    // If we have payment_id, fetch payment details from Razorpay
    if (payment_id) {
      try {
        logger.info('Fetching payment from Razorpay by payment_id', { payment_id })
        const razorpayPayment = await razorpay.payments.fetch(payment_id)
        razorpayPaymentData = razorpayPayment
        effectiveOrderId = razorpayPayment.order_id || order_id

        logger.info('Fetched payment status from Razorpay', {
          payment_id,
          order_id: effectiveOrderId,
          razorpay_status: razorpayPayment.status,
          amount: razorpayPayment.amount,
          method: razorpayPayment.method
        })
      } catch (razorpayError: unknown) {
        const error = razorpayError as { statusCode?: number; error?: { description?: string } }
        logger.error('Razorpay API error fetching payment', { payment_id, error: razorpayError })
        return NextResponse.json(
          {
            error: 'Failed to fetch payment from Razorpay',
            details: error.error?.description || 'Payment not found or API error'
          },
          { status: error.statusCode || 500 }
        )
      }
    }

    // If we only have order_id or payment fetch failed, try fetching order
    if (!razorpayPaymentData && effectiveOrderId) {
      try {
        logger.info('Fetching order from Razorpay by order_id', { order_id: effectiveOrderId })
        const razorpayOrder = await razorpay.orders.fetch(effectiveOrderId)

        logger.info('Fetched order status from Razorpay', {
          order_id: effectiveOrderId,
          razorpay_status: razorpayOrder.status,
          amount: razorpayOrder.amount
        })

        // For orders with 'paid' status, we need to fetch the actual payment to get payment status
        // Otherwise, map order status to payment status equivalents
        let dbStatus = 'created' // Default to 'created' (Razorpay payment status)
        if (razorpayOrder.status === 'paid') {
          // When order is paid, the payment is captured
          dbStatus = 'captured'
        } else if (razorpayOrder.status === 'attempted') {
          // Order attempted but not completed yet
          dbStatus = 'created'
        } else if (razorpayOrder.status === 'created') {
          dbStatus = 'created'
        }

        // Update payment in database by order_id
        logger.info('Updating payment in database', { order_id: effectiveOrderId, status: dbStatus })
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            status: dbStatus,
            payment_id: payment_id || undefined, // Update payment_id if provided
            updated_at: new Date().toISOString()
          })
          .eq('order_id', effectiveOrderId)
          .select()
          .single()

        if (updateError) {
          logger.error('Failed to update payment in database', { order_id: effectiveOrderId, error: updateError })
          return NextResponse.json(
            { error: 'Payment not found in database', details: updateError.message },
            { status: 404 }
          )
        }

        logger.info('Payment updated successfully', { payment_id: updatedPayment.id, new_status: dbStatus })

        // Update affiliate referrals if applicable (pass payment amount)
        await updateAffiliateReferrals(supabase, effectiveOrderId, dbStatus, updatedPayment.amount)

        return NextResponse.json({
          success: true,
          message: 'Payment status synced successfully from order',
          data: {
            payment: updatedPayment,
            razorpay_status: razorpayOrder.status,
            db_status: dbStatus
          }
        })
      } catch (razorpayError: unknown) {
        const error = razorpayError as { statusCode?: number; error?: { description?: string } }
        logger.error('Razorpay API error fetching order', { order_id: effectiveOrderId, error: razorpayError })
        return NextResponse.json(
          {
            error: 'Failed to fetch order from Razorpay',
            details: error.error?.description || 'Order not found or API error'
          },
          { status: error.statusCode || 500 }
        )
      }
    }

    // If we have payment data from Razorpay, process it
    if (razorpayPaymentData) {
      // Use actual Razorpay payment status directly (no mapping needed)
      const dbStatus = razorpayPaymentData.status // Razorpay statuses: created, authorized, captured, failed, refunded

      // Update payment in database - ALWAYS use order_id as the primary lookup
      logger.info('Updating payment in database by order_id', { order_id: effectiveOrderId, status: dbStatus })
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: dbStatus,
          payment_id: payment_id, // Always update payment_id
          updated_at: new Date().toISOString()
        })
        .eq('order_id', effectiveOrderId)
        .select()
        .single()

      if (updateError) {
        logger.error('Failed to update payment in database', {
          order_id: effectiveOrderId,
          payment_id,
          error: updateError
        })
        return NextResponse.json(
          { error: 'Payment not found in database', details: updateError.message },
          { status: 404 }
        )
      }

      logger.info('Payment updated successfully', {
        payment_db_id: updatedPayment.id,
        order_id: effectiveOrderId,
        payment_id,
        new_status: dbStatus
      })

      // Update affiliate referrals if applicable (pass payment amount from Razorpay)
      const razorpayAmountInRupees = razorpayPaymentData.amount / 100 // Convert paise to rupees
      await updateAffiliateReferrals(supabase, effectiveOrderId, dbStatus, razorpayAmountInRupees)

      return NextResponse.json({
        success: true,
        message: 'Payment status synced successfully from payment',
        data: {
          payment: updatedPayment,
          razorpay_status: razorpayPaymentData.status,
          db_status: dbStatus,
          razorpay_details: {
            method: razorpayPaymentData.method,
            amount: razorpayPaymentData.amount / 100, // Convert paise to rupees
            currency: razorpayPaymentData.currency,
            created_at: new Date(razorpayPaymentData.created_at * 1000).toISOString()
          }
        }
      })
    }

    return NextResponse.json(
      { error: 'Unable to sync payment status' },
      { status: 400 }
    )

  } catch (error) {
    logger.error('Payment status sync error', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
