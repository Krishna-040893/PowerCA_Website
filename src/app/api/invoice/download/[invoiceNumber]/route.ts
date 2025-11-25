import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInvoicePDF, calculateGST } from '@/lib/invoice-generator'
import { downloadInvoiceFromStorage, uploadInvoiceToStorage } from '@/lib/invoice-storage'
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

    // Check if regeneration is requested
    const { searchParams } = new URL(request.url)
    const forceRegenerate = searchParams.get('regenerate') === 'true'

    // Step 1: Check if PDF exists in storage (fast path) - skip if regenerate requested
    if (!forceRegenerate) {
      logger.info('Checking storage for invoice', { invoiceNumber })
      const cachedPDF = await downloadInvoiceFromStorage(invoiceNumber)

      if (cachedPDF) {
        logger.info('Serving invoice from storage cache', { invoiceNumber })
        return new NextResponse(new Uint8Array(cachedPDF), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="PowerCA-Invoice-${invoiceNumber}.pdf"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    logger.info(forceRegenerate ? 'Force regenerating invoice PDF' : 'Invoice not in storage, generating new PDF', { invoiceNumber })

    // Step 2: Fetch invoice from database
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

    // Fetch discount information from payment_orders
    let discountInfo = {
      discountPercentage: 0,
      discountAmount: 0,
      originalAmount: 0
    }

    if (payment.order_id) {
      const { data: orderData } = await supabase
        .from('payment_orders')
        .select('discount_percentage, discount_amount, original_amount')
        .eq('order_id', payment.order_id)
        .single()

      if (orderData) {
        discountInfo = {
          discountPercentage: orderData.discount_percentage || 0,
          discountAmount: orderData.discount_amount || 0,
          originalAmount: orderData.original_amount || 0
        }
      }
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
      // Include discount information
      discountPercentage: discountInfo.discountPercentage,
      discountAmount: discountInfo.discountAmount,
      originalAmount: discountInfo.originalAmount,
    }

    // Step 3: Generate PDF using default HTML template
    logger.info('Generating invoice PDF', { invoiceNumber })
    const pdfBuffer = await generateInvoicePDF(invoiceData) // Use default template

    // Step 4: Upload to storage for future requests
    logger.info('Uploading generated invoice to storage', { invoiceNumber })
    await uploadInvoiceToStorage(invoiceNumber, pdfBuffer)

    // Step 5: Return PDF as download - Convert Buffer to Uint8Array for Next.js compatibility
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PowerCA-Invoice-${invoiceNumber}.pdf"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
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
