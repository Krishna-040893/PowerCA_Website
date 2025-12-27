import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

interface AddressPaymentStatus {
  addressId: string
  initialPaymentDate: string | null
  initialPaymentId: string | null
  finalSettlementDate: string | null
  finalSettlementPaymentId: string | null
  isFinalSettlementEnabled: boolean
  daysUntilFinalSettlement: number | null
}

// GET /api/user/address-payment-status - Get payment status for each address
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

    // Get all user addresses
    const { data: addresses, error: addressError } = await supabase
      .from('user_addresses')
      .select('id, city, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    if (addressError) {
      logger.error('Error fetching user addresses', addressError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch addresses' },
        { status: 500 }
      )
    }

    // Get all paid payment orders for this user with address_id
    // Try with payment_type first, fall back if column doesn't exist
    let paidOrders: Array<{
      id: string
      address_id: string | null
      payment_type?: string | null
      created_at: string
      order_id: string
    }> | null = null

    // Try query with payment_type column
    const { data: ordersWithType, error: orderErrorWithType } = await supabase
      .from('payment_orders')
      .select('id, address_id, payment_type, created_at, order_id')
      .eq('user_id', session.user.id)
      .eq('status', 'paid')
      .not('address_id', 'is', null)

    if (orderErrorWithType) {
      // If payment_type column doesn't exist, try without it
      logger.info('payment_type column may not exist, trying fallback query')
      const { data: ordersWithoutType, error: orderErrorWithoutType } = await supabase
        .from('payment_orders')
        .select('id, address_id, created_at, order_id')
        .eq('user_id', session.user.id)
        .eq('status', 'paid')
        .not('address_id', 'is', null)

      if (orderErrorWithoutType) {
        logger.error('Error fetching payment orders', orderErrorWithoutType)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch payment orders' },
          { status: 500 }
        )
      }

      // Add null payment_type to match expected structure
      paidOrders = (ordersWithoutType || []).map(order => ({
        ...order,
        payment_type: null
      }))
    } else {
      paidOrders = ordersWithType
    }

    // Build payment status for each address
    const addressPaymentStatus: AddressPaymentStatus[] = (addresses || []).map(address => {
      // Find payments for this address
      const addressPayments = (paidOrders || []).filter(order => order.address_id === address.id)

      // Find initial payment
      const initialPayment = addressPayments.find(p =>
        p.payment_type === 'initial_payment' || !p.payment_type // Legacy orders without payment_type
      )

      // Find final settlement payment
      const finalSettlement = addressPayments.find(p => p.payment_type === 'final_settlement')

      // Final settlement is always enabled once initial payment is done
      // No waiting period required - user can pay final settlement immediately
      let isFinalSettlementEnabled = false
      const daysUntilFinalSettlement: number | null = null

      if (initialPayment && !finalSettlement) {
        // Enable final settlement immediately after initial payment
        isFinalSettlementEnabled = true
      }

      return {
        addressId: address.id,
        initialPaymentDate: initialPayment?.created_at || null,
        initialPaymentId: initialPayment?.order_id || null,
        finalSettlementDate: finalSettlement?.created_at || null,
        finalSettlementPaymentId: finalSettlement?.order_id || null,
        isFinalSettlementEnabled,
        daysUntilFinalSettlement
      }
    })

    return NextResponse.json({
      success: true,
      addressPaymentStatus
    })
  } catch (error) {
    logger.error('Error in GET /api/user/address-payment-status', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
