import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType, handleConfigurationError, isServiceConfigured } from '@/lib/error-handler'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    logger.info('Creating app download payment order')

    // Check if Razorpay is configured
    if (!isServiceConfigured('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET')) {
      return handleConfigurationError('Payment gateway')
    }

    // Initialize Razorpay
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return handleConfigurationError('Razorpay credentials')
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Get user session - REQUIRED
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      logger.warn('Unauthenticated app download payment attempt blocked')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
            details: 'You must be logged in to make a payment. Please log in and try again.'
          }
        },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const body = await req.json()

    const {
      amount, // Amount in paise from frontend
      productId,
      productName,
      customerDetails
    } = body

    // Validate amount is provided
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    logger.info('Processing app download payment', {
      amount: amount / 100,
      productId,
      productName
    })

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `app_download_${Date.now()}`,
      payment_capture: 1,
      notes: {
        productId,
        productName,
        type: 'app_download',
        customerName: customerDetails?.name || session.user.name,
        customerEmail: customerDetails?.email || session.user.email,
        customerPhone: customerDetails?.phone || ''
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await razorpay.orders.create(options as any)

    logger.info('Razorpay app download order created', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })

    // Store order in database (tracks abandoned payments if user closes Razorpay popup)
    try {
      const { error } = await supabase
        .from('app_download_orders')
        .insert({
          order_id: order.id,
          amount: amount / 100,
          currency: 'INR',
          status: 'created',
          customer_email: customerDetails?.email || session.user.email,
          customer_name: customerDetails?.name || session.user.name,
          customer_phone: customerDetails?.phone,
          product_id: productId,
          product_name: productName,
          user_id: session.user.id
        })

      if (error) {
        logger.error('Error storing app download order (non-critical)', error)
      }
    } catch (dbError) {
      logger.debug('Database storage skipped', { error: dbError })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error) {
    logger.error('App download payment order creation failed', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })

    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}
