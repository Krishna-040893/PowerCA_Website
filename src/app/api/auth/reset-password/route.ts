import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { withRateLimit, RateLimits } from '@/lib/middleware'
import {
  createErrorResponse,
  handleConfigurationError,
  handleDatabaseError,
  isServiceConfigured,
  ErrorType
} from '@/lib/error-handler'
import { logger } from '@/lib/logger'

const handleResetPassword = async (request: NextRequest) => {
  try {
    // Check if Supabase is configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    // Initialize Supabase inside the route handler (not at module level)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { token, password, userType } = await request.json()

    // Validate required fields
    if (!token || !password) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Token and password are required',
        { statusCode: 400 }
      )
    }

    if (password.length < 8) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Password must be at least 8 characters long',
        { statusCode: 400 }
      )
    }

    const tableName = userType === 'affiliate' ? 'affiliate_registrations' : 'registration_forms'

    logger.info('Password reset attempt', { userType, tableName })

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from(tableName)
      .select('id, email, reset_token, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (userError || !user) {
      logger.warn('Invalid reset token provided', { userType })
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Invalid or expired reset token',
        { statusCode: 400 }
      )
    }

    // Check if token is expired
    const tokenExpiry = new Date(user.reset_token_expiry)
    if (tokenExpiry < new Date()) {
      logger.warn('Expired reset token used', { userId: user.id, email: user.email })
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Reset token has expired. Please request a new one.',
        { statusCode: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id)

    if (updateError) {
      logger.error('Error updating password', updateError, {
        userId: user.id,
        email: user.email
      })
      return handleDatabaseError(updateError)
    }

    logger.info('Password reset successful', { userId: user.id, email: user.email })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    logger.error('Reset password error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

// Apply rate limiting middleware (3 requests per minute - strict for password reset)
export const POST = withRateLimit(handleResetPassword, RateLimits.STRICT)
