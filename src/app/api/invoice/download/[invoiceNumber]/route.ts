import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInvoicePDF, calculateGST } from '@/lib/invoice-generator'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch invoice from database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        payments (
          order_id,
          payment_id,
          name,
          email,
          phone,
          firm_name,
          company,
          address,
          gst_number,
          created_at
        )
      `)
      .eq('invoice_number', invoiceNumber)
      .single()

    if (invoiceError || !invoice) {
      logger.error('Invoice not found', { invoiceNumber, error: invoiceError })
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get payment details
    const payment = Array.isArray(invoice.payments) ? invoice.payments[0] : invoice.payments

    if (!payment) {
      logger.error('Payment details not found for invoice', { invoiceNumber })
      return NextResponse.json(
        { error: 'Payment details not found' },
        { status: 404 }
      )
    }

    // Calculate GST breakdown
    const baseAmount = invoice.amount
    const gstDetails = calculateGST(baseAmount, false) // Assuming intra-state

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: invoice.invoice_number,
      invoiceDate: new Date(invoice.issued_at),
      customerName: payment.name || 'Customer',
      customerEmail: payment.email,
      customerPhone: payment.phone,
      customerCompany: payment.firm_name || payment.company,
      customerAddress: payment.address,
      customerGSTN: payment.gst_number,
      orderId: payment.order_id,
      paymentId: payment.payment_id,
      paymentDate: new Date(payment.created_at),
      items: [{
        description: 'PowerCA Implementation - Complete setup with first year subscription FREE',
        quantity: 1,
        rate: baseAmount,
        amount: baseAmount,
      }],
      subtotal: baseAmount,
      ...gstDetails,
      grandTotal: invoice.total,
      isTestMode: invoiceNumber.includes('TEST'),
    }

    // Generate PDF using default HTML template
    logger.info('Generating invoice PDF', { invoiceNumber })
    const pdfBuffer = await generateInvoicePDF(invoiceData) // Use default template

    // Return PDF as download - Convert Buffer to Uint8Array for Next.js compatibility
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PowerCA-Invoice-${invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    logger.error('Error generating invoice PDF', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    )
  }
}
