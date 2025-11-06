import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

export async function GET(_request: NextRequest) {
  try {
    // Verify admin authentication using NextAuth session
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { payments: [], error: 'Database configuration missing' },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    })

    // Fetch payments from Supabase - remove timeout, let it try naturally
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Return empty array instead of error to prevent frontend from breaking
      return NextResponse.json(
        { payments: [], total: 0 },
        { status: 200 }
      )
    }

    return NextResponse.json({
      payments: payments || [],
      total: payments?.length || 0
    })

  } catch (error) {
    return NextResponse.json(
      { payments: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 200 }
    )
  }
}
