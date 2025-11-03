import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint to create a minimal Cashfree order
 * This helps verify the complete flow works end-to-end
 *
 * Usage: POST /api/test/cashfree-order
 * Body: { "amount": 1 } (optional, defaults to 1 INR for testing)
 */
export async function POST(req: NextRequest) {
  try {
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      return NextResponse.json({
        success: false,
        error: 'Cashfree credentials not configured',
      }, { status: 500 })
    }

    // Detect environment
    const environment = appId.toUpperCase().startsWith('TEST') ? 'sandbox' : 'production'
    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg'

    // Get test amount from body (default to 1 INR)
    const body = await req.json().catch(() => ({ amount: 1 }))
    const amount = body.amount || 1

    // Create minimal test order
    const orderId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'test_customer_' + Date.now(),
        customer_name: 'Test User',
        customer_email: 'test@powerca.in',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3009'}/payment-success?provider=cashfree&order_id={order_id}`,
      },
    }

    console.log('🧪 Testing Cashfree Order Creation:', {
      environment,
      baseUrl,
      orderId,
      amount
    })

    // Make API call
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(orderPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Cashfree Order Creation Failed:', data)
      return NextResponse.json({
        success: false,
        error: {
          status: response.status,
          message: data.message || 'Order creation failed',
          details: data,
        },
        environment,
        credentials: {
          appIdPrefix: appId.substring(0, 10) + '...',
          secretKeyPrefix: secretKey.substring(0, 15) + '...',
        }
      }, { status: response.status })
    }

    console.log('✅ Cashfree Order Created Successfully')

    return NextResponse.json({
      success: true,
      message: 'Test order created successfully',
      environment,
      orderId,
      paymentSessionId: data.payment_session_id,
      orderDetails: data,
      // Return this for frontend testing
      frontendTest: {
        message: 'You can now test the frontend with this payment session',
        code: `
// Paste this in browser console on checkout page:
const testCashfree = async () => {
  const cashfree = await window.Cashfree({ mode: '${environment}' });
  const result = await cashfree.checkout({
    paymentSessionId: '${data.payment_session_id}',
    redirectTarget: '_self'
  });
  console.log('Cashfree test result:', result);
};
testCashfree();
        `
      }
    })

  } catch (error) {
    console.error('Test order error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Also support GET for quick testing
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test Cashfree order creation',
    usage: 'POST /api/test/cashfree-order with body: { "amount": 1 }',
    example: 'curl -X POST http://localhost:3009/api/test/cashfree-order -H "Content-Type: application/json" -d \'{"amount": 1}\''
  })
}
