import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/admin-auth-helper'

// Force Node.js runtime for JWT support
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { payments: [] },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Fetch payment orders from Supabase
    const { data: payments, error } = await supabase
      .from('payment_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { payments: [], error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      payments: payments || [],
      total: payments?.length || 0
    })

  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json(
      { payments: [], error: 'Internal server error' },
      { status: 500 }
    )
  }
}
