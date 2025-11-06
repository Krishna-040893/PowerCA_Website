import {NextRequest, NextResponse  } from 'next/server'
import crypto from 'crypto'
import {createClient  } from '@/lib/supabase/server'
import {sendEmail  } from '@/lib/send-emails'
import {createInvoiceData, generateInvoiceHTML  } from '@/lib/invoice-generator'
import {SupabaseClient  } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

interface RazorpayPayment {
  order_id: string
  id: string
  amount: number
  email?: string
  contact?: string
  notes?: Record<string, unknown>
}

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  status: string
}

export async function POST(req: NextRequest) {
  try {
    logger.info('Razorpay webhook received')

    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      logger.security('Razorpay webhook - missing signature or secret')
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
      logger.security('Razorpay webhook - invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    logger.info('Processing Razorpay webhook event', {
      eventType: event.event,
      orderId: event.payload?.order?.id || event.payload?.payment?.entity?.order_id
    })

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
        logger.warn('Unhandled Razorpay webhook event', { eventType: event.event })
    }

    logger.info('Razorpay webhook processed successfully')
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    logger.error('Razorpay webhook processing failed', error)
    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}

async function handlePaymentCaptured(payment: RazorpayPayment, supabase: SupabaseClient) {
  const { order_id, id: payment_id, amount, email, contact } = payment

  // Check if payment already exists
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('payment_id', payment_id)
    .single()

  if (existingPayment) {
    logger.info('Payment already exists', { paymentId: payment_id })
    return
  }

  // Get order details from payment_orders table
  const { data: orderData } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('order_id', order_id)
    .single()

  // Calculate amounts
  const totalAmount = amount / 100 // Convert paise to rupees
  const paymentAmount = parseFloat((totalAmount / 1.18).toFixed(2))
  const _gstAmount = parseFloat((totalAmount - paymentAmount).toFixed(2))

  // Insert or update payment record
  const { data: paymentRecord, error: updateError } = await supabase
    .from('payments')
    .upsert({
      order_id,
      payment_id,
      signature: null, // Webhook payments don't have signature
      amount: totalAmount,
      currency: 'INR',
      status: 'captured', // Use actual Razorpay status
      plan: 'PowerCA Implementation',
      email: email || orderData?.customer_email || 'unknown@powerca.in',
      phone: contact || orderData?.customer_phone,
      name: orderData?.customer_name || 'Customer',
      company: orderData?.company,
      gst_number: orderData?.gst_number,
      firm_name: orderData?.firm_name,
      address: orderData?.address,
      payment_provider: 'razorpay',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'payment_id',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (updateError) {
    logger.error('Failed to upsert payment', updateError, { orderId: order_id, paymentId: payment_id })
    return
  }

  // Update payment_orders status to 'paid'
  await supabase
    .from('payment_orders')
    .update({ status: 'paid' })
    .eq('order_id', order_id)

  // Generate invoice
  const invoiceData = createInvoiceData({
    ...paymentRecord,
    paymentId: payment_id,
    orderId: order_id,
  })

  const invoiceHTML = generateInvoiceHTML(invoiceData)

  // Save invoice to database
  const { error: invoiceError } = await supabase
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
    logger.error('Failed to create invoice', invoiceError, { invoiceNumber: invoiceData.invoiceNumber })
  }

  // Send confirmation email with invoice
  try {
    await sendEmail({
      to: paymentRecord.email,
      subject: `Payment Confirmation - Invoice ${invoiceData.invoiceNumber}`,
      html: `
        <h2>Payment Confirmation</h2>
        <p>Dear ${paymentRecord.name || 'Customer'},</p>
        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Order ID: ${order_id}</li>
          <li>Payment ID: ${payment_id}</li>
          <li>Invoice Number: ${invoiceData.invoiceNumber}</li>
          <li>Amount: ₹22,000</li>
        </ul>
        <p>Your invoice is attached to this email.</p>
        <p>Best regards,<br>PowerCA Team</p>
      `,
      attachments: [{
        filename: `Invoice-${invoiceData.invoiceNumber}.html`,
        content: invoiceHTML,
      }],
    })
    logger.info('Payment confirmation email sent', {
      paymentId: payment_id,
      email: paymentRecord.email,
      invoiceNumber: invoiceData.invoiceNumber
    })
  } catch (emailError) {
    logger.error('Failed to send confirmation email', emailError, {
      paymentId: payment_id,
      email: paymentRecord.email
    })
  }
}

async function handlePaymentFailed(payment: RazorpayPayment, supabase: SupabaseClient) {
  const { order_id, id: payment_id, amount, email, contact } = payment

  logger.warn('Payment failed', {
    orderId: order_id,
    paymentId: payment_id,
    amount: amount / 100,
    email
  })

  // Insert or update failed payment record
  const { error } = await supabase
    .from('payments')
    .upsert({
      order_id,
      payment_id,
      amount: amount / 100,
      currency: 'INR',
      status: 'failed', // Use actual Razorpay status
      plan: 'PowerCA Implementation',
      email: email || 'unknown@powerca.in',
      phone: contact,
      name: 'Customer',
      payment_provider: 'razorpay',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'payment_id',
      ignoreDuplicates: false
    })

  if (error) {
    logger.error('Failed to upsert failed payment', error, {
      orderId: order_id,
      paymentId: payment_id
    })
  }
}

async function handleOrderPaid(_order: RazorpayOrder, _supabase: SupabaseClient) {
  // Order fully paid - can trigger additional actions if needed
}