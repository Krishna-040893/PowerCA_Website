import { NextRequest, NextResponse } from 'next/server'
import { razorpay, RazorpayOrderOptions } from '@/lib/razorpay'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 503 }
      )
    }

    // Get user session (optional - can allow guest checkout)
    const session = await getServerSession(authOptions)
    
    const body = await req.json()
    const { planType = 'implementation' } = body

    // PowerCA Implementation fee: ₹22,000
    const amount = 2200000 // Amount in paise (₹22,000 = 2,200,000 paise)
    
    const options: RazorpayOrderOptions = {
      amount,
      currency: 'INR',
      receipt: `powerca_${Date.now()}`,
      notes: {
        planType: 'PowerCA Implementation',
        description: 'One-time implementation fee with first year free',
        userEmail: session?.user?.email || body.email || 'guest',
        userName: session?.user?.name || body.name || 'Guest User',
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}