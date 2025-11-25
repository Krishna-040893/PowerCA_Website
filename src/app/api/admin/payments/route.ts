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

    // Get order IDs from payments to fetch location from payment_orders
    const orderIds = [...new Set((payments || []).filter(p => p.order_id).map(p => p.order_id))]

    // Fetch payment_orders with address data to get location for each payment
    let orderAddressMap: Record<string, {
      location: string | null;
      city: string | null;
      state: string | null;
      postcode: string | null;
      country: string | null;
      discount_percentage: number | null;
      discount_amount: number | null;
      original_amount: number | null;
    }> = {}

    if (orderIds.length > 0) {
      // Fetch payment_orders with joined user_addresses
      const { data: orders } = await supabase
        .from('payment_orders')
        .select(`
          order_id,
          customer_city,
          customer_state,
          customer_postcode,
          customer_country,
          discount_percentage,
          discount_amount,
          original_amount,
          user_addresses (
            label,
            city,
            state,
            postcode,
            country
          )
        `)
        .in('order_id', orderIds)

      if (orders) {
        orderAddressMap = orders.reduce((acc, order) => {
          const addresses = order.user_addresses as unknown as Array<{ label: string; city: string; state: string; postcode: string; country: string }> | null
          const addressData = addresses && Array.isArray(addresses) && addresses.length > 0
            ? addresses[0]
            : null
          acc[order.order_id] = {
            // Use label from user_addresses for location, or fall back to customer_city/state
            location: addressData?.label || (order.customer_city && order.customer_state ? `${order.customer_city}, ${order.customer_state}` : null),
            city: order.customer_city || addressData?.city || null,
            state: order.customer_state || addressData?.state || null,
            postcode: order.customer_postcode || addressData?.postcode || null,
            country: order.customer_country || addressData?.country || null,
            discount_percentage: order.discount_percentage,
            discount_amount: order.discount_amount,
            original_amount: order.original_amount,
          }
          return acc
        }, {} as Record<string, { location: string | null; city: string | null; state: string | null; postcode: string | null; country: string | null; discount_percentage: number | null; discount_amount: number | null; original_amount: number | null }>)
      }
    }

    // Map payments to include location and discount data from payment_orders
    const mappedPayments = (payments || []).map(payment => {
      const orderData = payment.order_id ? orderAddressMap[payment.order_id] : null
      return {
        ...payment,
        // Location data
        location: orderData?.location || null,
        city: orderData?.city || null,
        state: orderData?.state || null,
        postcode: orderData?.postcode || null,
        country: orderData?.country || null,
        // Discount data
        discount_percentage: orderData?.discount_percentage || null,
        discount_amount: orderData?.discount_amount || null,
        original_amount: orderData?.original_amount || null,
      }
    })

    return NextResponse.json({
      payments: mappedPayments,
      total: mappedPayments.length
    })

  } catch (error) {
    return NextResponse.json(
      { payments: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 200 }
    )
  }
}
