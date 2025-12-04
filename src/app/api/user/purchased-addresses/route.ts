import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/user/purchased-addresses - Get list of address IDs that have been purchased
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get all paid payments for this user
    const { data: payments, error } = await supabase
      .from('payments')
      .select('address, order_id')
      .eq('user_id', session.user.id)
      .eq('status', 'captured')

    if (error) {
      console.error('Error fetching purchased addresses:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch purchased addresses' },
        { status: 500 }
      )
    }

    // Check payment_orders for address_id
    const { data: paidOrders } = await supabase
      .from('payment_orders')
      .select('id, address_id, customer_city, customer_address')
      .eq('user_id', session.user.id)
      .eq('status', 'paid')

    // Get user addresses to match by city/address
    const { data: userAddresses } = await supabase
      .from('user_addresses')
      .select('id, city, address')
      .eq('user_id', session.user.id)

    const purchasedAddressIds: string[] = []

    // Primary: direct address_id matches from payment_orders
    if (paidOrders) {
      for (const order of paidOrders) {
        if (order.address_id && !purchasedAddressIds.includes(order.address_id)) {
          purchasedAddressIds.push(order.address_id)
        }
      }
    }

    // Strict fallback: match payments to addresses by BOTH city AND address content
    // Only for orders without address_id (legacy orders)
    if (userAddresses && payments) {
      for (const payment of payments) {
        if (payment.address) {
          // Strict match: must match both city AND part of address
          const matchedAddress = userAddresses.find(addr =>
            payment.address.toLowerCase().includes(addr.city.toLowerCase()) &&
            payment.address.toLowerCase().includes(addr.address.toLowerCase().substring(0, 15))
          )
          if (matchedAddress && !purchasedAddressIds.includes(matchedAddress.id)) {
            purchasedAddressIds.push(matchedAddress.id)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      purchasedAddressIds
    })
  } catch (error) {
    console.error('Error in GET /api/user/purchased-addresses:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
