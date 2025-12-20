import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'
import { generateAppDownloadInvoicePDF } from '@/lib/app-download-invoice'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const paymentId = searchParams.get('paymentId')

    if (!token && !paymentId) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Token or Payment ID is required'
      )
    }

    const supabase = createAdminClient()

    // Look up payment by success_token or payment_id
    let query = supabase
      .from('app_download_payments')
      .select('*')

    if (token) {
      query = query.eq('success_token', token)
    } else if (paymentId) {
      query = query.eq('payment_id', paymentId)
    }

    const { data: payment, error } = await query.single()

    if (error || !payment) {
      logger.warn('Invoice request with invalid token/paymentId', {
        token: token?.substring(0, 8) + '...',
        paymentId
      })
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Payment not found'
      )
    }

    // Generate invoice PDF
    const pdfBytes = await generateAppDownloadInvoicePDF({
      invoiceNumber: `PCA-DL-${payment.order_id.replace('order_', '')}`,
      invoiceDate: new Date(payment.created_at),
      customerName: payment.name,
      customerEmail: payment.email,
      customerPhone: payment.phone,
      orderId: payment.order_id,
      paymentId: payment.payment_id,
      productName: payment.product_name,
      amount: payment.amount,
      currency: payment.currency || 'INR'
    })

    // Return PDF as download - convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes)
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PowerCA_Invoice_Demo_Version.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    logger.error('Failed to generate invoice PDF', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      'Failed to generate invoice'
    )
  }
}
