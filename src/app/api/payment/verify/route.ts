import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature, RazorpayPaymentData } from '@/lib/razorpay'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/send-emails'
import { PaymentConfirmationEmail, PaymentConfirmationEmailText } from '@/lib/email-templates/payment-confirmation'
import { createInvoiceData, generateInvoiceHTML } from '@/lib/invoice-generator'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json() as RazorpayPaymentData
    const supabase = createClient()

    // Verify the payment signature
    const isValid = verifyPaymentSignature(body)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Get additional user data from the original order creation
    const userData = await req.headers.get('x-user-data')
    const userInfo = userData ? JSON.parse(userData) : {}

    // Save payment to Supabase
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: session?.user?.id || null,
        order_id: body.razorpay_order_id,
        payment_id: body.razorpay_payment_id,
        signature: body.razorpay_signature,
        amount: 22000,
        currency: 'INR',
        status: 'success',
        plan: 'PowerCA Implementation',
        email: session?.user?.email || userInfo.email || 'guest@powerca.in',
        phone: userInfo.phone,
        name: session?.user?.name || userInfo.name,
        company: userInfo.company,
        gst_number: userInfo.gstNumber,
        address: userInfo.address,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to save payment:', paymentError)
      // Don't fail the payment verification if DB save fails
      // We can retry via webhook
    }

    // Generate invoice
    const invoiceData = createInvoiceData({
      ...payment,
      paymentId: body.razorpay_payment_id,
      orderId: body.razorpay_order_id,
    })
    
    const invoiceHTML = generateInvoiceHTML(invoiceData)
    
    // Save invoice to database
    if (payment) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          payment_id: payment.id,
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
          to: payment.email,
          subject: `Payment Confirmation - Invoice ${invoiceData.invoiceNumber}`,
          html: PaymentConfirmationEmail({
            name: payment.name || 'Customer',
            email: payment.email,
            amount: 22000,
            orderId: body.razorpay_order_id,
            paymentId: body.razorpay_payment_id,
            invoiceNumber: invoiceData.invoiceNumber,
            company: payment.company,
          }),
          text: PaymentConfirmationEmailText({
            name: payment.name || 'Customer',
            email: payment.email,
            amount: 22000,
            orderId: body.razorpay_order_id,
            paymentId: body.razorpay_payment_id,
            invoiceNumber: invoiceData.invoiceNumber,
            company: payment.company,
          }),
          attachments: [{
            filename: `Invoice-${invoiceData.invoiceNumber}.html`,
            content: invoiceHTML,
          }],
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the payment if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and saved successfully',
      data: {
        paymentId: body.razorpay_payment_id,
        orderId: body.razorpay_order_id,
        invoiceNumber: invoiceData?.invoiceNumber,
        amount: 22000,
        currency: 'INR',
      },
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}