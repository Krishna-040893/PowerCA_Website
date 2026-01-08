import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

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

    // Get user's subscriptions (without joining user_addresses to avoid foreign key issues)
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist yet or relation not found, continue to check payment_orders
      if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST204' || error.code === 'PGRST200' || error.message?.includes('does not exist')) {
        logger.info('Subscriptions table issue, checking payment_orders instead', { errorCode: error.code })
        // Don't return here - continue to check payment_orders below
      } else {
        // Only log actual errors, not missing table errors
        if (error.code && !['PGRST116'].includes(error.code)) {
          logger.error('Error fetching subscriptions', error)
        }
        // Don't return 500 - continue to check payment_orders
      }
    }

    // Also check for paid payment orders (in case subscriptions weren't created)
    // Check multiple success statuses: paid, captured, success, SUCCESS, completed, COMPLETED
    let hasPaidOrders = false
    try {
      // First try by user_id
      const { data: paidOrders, error: ordersError } = await supabase
        .from('payment_orders')
        .select('id, status, user_id, customer_email')
        .eq('user_id', session.user.id)
        .in('status', ['paid', 'captured', 'success', 'SUCCESS', 'completed', 'COMPLETED'])
        .limit(1)

      logger.info('Checking paid orders by user_id', {
        userId: session.user.id,
        email: session.user.email,
        paidOrdersCount: paidOrders?.length || 0,
        paidOrders: paidOrders,
        error: ordersError?.message
      })

      if (!ordersError && paidOrders && paidOrders.length > 0) {
        hasPaidOrders = true
      }

      // If no orders found by user_id, try by email
      if (!hasPaidOrders && session.user.email) {
        const { data: paidOrdersByEmail, error: emailError } = await supabase
          .from('payment_orders')
          .select('id, status, user_id, customer_email')
          .eq('customer_email', session.user.email)
          .in('status', ['paid', 'captured', 'success', 'SUCCESS', 'completed', 'COMPLETED'])
          .limit(1)

        logger.info('Checking paid orders by email', {
          email: session.user.email,
          paidOrdersCount: paidOrdersByEmail?.length || 0,
          paidOrdersByEmail: paidOrdersByEmail,
          error: emailError?.message
        })

        if (!emailError && paidOrdersByEmail && paidOrdersByEmail.length > 0) {
          hasPaidOrders = true
        }
      }

      // Also check the payments table as fallback
      if (!hasPaidOrders && session.user.email) {
        const { data: paidPayments, error: paymentsError } = await supabase
          .from('payments')
          .select('id, status, email')
          .eq('email', session.user.email)
          .in('status', ['paid', 'captured', 'success', 'SUCCESS', 'completed', 'COMPLETED', 'authorized'])
          .limit(1)

        logger.info('Checking payments table by email', {
          email: session.user.email,
          paidPaymentsCount: paidPayments?.length || 0,
          paidPayments: paidPayments,
          error: paymentsError?.message
        })

        if (!paymentsError && paidPayments && paidPayments.length > 0) {
          hasPaidOrders = true
        }
      }
    } catch (err) {
      logger.error('Error checking payment orders', err)
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
      hasPaidOrders: hasPaidOrders
    })
  } catch (error) {
    // Handle network errors gracefully - return empty subscriptions instead of 500
    const isNetworkError = error instanceof TypeError &&
      (error.message.includes('fetch failed') || error.message.includes('network'))

    if (isNetworkError) {
      logger.warn('Network error fetching subscriptions - returning empty array')
      return NextResponse.json({ subscriptions: [] })
    }

    logger.error('Unexpected error in subscriptions API', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
