import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { plan } = await request.json()

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if user already has this plan
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('plan', plan)
      .eq('status', 'ACTIVE')
      .single()

    if (existingSub) {
      return NextResponse.json(
        { error: 'User already has an active subscription for this plan' },
        { status: 409 }
      )
    }

    // Create subscription
    const now = new Date()
    const oneYearLater = new Date()
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: session.user.id,
          plan: plan,
          status: 'ACTIVE',
          current_period_start: now.toISOString(),
          current_period_end: oneYearLater.toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      logger.error('Error creating subscription', error)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription
    })

  } catch (error) {
    logger.error('Subscription creation error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}