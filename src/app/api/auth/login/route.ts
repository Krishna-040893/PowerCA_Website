import {NextRequest, NextResponse  } from 'next/server'
import bcrypt from 'bcryptjs'
import {createAdminClient  } from '@/lib/supabase/admin'
import {logger  } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch user from registrations table
    const { data: user, error } = await supabase
      .from('registrations')
      .select('*')
      .or(`email.eq.${email},username.eq.${email}`)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
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
      is_affiliate: user.is_affiliate || false,
      affiliate_status: user.affiliate_status
    }

    // Update last login
    await supabase
      .from('registrations')
      .update({
        last_login: new Date().toISOString(),
        login_count: (user.login_count || 0) + 1
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Login successful'
    })

  } catch (error) {
    logger.error('Login error', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}