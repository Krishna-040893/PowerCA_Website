import {NextRequest, NextResponse  } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {createClient  } from '@supabase/supabase-js'
import {logger  } from '@/lib/logger'
import {rateLimit, rateLimitPresets, rateLimitResponse  } from '@/lib/rate-limit'
import {createErrorResponse, ErrorType, handleConfigurationError, handleDatabaseError, isServiceConfigured  } from '@/lib/error-handler'
import type { DatabaseUpdateData } from '@/types/api'

// Force Node.js runtime for JWT and bcrypt support
export const runtime = 'nodejs'

// Create rate limiter for login endpoint
const loginRateLimiter = rateLimit(rateLimitPresets.auth)

// Ensure JWT_SECRET is properly configured
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('CRITICAL: NEXTAUTH_SECRET environment variable is not configured. This is required for secure authentication.')
}

// JWT secret from environment variable
const JWT_SECRET = process.env.NEXTAUTH_SECRET

// Max login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await loginRateLimiter(request)
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfter)
    }

    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Username and password are required'
      )
    }

    // Check if Supabase is configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return createErrorResponse(
        ErrorType.CONFIGURATION,
        'Database connection not configured'
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Get admin user from database
    const { data: adminUser, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    if (!adminUser) {
      return createErrorResponse(
        ErrorType.AUTHENTICATION,
        'Invalid credentials'
      )
    }

    // Check if account is locked
    if (adminUser.locked_until) {
      const lockoutTime = new Date(adminUser.locked_until).getTime()
      if (lockoutTime > Date.now()) {
        const minutesRemaining = Math.ceil((lockoutTime - Date.now()) / 60000)
        return createErrorResponse(
          ErrorType.AUTHENTICATION,
          `Account locked. Try again in ${minutesRemaining} minutes.`
        )
      } else {
        // Unlock the account
        await supabase
          .from('admin_users')
          .update({
            locked_until: null,
            login_attempts: 0
          })
          .eq('id', adminUser.id)
      }
    }

    // Check if account is active
    if (!adminUser.is_active) {
      return createErrorResponse(
        ErrorType.AUTHORIZATION,
        'Account is disabled'
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = (adminUser.login_attempts || 0) + 1
      const updateData: DatabaseUpdateData = { login_attempts: newAttempts }

      // Lock account if max attempts reached
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.locked_until = new Date(Date.now() + LOCKOUT_DURATION).toISOString()
      }

      await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', adminUser.id)

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        return createErrorResponse(
          ErrorType.AUTHENTICATION,
          'Too many failed attempts. Account locked for 30 minutes.'
        )
      }

      return createErrorResponse(
        ErrorType.AUTHENTICATION,
        'Invalid credentials'
      )
    }

    // Reset login attempts and update last login
    await supabase
      .from('admin_users')
      .update({
        login_attempts: 0,
        last_login: new Date().toISOString(),
        locked_until: null
      })
      .eq('id', adminUser.id)

    // Generate JWT token
    let token: string
    try {
      token = jwt.sign(
        {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: 'admin',
          loginTime: new Date().toISOString()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
    } catch (error) {
      logger.error('JWT token creation failed', error)
      return createErrorResponse(
        ErrorType.CONFIGURATION,
        'Authentication system error. Please contact support.'
      )
    }

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin'
      }
    })

    // Set HTTP-only cookie for better security
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    })

    // Log successful admin login for security audit
    logger.security('Admin login successful', { username: adminUser.username })

    return response
  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}