import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

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
        { payments: [], orders: [], error: 'Database configuration missing' },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Fetch app download payments
    const { data: payments, error: paymentsError } = await supabase
      .from('app_download_payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (paymentsError) {
      logger.error('Error fetching app download payments', paymentsError)
    }

    // Fetch app download orders - only show "created" status (not paid)
    const { data: orders, error: ordersError } = await supabase
      .from('app_download_orders')
      .select('*')
      .eq('status', 'created')
      .order('created_at', { ascending: false })

    if (ordersError) {
      logger.error('Error fetching app download orders', ordersError)
    }

    // Group payments by email
    const groupedPayments: Record<string, typeof payments> = {}
    if (payments) {
      for (const payment of payments) {
        const email = payment.email || 'unknown'
        if (!groupedPayments[email]) {
          groupedPayments[email] = []
        }
        groupedPayments[email].push(payment)
      }
    }

    // Convert grouped payments to array format for frontend
    const paymentsGroupedByEmail = Object.entries(groupedPayments).map(([email, userPayments]) => {
      const paymentsList = userPayments || []
      return {
        email,
        customerName: paymentsList[0]?.name || 'Unknown',
        customerPhone: paymentsList[0]?.phone || '',
        totalPurchases: paymentsList.length,
        totalAmount: paymentsList.reduce((sum, p) => sum + (p.amount || 0), 0),
        payments: paymentsList
      }
    })

    return NextResponse.json({
      payments: payments || [],
      paymentsGroupedByEmail,
      orders: orders || [],
      stats: {
        totalPayments: payments?.length || 0,
        uniqueCustomers: Object.keys(groupedPayments).length,
        downloaded: payments?.filter(p => p.download_count > 0).length || 0,
        pendingDownloads: payments?.filter(p => p.download_count === 0).length || 0,
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.length || 0
      }
    })

  } catch (error) {
    logger.error('Error in admin app-downloads API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
