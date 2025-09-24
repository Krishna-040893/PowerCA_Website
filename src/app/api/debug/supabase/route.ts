import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  const supabase = createClient()
  const results: any = {}

  try {
    // Test connection and check available tables
    const tables = ['bookings', 'registrations', 'users', 'profiles']

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })

        if (error) {
          results[table] = {
            status: 'error',
            error: error.message,
            code: error.code
          }
        } else {
          results[table] = {
            status: 'success',
            count: count || data?.length || 0,
            sample: data?.slice(0, 2) || []
          }
        }
      } catch (e) {
        results[table] = {
          status: 'error',
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json({
      status: 'connected',
      timestamp: new Date().toISOString(),
      tables: results,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}