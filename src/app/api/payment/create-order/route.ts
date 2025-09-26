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

    // Get user session (optional - can allow guest checkout)
    const session = await getServerSession(authOptions)

    const body = await req.json()
    // Don't log sensitive payment details

    const {
      amount = 2200000, // Default ₹22,000 in paise
      productId = 'powerca_implementation',
      planType = 'implementation',
      planId,
      affiliateCode,
      customerDetails
    } = body

    logger.info('Processing payment', {
      amount: amount / 100, // Log in rupees, not paise
      productId: productId || planId,
      hasAffiliateCode: !!affiliateCode
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
        customerName: customerDetails?.name || session?.user?.name || body.name || 'Guest User',
        customerEmail: customerDetails?.email || session?.user?.email || body.email || 'guest',
        customerPhone: customerDetails?.phone || body.phone || '',
        company: customerDetails?.company || body.company || '',
        gst: customerDetails?.gst || '',
      }
    }

    const order = await razorpay.orders.create(options)

    // Store order details in database for tracking (optional)
    try {
      const customerEmail = customerDetails?.email || session?.user?.email || body.email
      if (customerEmail) {
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
            customer_name: customerDetails?.name || session?.user?.name || body.name,
            customer_phone: customerDetails?.phone || body.phone,
            company: customerDetails?.company || body.company,
            gst_number: customerDetails?.gst,
            product_id: productId || planId,
          })

        if (error) {
          logger.error('Error storing order (non-critical)', error)
          // Continue even if DB save fails - this is not critical
        }
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
    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}