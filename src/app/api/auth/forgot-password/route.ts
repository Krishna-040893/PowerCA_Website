import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) {
  throw new Error('Missing Resend API key')
}

const resend = new Resend(resendApiKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in registration_forms table
    const { data: user } = await supabase
      .from('registration_forms')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    // Also check affiliate_registrations table
    const { data: affiliate } = await supabase
      .from('affiliate_registrations')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    const foundUser = user || affiliate
    const userType = user ? 'client' : 'affiliate'

    if (!foundUser) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    const tableName = userType === 'client' ? 'registration_forms' : 'affiliate_registrations'
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('email', email)

    if (updateError) {
      console.error('Error storing reset token:', updateError)
      return NextResponse.json(
        { error: 'Failed to process password reset request' },
        { status: 500 }
      )
    }

    // Create reset password link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&type=${userType}`

    // Send email with reset link
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 40px; background: #1e40af; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Dear ${foundUser.full_name},</p>

              <p>We received a request to reset your password for your PowerCA ${userType === 'affiliate' ? 'Affiliate' : 'Client'} account.</p>

              <p>Click the button below to reset your password:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="button" style="color: white;">Reset Password</a>
              </div>

              <p style="color: #6b7280; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
              </p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link will expire in 1 hour.<br>
                If you didn't request this password reset, please ignore this email.
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Need help? Contact us at <a href="mailto:support@powerca.in">support@powerca.in</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await resend.emails.send({
        from: 'PowerCA <contact@powerca.in>',
        to: email,
        subject: 'Reset Your PowerCA Password',
        html: emailHtml,
      })
      console.log('✅ Password reset email sent to:', email)
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
