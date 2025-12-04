import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    // Try to send a test email
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'

    const result = await resend.emails.send({
      from: `PowerCA Test <${fromEmail}>`,
      to: 'nikilarajan0616@gmail.com',
      subject: 'Test Email from PowerCA',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify Resend configuration.</p>
        <p>If you receive this, your email system is working! ✅</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      result
    })
  } catch (error: unknown) {
    logger.error('Test email failed', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error
    }, { status: 500 })
  }
}
