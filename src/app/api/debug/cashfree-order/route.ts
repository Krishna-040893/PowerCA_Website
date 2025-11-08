import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Debug endpoint to check order details from Cashfree API
 * Usage: /api/debug/cashfree-order?orderId=POWERCA_xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId parameter required' }, { status: 400 })
    }

    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Cashfree credentials not configured' }, { status: 500 })
    }

    const environment = appId.toUpperCase().startsWith('TEST') ? 'sandbox' : 'production'
    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg'

    // Fetch order status
    const orderResponse = await fetch(`${baseUrl}/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    })

    const orderData = await orderResponse.json()

    // Fetch payment details
    const paymentsResponse = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    })

    const paymentsData = await paymentsResponse.json()

    // Check database
    const supabase = createAdminClient()
    const { data: dbOrder } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    const { data: dbPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    const { data: dbInvoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('payment_id', dbPayment?.id)
      .single()

    return NextResponse.json({
      debug: {
        environment,
        baseUrl,
        appIdPrefix: appId.substring(0, 10) + '...',
        orderId
      },
      cashfree: {
        order: orderData,
        payments: {
          raw: paymentsData,
          isArray: Array.isArray(paymentsData),
          type: typeof paymentsData,
          keys: paymentsData ? Object.keys(paymentsData) : []
        }
      },
      database: {
        order: dbOrder,
        payment: dbPayment,
        invoice: dbInvoice,
        hasOrder: !!dbOrder,
        hasPayment: !!dbPayment,
        hasInvoice: !!dbInvoice
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
