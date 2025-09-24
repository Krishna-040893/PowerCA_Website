import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking Supabase connection...')

    const supabase = createAdminClient()

    // Test basic connection
    const { data, error, count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('Supabase query result:', { data, error, count })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      count,
      data,
      message: 'Successfully connected to Supabase registrations table'
    })

  } catch (error: any) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}