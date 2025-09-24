import { NextRequest, NextResponse } from 'next/server'
const Razorpay = require('razorpay')
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    console.log('Creating payment order...')
    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing')
    console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing')

    // Initialize Razorpay with live credentials
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const body = await req.json()
    console.log('Request body:', body)

    const {
      amount = 100, // Default ₹1 for testing (change to actual amount in production)
      productId = 'powerca_implementation',
      planId,
      affiliateCode,
      customerDetails
    } = body

    console.log('Processing payment for:', { amount, productId: productId || planId, affiliateCode })

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `PCA_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        productId,
        customerName: customerDetails?.name || '',
        customerEmail: customerDetails?.email || '',
        customerPhone: customerDetails?.phone || '',
        company: customerDetails?.company || '',
        gst: customerDetails?.gst || '',
      }
    }

    const order = await razorpay.orders.create(options)

    // Store order details in database for tracking (optional)
    try {
      if (customerDetails?.email) {
        const supabase = createAdminClient()

        // Store pending order
        const { error } = await supabase
          .from('payment_orders')
          .insert({
            order_id: order.id,
            amount: amount / 100, // Convert to rupees for storage
            currency: 'INR',
            status: 'created',
            customer_email: customerDetails.email,
            customer_name: customerDetails.name,
            customer_phone: customerDetails.phone,
            company: customerDetails.company,
            gst_number: customerDetails.gst,
            product_id: productId || planId,
          })

        if (error) {
          console.error('Error storing order (non-critical):', error)
          // Continue even if DB save fails - this is not critical
        }
      }
    } catch (dbError) {
      console.log('Database storage skipped:', dbError)
      // Continue without database storage
    }

    console.log('Order created successfully:', order.id)

    return NextResponse.json({
      success: true,
      id: order.id,  // Razorpay expects 'id' not 'orderId'
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create payment order',
        message: error.message
      },
      { status: 500 }
    )
  }
}