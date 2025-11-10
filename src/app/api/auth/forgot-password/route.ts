import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { withRateLimit, RateLimits } from '@/lib/middleware'
import {
  createErrorResponse,
  handleConfigurationError,
  handleDatabaseError,
  isServiceConfigured,
  ErrorType
} from '@/lib/error-handler'
import { logger } from '@/lib/logger'

const handleForgotPassword = async (request: NextRequest) => {
  try {
    // Check if services are configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    if (!isServiceConfigured('RESEND_API_KEY')) {
      return handleConfigurationError('Email service')
    }

    // Initialize services inside the route handler (not at module level)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const resend = new Resend(process.env.RESEND_API_KEY!)

    const { email } = await request.json()

    if (!email) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Email is required',
        { statusCode: 400 }
      )
    }

    logger.info('Password reset requested', { email })

    // Check if user exists in registration_forms table
    const { data: user } = await supabase
      .from('registration_forms')
      .select('id, email, name')
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
      logger.info('Password reset requested for non-existent email', { email })
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
      logger.error('Error storing reset token', updateError, { email })
      return handleDatabaseError(updateError)
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
              <p>Dear ${'full_name' in foundUser ? foundUser.full_name : foundUser.name},</p>

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
                Need help? Contact us at <a href="mailto:contact@powerca.in">contact@powerca.in</a>
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
      logger.info('Password reset email sent', { email })
    } catch (emailError) {
      logger.error('Failed to send password reset email', emailError, { email })
      return createErrorResponse(
        ErrorType.EXTERNAL_SERVICE,
        'Failed to send password reset email',
        { statusCode: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email'
    })

  } catch (error) {
    logger.error('Forgot password error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

// Apply rate limiting middleware (3 requests per minute - strict for password reset)
export const POST = withRateLimit(handleForgotPassword, RateLimits.STRICT)

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
