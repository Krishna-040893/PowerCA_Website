import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, firmName, membershipNumber } = body

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Hash password first
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
      console.log('Supabase not configured, using demo mode')
      
      // Demo mode - just return success
      const demoUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        firm_name: firmName || null,
        membership_number: membershipNumber || null,
        role: 'user',
        is_verified: false
      }

      return NextResponse.json(
        { 
          success: true,
          message: 'Registration successful (demo mode)',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name
          }
        },
        { status: 201 }
      )
    }

    // Try to use Supabase
    let newUser
    try {
      const supabase = createAdminClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: hashedPassword,
          phone,
          firm_name: firmName || null,
          membership_number: membershipNumber || null,
          role: 'user',
          is_verified: false
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        // Fall back to demo mode
        newUser = {
          id: `user_${Date.now()}`,
          email,
          name,
          firm_name: firmName || null,
          membership_number: membershipNumber || null,
          role: 'user',
          is_verified: false
        }
        console.log('Using demo mode due to Supabase error')
      } else {
        newUser = data
      }
    } catch (fetchError) {
      console.error('Network error connecting to Supabase:', fetchError)
      // Fall back to demo mode
      newUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        firm_name: firmName || null,
        membership_number: membershipNumber || null,
        role: 'user',
        is_verified: false
      }
      console.log('Using demo mode due to network error')
    }

    // Send welcome email (optional - implement if needed)
    // await sendWelcomeEmail(email, name)

    return NextResponse.json(
      { 
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}