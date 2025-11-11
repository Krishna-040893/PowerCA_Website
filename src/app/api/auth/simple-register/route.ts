import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { REGISTRATION_FORMS_TABLE } from '@/lib/constants/tables'
import { logger } from '@/lib/logger'
import { strictLimiter, getClientIp, createRateLimitResponse } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply strict rate limiting: 3 registration attempts per minute per IP
  const ip = getClientIp(request)
  const rateLimitResult = await strictLimiter.check(3, ip)

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const { name, email, phone, password, firmName: _firmName } = body

    // Validate required fields
    if (!name || !email || !phone || !password) {
      console.error('Validation failed: Missing required fields')
      return NextResponse.json(
        { error: 'Name, email, phone, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const supabase = createAdminClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, email, name, username')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      // Return existing user for affiliate registration
      return NextResponse.json(
        {
          success: true,
          message: 'Using existing account',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            username: existingUser.username
          },
          existingUser: true
        },
        { status: 200 }
      )
    }

    // Check if email is already registered as an affiliate
    const { data: existingAffiliate } = await supabase
      .from('affiliate_registrations')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle()

    if (existingAffiliate) {
      logger.warn('Email already registered as affiliate, cannot use for client', { email })
      return NextResponse.json(
        { error: 'This email is already registered. Please use a different email address.' },
        { status: 400 }
      )
    }

    // Generate username from email
    const username = email.split('@')[0].toLowerCase() + Date.now()

    // Insert into registrations table
    const { data: newUser, error: insertError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .insert({
        name,
        email,
        username,
        password_hash: hashedPassword,
        phone,
        role: 'user',
        agreed_to_terms: true,
        is_verified: false,
        is_active: true,
        last_login: null,
        login_count: 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('Registration insert error:', insertError)
      logger.error('Registration insert error', insertError)

      // Check if it's a unique constraint violation
      if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already registered. Please try another email address.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create user account', details: insertError.message },
        { status: 500 }
      )
    }

    logger.info('User registration successful', { userId: newUser.id })

    // Send welcome email to client (non-blocking)
    import('@/lib/send-emails').then(({ sendWelcomeEmail, sendAdminRegistrationNotification }) => {
      sendWelcomeEmail({
        name: newUser.name,
        email: newUser.email,
      }).catch(error => {
        logger.error('Failed to send welcome email', error)
      })

      // Send notification to admin (non-blocking)
      sendAdminRegistrationNotification({
        userName: newUser.name,
        userEmail: newUser.email,
        userPhone: newUser.phone,
        userRole: 'user',
        registeredAt: new Date().toISOString(),
      }).catch(error => {
        logger.error('Failed to send admin notification', error)
      })
    }).catch(error => {
      logger.error('Failed to import email functions', error)
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful!',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          username: newUser.username
        }
      },
      { status: 201 }
    )

  } catch (error) {
    logger.error('Registration error', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
