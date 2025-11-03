import {NextRequest, NextResponse  } from 'next/server'
import bcrypt from 'bcryptjs'
import {createAdminClient  } from '@/lib/supabase/admin'
import {logger  } from '@/lib/logger'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'
import {authLimiter, getClientIp, createRateLimitResponse  } from '@/lib/rate-limit'
import { createErrorResponse, handleDatabaseError as _handleDatabaseError, ErrorType } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  // Apply rate limiting: 5 login attempts per minute per IP
  const ip = getClientIp(request)
  const rateLimitResult = await authLimiter.check(5, ip)

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Email and password are required',
        { statusCode: 400 }
      )
    }

    logger.info('Login attempt', { email })

    const supabase = createAdminClient()

    // Fetch user from registrations table
    const { data: user, error } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('*')
      .or(`email.eq.${email},username.eq.${email}`)
      .single()

    if (error || !user) {
      logger.warn('Login failed - user not found', { email })
      return createErrorResponse(
        ErrorType.AUTHENTICATION,
        'Invalid credentials',
        { statusCode: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      logger.warn('Login failed - invalid password', { email })
      return createErrorResponse(
        ErrorType.AUTHENTICATION,
        'Invalid credentials',
        { statusCode: 401 }
      )
    }

    // Check if user has a profile (account setup completed)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Prepare user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      role: user.role || 'subscriber', // Default role for new registrations
      professional_type: user.professional_type,
      profile_completed: profile ? true : false,
      is_affiliate: false,
      affiliate_status: 'none'
    }

    await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .update({
        last_login: new Date().toISOString(),
        login_count: (user.login_count || 0) + 1
      })
      .eq('id', user.id)

    logger.info('Login successful', { userId: user.id, email })

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Login successful'
    })

  } catch (error) {
    logger.error('Login error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}
