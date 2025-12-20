import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { logger } from '@/lib/logger'
import { AppDownloadEmail, AppDownloadEmailText } from '@/lib/email-templates/app-download-email'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Generate secure download token
function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * TEST ENDPOINT - Only for development/testing
 * Simulates the app download email flow without actual payment
 *
 * Usage: POST /api/test/app-download-email
 * Body: { email: "test@example.com", name: "Test User" }
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const { email, name = 'Test User' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    logger.info('Test: Creating app download email', { email, name })

    // Generate test data
    const downloadToken = generateDownloadToken()
    const testOrderId = `test_order_${Date.now()}`
    const testPaymentId = `test_pay_${Date.now()}`
    const productName = 'PowerCA Demo Version'
    const amount = 2000

    // Create download link (one-time use)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'
    const downloadLink = `${baseUrl}/api/download/app?token=${downloadToken}`

    const supabase = createAdminClient()

    // Save test payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('app_download_payments')
      .insert({
        order_id: testOrderId,
        payment_id: testPaymentId,
        signature: 'test_signature',
        amount: amount,
        currency: 'INR',
        status: 'captured',
        product_id: 'powerca-demo-version',
        product_name: productName,
        email: email,
        phone: '9999999999',
        name: name,
        license_key: 'N/A',
        download_token: downloadToken,
        download_count: 0
      })
      .select()
      .single()

    if (paymentError) {
      logger.error('Test: Failed to save payment record', paymentError)
      return NextResponse.json(
        {
          error: 'Failed to create test payment record',
          details: paymentError.message,
          hint: 'Make sure the database migration has been applied'
        },
        { status: 500 }
      )
    }

    // Send email
    let emailSent = false
    let emailError = null

    if (resend) {
      try {
        const emailHtml = AppDownloadEmail({
          name: name,
          email: email,
          orderId: testOrderId,
          paymentId: testPaymentId,
          productName: productName,
          amount: amount,
          downloadLink: downloadLink,
        })

        const emailText = AppDownloadEmailText({
          name: name,
          email: email,
          orderId: testOrderId,
          paymentId: testPaymentId,
          productName: productName,
          amount: amount,
          downloadLink: downloadLink,
        })

        const emailResult = await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: email,
          subject: `Your PowerCA Desktop Download Link - TEST`,
          html: emailHtml,
          text: emailText,
        })

        emailSent = true
        logger.info('Test: Email sent successfully', { emailResult })
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Unknown email error'
        logger.error('Test: Failed to send email', err)
      }
    } else {
      emailError = 'Resend not configured (RESEND_API_KEY missing)'
    }

    return NextResponse.json({
      success: true,
      message: 'Test app download flow completed',
      data: {
        orderId: testOrderId,
        paymentId: testPaymentId,
        downloadLink: downloadLink,
        downloadToken: downloadToken,
        paymentRecordCreated: !!payment,
        emailSent: emailSent,
        emailError: emailError
      },
      instructions: {
        step1: `Download link created: ${downloadLink}`,
        step2: emailSent
          ? `Email sent to ${email} - check inbox`
          : `Email NOT sent: ${emailError}`,
        step3: 'Click the download link to test file download',
        step4: 'Link is ONE-TIME USE ONLY - invalidated after first download'
      }
    })

  } catch (error) {
    logger.error('Test: App download email test failed', error)
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check configuration
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'

  return NextResponse.json({
    status: 'ready',
    configuration: {
      resendConfigured: !!process.env.RESEND_API_KEY,
      supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      baseUrl: baseUrl
    },
    usage: {
      method: 'POST',
      url: `${baseUrl}/api/test/app-download-email`,
      body: {
        email: 'your-email@example.com',
        name: 'Your Name (optional)'
      }
    }
  })
}
