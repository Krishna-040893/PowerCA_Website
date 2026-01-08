import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

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

    // Get all paid payments for this user (check multiple statuses)
    const { data: payments, error } = await supabase
      .from('payments')
      .select('address, order_id, status')
      .eq('user_id', session.user.id)
      .in('status', ['captured', 'paid', 'success', 'SUCCESS', 'completed', 'COMPLETED'])

    if (error) {
      logger.error('Error fetching purchased addresses', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch purchased addresses' },
        { status: 500 }
      )
    }

    // Check payment_orders for address_id (check multiple statuses)
    const { data: paidOrders } = await supabase
      .from('payment_orders')
      .select('id, address_id, customer_city, customer_address, status')
      .eq('user_id', session.user.id)
      .in('status', ['paid', 'captured', 'success', 'SUCCESS', 'completed', 'COMPLETED'])

    // Get user addresses to match by city/address
    const { data: userAddresses } = await supabase
      .from('user_addresses')
      .select('id, city, address')
      .eq('user_id', session.user.id)

    const purchasedAddressIds: string[] = []

    // Log for debugging
    logger.info('Purchased addresses check', {
      userId: session.user.id,
      paymentsCount: payments?.length || 0,
      paidOrdersCount: paidOrders?.length || 0,
      userAddressesCount: userAddresses?.length || 0,
      paidOrdersData: paidOrders?.map(o => ({ id: o.id, address_id: o.address_id, city: o.customer_city, status: o.status }))
    })

    // Primary: direct address_id matches from payment_orders
    if (paidOrders) {
      for (const order of paidOrders) {
        if (order.address_id && !purchasedAddressIds.includes(order.address_id)) {
          purchasedAddressIds.push(order.address_id)
          logger.info('Matched by address_id', { orderId: order.id, addressId: order.address_id })
        }
      }
    }

    // Secondary fallback: match payment_orders to addresses by customer_city
    // For orders without address_id but with customer_city
    if (paidOrders && userAddresses) {
      for (const order of paidOrders) {
        if (!order.address_id && order.customer_city) {
          const orderCity = order.customer_city.toLowerCase().trim()
          const matchedAddress = userAddresses.find(addr =>
            addr.city.toLowerCase().trim() === orderCity ||
            addr.city.toLowerCase().trim().includes(orderCity) ||
            orderCity.includes(addr.city.toLowerCase().trim())
          )
          if (matchedAddress && !purchasedAddressIds.includes(matchedAddress.id)) {
            purchasedAddressIds.push(matchedAddress.id)
            logger.info('Matched by customer_city', { orderId: order.id, city: order.customer_city, addressId: matchedAddress.id })
          }
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

    logger.info('Purchased addresses result', {
      userId: session.user.id,
      purchasedCount: purchasedAddressIds.length,
      purchasedAddressIds
    })

    return NextResponse.json({
      success: true,
      purchasedAddressIds
    })
  } catch (error) {
    logger.error('Error in GET /api/user/purchased-addresses', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
