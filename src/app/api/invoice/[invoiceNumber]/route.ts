import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: { invoiceNumber: string } }
) {
  try {
    const { invoiceNumber } = params

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

    return NextResponse.json({
      success: true,
      data: invoice
    })

  } catch (error) {
    logger.error('Error fetching invoice', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
