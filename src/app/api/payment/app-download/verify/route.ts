import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Resend } from 'resend'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType, handleConfigurationError, isServiceConfigured } from '@/lib/error-handler'
import { AppDownloadEmail, AppDownloadEmailText } from '@/lib/email-templates/app-download-email'
import { generateAppDownloadInvoicePDF } from '@/lib/app-download-invoice'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Generate secure download token
function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Generate secure success page token (shorter, for URL)
function generateSuccessToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    logger.info('App download payment verification request received', {
      orderId: body.razorpay_order_id,
      hasCustomerDetails: !!body.customerDetails
    })

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      productDetails
    } = body

    // Verify payment signature
    if (!isServiceConfigured('RAZORPAY_KEY_SECRET')) {
      return handleConfigurationError('Payment gateway')
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      throw new Error('Razorpay key secret not configured')
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      logger.security('Invalid app download payment signature attempted', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userEmail: customerDetails?.email
      })
      return createErrorResponse(
        ErrorType.PAYMENT,
        'Invalid payment signature'
      )
    }

    const supabase = createAdminClient()

    const customerEmail = customerDetails?.email || session?.user?.email
    const customerName = customerDetails?.name || session?.user?.name || 'Customer'
    const customerPhone = customerDetails?.phone

    // Generate download token and success token
    const downloadToken = generateDownloadToken()
    const successToken = generateSuccessToken()

    // Create download link with secure token (one-time use)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'
    const downloadLink = `${baseUrl}/api/download/app?token=${downloadToken}`

    // Calculate download link expiry (7 days from now)
    const downloadExpiresAt = new Date()
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7)

    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('app_download_payments')
      .insert({
        user_id: session?.user?.id,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        amount: productDetails?.amount || 0,
        currency: 'INR',
        status: 'captured',
        product_id: productDetails?.id,
        product_name: productDetails?.name,
        email: customerEmail,
        phone: customerPhone,
        name: customerName,
        license_key: 'N/A',
        download_token: downloadToken,
        download_count: 0,
        download_expires_at: downloadExpiresAt.toISOString(),
        success_token: successToken,
        success_token_used: false
      })
      .select()
      .single()

    if (paymentError) {
      logger.error('Failed to save app download payment', {
        error: paymentError,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        email: customerEmail,
        errorCode: paymentError.code,
        errorMessage: paymentError.message
      })
      // Return error to user - payment was successful but we couldn't save the record
      return createErrorResponse(
        ErrorType.DATABASE,
        'Payment was successful but we encountered an error saving your order. Please contact support with your payment ID: ' + razorpay_payment_id
      )
    }

    logger.info('App download payment saved successfully', {
      paymentId: payment.id,
      orderId: razorpay_order_id,
      email: customerEmail,
      successToken: successToken.substring(0, 8) + '...'
    })

    // Update order status to 'paid'
    try {
      await supabase
        .from('app_download_orders')
        .update({ status: 'paid' })
        .eq('order_id', razorpay_order_id)
    } catch (orderError) {
      logger.error('Failed to update order status', orderError)
    }

    // Send download link email with invoice PDF attachment
    if (customerEmail && resend) {
      try {
        logger.info('Sending app download email with invoice', {
          to: customerEmail,
          productName: productDetails?.name
        })

        // Generate invoice PDF
        const invoiceData = {
          invoiceNumber: `PCA-DL-${razorpay_order_id.replace('order_', '')}`,
          invoiceDate: new Date(),
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          productName: productDetails?.name || 'PowerCA Desktop',
          amount: productDetails?.amount || 0,
          currency: 'INR'
        }

        let invoicePdfBuffer: Buffer | null = null
        try {
          const pdfBytes = await generateAppDownloadInvoicePDF(invoiceData)
          invoicePdfBuffer = Buffer.from(pdfBytes)
          logger.info('Invoice PDF generated successfully')
        } catch (pdfError) {
          logger.error('Failed to generate invoice PDF, sending email without attachment', pdfError)
        }

        const emailHtml = AppDownloadEmail({
          name: customerName,
          email: customerEmail,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          productName: productDetails?.name || 'PowerCA Desktop',
          amount: productDetails?.amount || 0,
          downloadLink: downloadLink,
        })

        const emailText = AppDownloadEmailText({
          name: customerName,
          email: customerEmail,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          productName: productDetails?.name || 'PowerCA Desktop',
          amount: productDetails?.amount || 0,
          downloadLink: downloadLink,
        })

        // Build email options with optional attachment
        const emailOptions: {
          from: string
          to: string
          subject: string
          html: string
          text: string
          attachments?: { filename: string; content: Buffer }[]
        } = {
          from: 'PowerCA <contact@powerca.in>',
          to: customerEmail,
          subject: `Demo Version Download Link`,
          html: emailHtml,
          text: emailText,
        }

        // Add invoice attachment if generated successfully
        if (invoicePdfBuffer) {
          emailOptions.attachments = [
            {
              filename: `PowerCA_Invoice_Demo_Version.pdf`,
              content: invoicePdfBuffer,
            }
          ]
        }

        await resend.emails.send(emailOptions)

        logger.info('App download email sent successfully', {
          to: customerEmail,
          orderId: razorpay_order_id,
          hasInvoice: !!invoicePdfBuffer
        })
      } catch (emailError) {
        logger.error('Failed to send app download email', emailError)
        // Don't fail the payment if email fails
      }
    } else {
      logger.warn('Could not send download email - missing email or Resend not configured')
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Download link sent to your email.',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      successToken: successToken,
    })

  } catch (error) {
    logger.error('App download payment verification failed', error)
    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}
