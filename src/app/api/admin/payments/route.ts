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

    // Fetch payment_orders with address data to get location and payment_type for each payment
    let orderAddressMap: Record<string, {
      location: string | null;
      city: string | null;
      state: string | null;
      postcode: string | null;
      country: string | null;
      discount_percentage: number | null;
      discount_amount: number | null;
      original_amount: number | null;
      payment_type: string | null;
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
          payment_type,
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
            // Use label from user_addresses for location, or fall back to customer_city only
            location: addressData?.label || order.customer_city || addressData?.city || null,
            city: order.customer_city || addressData?.city || null,
            state: order.customer_state || addressData?.state || null,
            postcode: order.customer_postcode || addressData?.postcode || null,
            country: order.customer_country || addressData?.country || null,
            discount_percentage: order.discount_percentage,
            discount_amount: order.discount_amount,
            original_amount: order.original_amount,
            payment_type: order.payment_type || 'initial_payment',
          }
          return acc
        }, {} as Record<string, { location: string | null; city: string | null; state: string | null; postcode: string | null; country: string | null; discount_percentage: number | null; discount_amount: number | null; original_amount: number | null; payment_type: string | null }>)
      }
    }

    // Map payments to include location, discount data, and payment_type from payment_orders
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
        // Payment type
        payment_type: orderData?.payment_type || 'initial_payment',
      }
    })

    // Group payments by email
    const groupedByEmail = new Map<string, {
      email: string;
      name: string;
      firm_names: string[];
      phone: string | null;
      company: string | null;
      total_amount: number;
      total_orders: number;
      locations: string[];
      statuses: string[];
      latest_payment: typeof mappedPayments[0];
      all_payments: typeof mappedPayments;
    }>()

    mappedPayments.forEach(payment => {
      const emailKey = (payment.email || 'unknown').toLowerCase()

      if (!groupedByEmail.has(emailKey)) {
        groupedByEmail.set(emailKey, {
          email: payment.email,
          name: payment.name,
          firm_names: [],
          phone: payment.phone,
          company: payment.company,
          total_amount: 0,
          total_orders: 0,
          locations: [],
          statuses: [],
          latest_payment: payment,
          all_payments: []
        })
      }

      const group = groupedByEmail.get(emailKey)!
      group.total_amount += payment.amount || 0
      group.total_orders += 1
      group.all_payments.push(payment)

      // Collect unique locations
      if (payment.location && !group.locations.includes(payment.location)) {
        group.locations.push(payment.location)
      }

      // Collect unique firm names
      if (payment.firm_name && !group.firm_names.includes(payment.firm_name)) {
        group.firm_names.push(payment.firm_name)
      }

      // Collect statuses
      if (payment.status && !group.statuses.includes(payment.status)) {
        group.statuses.push(payment.status)
      }

      // Update name from most recent if available
      if (payment.name) group.name = payment.name
      if (payment.phone) group.phone = payment.phone
      if (payment.company) group.company = payment.company
    })

    // Convert to array and sort by latest payment date
    const groupedPayments = Array.from(groupedByEmail.values())
      .sort((a, b) => new Date(b.latest_payment.created_at).getTime() - new Date(a.latest_payment.created_at).getTime())
      .map(group => ({
        id: group.latest_payment.id,
        email: group.email,
        name: group.name,
        firm_names: group.firm_names,
        phone: group.phone,
        company: group.company,
        total_amount: group.total_amount,
        total_orders: group.total_orders,
        locations: group.locations,
        statuses: group.statuses,
        latest_payment: group.latest_payment,
        all_payments: group.all_payments,
        // Keep some fields from latest payment for backward compatibility
        order_id: group.latest_payment.order_id,
        payment_id: group.latest_payment.payment_id,
        status: group.latest_payment.status,
        created_at: group.latest_payment.created_at,
        updated_at: group.latest_payment.updated_at,
        amount: group.total_amount,
        currency: group.latest_payment.currency,
        plan: group.latest_payment.plan,
      }))

    return NextResponse.json({
      payments: groupedPayments,
      total: groupedPayments.length,
      totalRecords: mappedPayments.length
    })

  } catch (error) {
    return NextResponse.json(
      { payments: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 200 }
    )
  }
}
