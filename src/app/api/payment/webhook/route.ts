import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/send-emails'
import { PaymentConfirmationEmail, PaymentConfirmationEmailText } from '@/lib/email-templates/payment-confirmation'
import { createInvoiceData, generateInvoiceHTML } from '@/lib/invoice-generator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Invalid webhook configuration' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    const supabase = createClient()

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity, supabase)
        break
        
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity, supabase)
        break
        
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, supabase)
        break
        
      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any, supabase: any) {
  const { order_id, id: payment_id, amount, email, contact, notes } = payment
  
  // Update payment record in database
  const { data: paymentRecord, error: updateError } = await supabase
    .from('payments')
    .update({
      payment_id,
      status: 'success',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', order_id)
    .select()
    .single()

  if (updateError) {
    console.error('Failed to update payment:', updateError)
    return
  }

  // Generate invoice
  const invoiceData = createInvoiceData({
    ...paymentRecord,
    paymentId: payment_id,
    orderId: order_id,
  })
  
  const invoiceHTML = generateInvoiceHTML(invoiceData)
  
  // Save invoice to database
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceData.invoiceNumber,
      payment_id: paymentRecord.id,
      amount: invoiceData.subtotal,
      gst: invoiceData.totalTax,
      total: invoiceData.grandTotal,
      status: 'paid',
    })
    .select()
    .single()

  if (invoiceError) {
    console.error('Failed to create invoice:', invoiceError)
  }

  // Send confirmation email with invoice
  try {
    await sendEmail({
      to: paymentRecord.email,
      subject: `Payment Confirmation - Invoice ${invoiceData.invoiceNumber}`,
      html: PaymentConfirmationEmail({
        name: paymentRecord.name || 'Customer',
        email: paymentRecord.email,
        amount: 22000,
        orderId: order_id,
        paymentId: payment_id,
        invoiceNumber: invoiceData.invoiceNumber,
        company: paymentRecord.company,
      }),
      text: PaymentConfirmationEmailText({
        name: paymentRecord.name || 'Customer',
        email: paymentRecord.email,
        amount: 22000,
        orderId: order_id,
        paymentId: payment_id,
        invoiceNumber: invoiceData.invoiceNumber,
        company: paymentRecord.company,
      }),
      attachments: [{
        filename: `Invoice-${invoiceData.invoiceNumber}.html`,
        content: invoiceHTML,
      }],
    })
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError)
  }
}

async function handlePaymentFailed(payment: any, supabase: any) {
  const { order_id } = payment
  
  // Update payment status to failed
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', order_id)

  if (error) {
    console.error('Failed to update payment status:', error)
  }
}

async function handleOrderPaid(order: any, supabase: any) {
  // Order fully paid - can trigger additional actions if needed
  console.log('Order paid:', order.id)
}