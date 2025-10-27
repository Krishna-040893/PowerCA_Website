import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using NextAuth session
    const session = await requireAdminAuth()
    if (!session) {
      console.log('❌ No admin session found')
      return createUnauthorizedResponse()
    }

    console.log('✅ Admin authenticated, fetching payments...')

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      })
      return NextResponse.json(
        { payments: [], error: 'Database configuration missing' },
        { status: 200 }
      )
    }

    console.log('🔗 Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...')

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

    console.log('📊 Querying payments table...')

    // Fetch payments from Supabase - remove timeout, let it try naturally
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      // Return empty array instead of error to prevent frontend from breaking
      return NextResponse.json(
        { payments: [], total: 0 },
        { status: 200 }
      )
    }

    console.log(`✅ Successfully fetched ${payments?.length || 0} payments`)

    return NextResponse.json({
      payments: payments || [],
      total: payments?.length || 0
    })

  } catch (error) {
    console.error('❌ Failed to fetch payments:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { payments: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 200 }
    )
  }
}
