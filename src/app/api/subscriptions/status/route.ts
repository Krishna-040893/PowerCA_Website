import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    // Get user's subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist yet, return empty subscriptions array
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return NextResponse.json({ subscriptions: [] })
      }

      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })
  } catch (error) {
    // Handle network errors gracefully - return empty subscriptions instead of 500
    const isNetworkError = error instanceof TypeError &&
      (error.message.includes('fetch failed') || error.message.includes('network'))

    if (isNetworkError) {
      console.warn('Network error fetching subscriptions - returning empty array')
      return NextResponse.json({ subscriptions: [] })
    }

    console.error('Unexpected error in subscriptions API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
