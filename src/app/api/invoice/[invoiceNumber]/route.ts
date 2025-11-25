import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params

    if (!invoiceNumber) {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch invoice data with payment details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        payment:payments(*)
      `)
      .eq('invoice_number', invoiceNumber)
      .single()

    if (error || !invoice) {
      logger.error('Invoice not found', { invoiceNumber, error })
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Normalize payment to single object (Supabase returns array from join)
    const payment = Array.isArray(invoice.payment) ? invoice.payment[0] : invoice.payment
    let discountInfo = null

    if (payment?.order_id) {
      const { data: orderData } = await supabase
        .from('payment_orders')
        .select('discount_percentage, discount_amount, original_amount')
        .eq('order_id', payment.order_id)
        .single()

      if (orderData) {
        discountInfo = {
          discount_percentage: orderData.discount_percentage || 0,
          discount_amount: orderData.discount_amount || 0,
          original_amount: orderData.original_amount || null
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        payment: payment, // Return as single object, not array
        discount_info: discountInfo
      }
    })

  } catch (error) {
    logger.error('Error fetching invoice', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
