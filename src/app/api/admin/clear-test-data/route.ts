import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isTestMode } from '@/lib/payment-config'

export async function POST(req: NextRequest) {
  try {
    // Only allow in test mode
    if (!isTestMode()) {
      return NextResponse.json(
        { error: 'Test mode is not enabled' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Delete test payment referrals
    const { error: refError } = await supabase
      .from('payment_referrals')
      .delete()
      .or('payment_id.ilike.TEST_%,payment_id.ilike.test_%')

    if (refError) {
      console.error('Error clearing test referrals:', refError)
    }

    // Delete test payments
    const { error: payError } = await supabase
      .from('payments')
      .delete()
      .or('order_id.ilike.TEST_ORDER_%,order_id.ilike.test_%,payment_id.ilike.TEST_PAY_%,payment_id.ilike.test_%')

    if (payError) {
      console.error('Error clearing test payments:', payError)
    }

    // Delete test payment orders
    const { error: orderError } = await supabase
      .from('payment_orders')
      .delete()
      .or('order_id.ilike.TEST_ORDER_%,order_id.ilike.test_%')

    if (orderError) {
      console.error('Error clearing test orders:', orderError)
    }

    // Delete test invoices if they exist
    const { error: invoiceError } = await supabase
      .from('invoices')
      .delete()
      .or('invoice_number.ilike.TEST_%,invoice_number.ilike.test_%')

    if (invoiceError) {
      console.error('Error clearing test invoices:', invoiceError)
    }

    return NextResponse.json({
      success: true,
      message: 'Test data cleared successfully'
    })

  } catch (error: any) {
    console.error('Error clearing test data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear test data'
      },
      { status: 500 }
    )
  }
}