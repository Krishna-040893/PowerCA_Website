import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function GET() {
  try {
    console.log('🧪 Testing Resend email configuration...')
    console.log('📧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Configured ✅' : 'Missing ❌')
    console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set')

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

    console.log('✅ Test email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      result
    })
  } catch (error: any) {
    console.error('❌ Test email failed:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
