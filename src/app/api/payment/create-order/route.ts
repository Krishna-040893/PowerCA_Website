import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {createAdminClient  } from '@/lib/supabase/admin'
import {logger  } from '@/lib/logger'
import {createErrorResponse, ErrorType, handleConfigurationError, isServiceConfigured  } from '@/lib/error-handler'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    logger.info('Creating payment order')

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

    // Get user session - REQUIRED (no guest checkout)
    const session = await getServerSession(authOptions)

    // ✅ Enforce authentication - no guest checkout allowed
    if (!session || !session.user || !session.user.id) {
      logger.warn('Unauthenticated Razorpay payment attempt blocked')
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

    const body = await req.json()
    // Don't log sensitive payment details

    const {
      amount, // Amount in paise from frontend
      productId = 'powerca_implementation',
      planType = 'implementation',
      planId,
      affiliateCode,
      customerDetails,
      referralInfo, // New field for affiliate referral tracking
      // Extract address fields from body
      country,
      address,
      city,
      state,
      postcode,
      gstNo,
      addressId, // Address ID from user_addresses table
      // Discount fields for progressive pricing
      discountPercentage,
      discountAmount,
      originalAmount
    } = body

    // Validate amount is provided
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    logger.info('Processing payment', {
      amount: amount / 100, // Log in rupees, not paise
      productId: productId || planId,
      hasAffiliateCode: !!affiliateCode,
      hasReferralInfo: !!referralInfo,
      referralCode: referralInfo?.referralCode,
      customerId: referralInfo?.customerId
    })

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `powerca_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        productId,
        planType: planType || 'PowerCA Implementation',
        description: 'One-time implementation fee with first year free',
        customerName: customerDetails?.name || session.user.name || body.name,
        customerEmail: customerDetails?.email || session.user.email || body.email,
        customerPhone: customerDetails?.phone || body.phone || '',
        company: customerDetails?.company || body.company || '',
        gst: customerDetails?.gst || '',
        // Add referral information to notes
        referralCode: referralInfo?.referralCode || '',
        customerId: referralInfo?.customerId || '',
        isAffiliatePurchase: !!referralInfo?.referralCode
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.info('Creating Razorpay order with options', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt
    })

    const order = await razorpay.orders.create(options as any)

    logger.info('Razorpay order created successfully', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })

    // Store order details in database for tracking
    try {
      const customerEmail = customerDetails?.email || session.user.email || body.email
      const supabase = createAdminClient()

      // Store pending order
      const { error } = await supabase
        .from('payment_orders')
        .insert({
          order_id: order.id,
          amount: amount / 100, // Convert to rupees for storage
          currency: 'INR',
          status: 'created',
          customer_email: customerEmail,
          customer_name: customerDetails?.name || session.user.name || body.name,
          customer_phone: customerDetails?.phone || body.phone,
          company: customerDetails?.company || body.company,
          firm_name: customerDetails?.firmName || body.firmName,
          gst_number: customerDetails?.gst,
          product_id: productId || planId,
          user_id: session.user.id, // ✅ Always valid - auth check above ensures this exists
          // Add referral tracking
          referral_code: referralInfo?.referralCode || null,
          customer_id: referralInfo?.customerId || null,
          is_affiliate_purchase: !!referralInfo?.referralCode,
          // Add address fields
          customer_address: address || body.address,
          customer_city: city || body.city,
          customer_state: state || body.state,
          customer_postcode: postcode || body.postcode,
          customer_country: country || body.country,
          address_id: addressId || null,
          // Discount fields for progressive pricing
          discount_percentage: discountPercentage || 0,
          discount_amount: discountAmount || 0,
          original_amount: originalAmount || null
        })

      if (error) {
        logger.error('Error storing order (non-critical)', error)
        // Continue even if DB save fails - this is not critical
      }
    } catch (dbError) {
      logger.debug('Database storage skipped', { error: dbError })
      // Continue without database storage
    }

    logger.info('Order created successfully', { orderId: order.id })

    // Note: Razorpay Key ID is public and required by the frontend SDK
    // This is not a security risk as it's meant to be public
    return NextResponse.json({
      success: true,
      orderId: order.id, // Also provide orderId for compatibility
      id: order.id,  // Razorpay expects 'id' not 'orderId'
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // Public key, safe to expose
    })

  } catch (error) {
    // Log detailed error information
    logger.error('Razorpay payment order creation failed', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      // @ts-expect-error - Razorpay specific error properties
      errorCode: error?.error?.code,
      // @ts-expect-error - Razorpay specific error properties
      errorDescription: error?.error?.description,
      // @ts-expect-error - Razorpay specific error properties
      statusCode: error?.statusCode
    })

    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}