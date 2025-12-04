import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(_request: NextRequest) {
  try {
    // Fetch all payment orders with address data
    const { data: orders, error } = await supabase
      .from('payment_orders')
      .select(`
        *,
        user_addresses (
          label,
          city,
          state,
          postcode,
          country
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment orders:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment orders' },
        { status: 500 }
      )
    }

    // Map the orders to include address data from joined table if direct fields are empty
    const mappedOrders = (orders || []).map(order => {
      const addressData = order.user_addresses
      // Build location: use label first, then city/state combo
      const city = order.customer_city || addressData?.city
      const state = order.customer_state || addressData?.state
      const locationFromFields = city && state ? `${city}, ${state}` : (city || state || null)

      return {
        ...order,
        // Use label field for location, or build from city/state
        location: addressData?.label || locationFromFields,
        // Use direct fields first, fall back to joined address data
        customer_city: order.customer_city || addressData?.city || null,
        customer_state: order.customer_state || addressData?.state || null,
        customer_postcode: order.customer_postcode || addressData?.postcode || null,
        customer_country: order.customer_country || addressData?.country || null,
      }
    })

    return NextResponse.json({
      success: true,
      orders: mappedOrders,
      count: mappedOrders.length,
    })
  } catch (error) {
    console.error('Error in payment-orders API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
