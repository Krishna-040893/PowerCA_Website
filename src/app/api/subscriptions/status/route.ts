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
      console.error('Error fetching subscriptions:', error)

      // If table doesn't exist yet, return empty subscriptions array
      if (error.code === 'PGRST205') {
        console.warn('Subscriptions table not found - returning empty array')
        return NextResponse.json({ subscriptions: [] })
      }

      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })
  } catch (error) {
    console.error('Unexpected error in subscriptions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
