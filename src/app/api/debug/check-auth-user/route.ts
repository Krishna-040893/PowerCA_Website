import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Debug endpoint to check if a user exists in auth.users
 * Usage: /api/debug/check-auth-user?email=xxx@example.com
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'email parameter required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Try to get user by email
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)

    if (user) {
      return NextResponse.json({
        success: true,
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          phone: user.phone,
          role: user.role,
          last_sign_in_at: user.last_sign_in_at
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        userExists: false,
        message: `User with email ${email} not found in auth.users`,
        totalUsers: users.users.length
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
