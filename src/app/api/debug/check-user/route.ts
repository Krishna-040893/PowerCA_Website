import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const supabase = createAdminClient()

    // Check if user exists in registrations table
    const { data: user, error } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      return NextResponse.json({
        error: 'User not found in database',
        details: error.message,
        table: REGISTRATION_FORMS_TABLE
      })
    }

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        email: email
      })
    }

    // Check if password field exists
    if (!user.password_hash) {
      return NextResponse.json({
        error: 'User has no password stored',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }

    // Try to verify password
    let passwordMatch = false
    let passwordError = null

    try {
      passwordMatch = await bcrypt.compare(password, user.password_hash)
    } catch (err) {
      passwordError = err instanceof Error ? err.message : 'Password check failed'
    }

    return NextResponse.json({
      userFound: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password_hash,
        passwordLength: user.password_hash ? user.password_hash.length : 0
      },
      passwordMatch,
      passwordError,
      debug: {
        providedPassword: password,
        storedPasswordHash: user.password_hash ? user.password_hash.substring(0, 20) + '...' : null
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
