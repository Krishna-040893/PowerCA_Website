import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Fetch user's payments with billing details
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('email', session.user.email)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      logger.error('Error fetching user payments', paymentsError)
    }

    // Fetch user's invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        *,
        payments!inner (
          order_id,
          payment_id,
          name,
          email,
          phone,
          address,
          created_at
        )
      `)
      .eq('payments.email', session.user.email)
      .order('issued_at', { ascending: false })

    if (invoicesError) {
      logger.error('Error fetching user invoices', invoicesError)
    }

    // Get order_ids from invoices for mapping
    const orderIds = invoices?.map(inv => {
      const payment = Array.isArray(inv.payments) ? inv.payments[0] : inv.payments
      return payment?.order_id
    }).filter(Boolean) || []

    // Fetch payment_orders using select('*') to avoid column name issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allPaymentOrders: any[] = []

    // Query by user_id first (most reliable - same approach as purchased-addresses route)
    if (session.user?.id) {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('user_id', session.user.id)

      if (error) {
        logger.error('payment_orders query by user_id failed', {
          error: error.message,
          code: error.code,
        })
      } else {
        allPaymentOrders = data || []
      }
    }

    // Also query by order_id for records that might not have user_id (legacy)
    if (orderIds.length > 0) {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .in('order_id', orderIds)

      if (error) {
        logger.error('payment_orders query by order_id failed', {
          error: error.message,
          code: error.code,
        })
      } else if (data && data.length > 0) {
        // Merge, avoiding duplicates
        const existingIds = new Set(allPaymentOrders.map((po: { id: string }) => po.id))
        const additional = data.filter((po: { id: string }) => !existingIds.has(po.id))
        allPaymentOrders = [...allPaymentOrders, ...additional]
      }
    }

    logger.info('Order data fetched', {
      invoicesCount: invoices?.length || 0,
      orderIdsCount: orderIds.length,
      paymentOrdersCount: allPaymentOrders.length,
      userId: session.user?.id || 'none',
      paymentOrdersSample: allPaymentOrders.slice(0, 2).map((po: { id: string; order_id: string; customer_city: string; address_id: string }) => ({
        id: po.id,
        order_id: po.order_id,
        city: po.customer_city,
        address_id: po.address_id,
      })),
    })

    // Fetch ALL user_addresses for this user
    let userAddresses: { id: string; label: string | null; city: string; firm_name: string }[] = []
    if (session.user?.id) {
      const { data } = await supabase
        .from('user_addresses')
        .select('id, label, city, firm_name')
        .eq('user_id', session.user.id)
      userAddresses = data || []
    }

    // Create address_id → location map (prefer label, fallback to city)
    const addressLocationMap: Record<string, string> = {}
    const firmLocationMap: Record<string, string> = {}
    for (const addr of userAddresses) {
      const location = addr.label || addr.city
      addressLocationMap[addr.id] = location
      if (addr.firm_name && location) {
        firmLocationMap[addr.firm_name.toLowerCase()] = location
      }
    }

    // Build order_id → location map and order_id → details map
    const orderCityMap: Record<string, string> = {}
    const orderDetailsMap: Record<string, {
      discountPercentage: number
      discountAmount: number
      originalAmount: number | null
      paymentType: string
      planType: string
      userCount: number
      firmName: string
      addressId: string | null
    }> = {}

    for (const po of allPaymentOrders) {
      const poOrderId = po.order_id
      if (poOrderId) {
        // Resolve location in priority order
        if (po.address_id && addressLocationMap[po.address_id]) {
          orderCityMap[poOrderId] = addressLocationMap[po.address_id]
        } else if (po.customer_city) {
          orderCityMap[poOrderId] = po.customer_city
        } else if (po.customer_state) {
          orderCityMap[poOrderId] = po.customer_state
        } else if (po.firm_name && firmLocationMap[po.firm_name.toLowerCase()]) {
          orderCityMap[poOrderId] = firmLocationMap[po.firm_name.toLowerCase()]
        } else if (po.firm_name) {
          orderCityMap[poOrderId] = po.firm_name
        }

        orderDetailsMap[poOrderId] = {
          discountPercentage: po.discount_percentage || 0,
          discountAmount: po.discount_amount || 0,
          originalAmount: po.original_amount || null,
          paymentType: po.payment_type || 'initial_payment',
          planType: po.plan_type || 'annual',
          userCount: po.user_count || 1,
          firmName: po.firm_name || '',
          addressId: po.address_id || null,
        }
      }
    }

    logger.info('Location resolution', {
      addressCount: userAddresses.length,
      orderCityMapEntries: Object.keys(orderCityMap).length,
      orderCityMap
    })

    // Get billing address from the most recent payment, or from registration_forms if no payments
    let billingAddress = null

    if (payments && payments.length > 0) {
      billingAddress = {
        name: payments[0].name,
        email: payments[0].email,
        phone: payments[0].phone,
        firmName: payments[0].firm_name,
        company: payments[0].company,
        address: payments[0].address,
        gstNumber: payments[0].gst_number,
      }
    } else {
      const { data: userData, error: userError } = await supabase
        .from('registration_forms')
        .select('name, email, phone, firm_name, company, address, gst_number')
        .eq('email', session.user.email)
        .single()

      if (!userError && userData) {
        billingAddress = {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          firmName: userData.firm_name,
          company: userData.company,
          address: userData.address,
          gstNumber: userData.gst_number,
        }
      }
    }

    // Format order history
    const orderHistory = invoices?.map((invoice) => {
      const payment = Array.isArray(invoice.payments) ? invoice.payments[0] : invoice.payments
      const orderId = payment?.order_id || ''

      // Get location from orderCityMap
      let location = orderId ? (orderCityMap[orderId] || '') : ''

      // Final fallback: if still no location and user has only 1 address, use it
      if (!location && userAddresses.length === 1) {
        location = userAddresses[0].label || userAddresses[0].city
      }

      const orderDetails = orderId ? orderDetailsMap[orderId] : null
      const paidAt = payment?.created_at || invoice.issued_at
      const planType = orderDetails?.planType || 'annual'

      let renewalDate: string | null = null
      if (planType === 'annual') {
        const d = new Date(paidAt)
        d.setFullYear(d.getFullYear() + 1)
        renewalDate = d.toISOString()
      }

      return {
        invoiceNumber: invoice.invoice_number,
        orderId: orderId || 'N/A',
        paymentId: payment?.payment_id || 'N/A',
        amount: invoice.amount,
        gst: invoice.gst,
        total: invoice.total,
        status: invoice.status,
        issuedAt: invoice.issued_at,
        paidAt,
        location,
        discountPercentage: orderDetails?.discountPercentage || 0,
        discountAmount: orderDetails?.discountAmount || 0,
        originalAmount: orderDetails?.originalAmount || null,
        paymentType: orderDetails?.paymentType || 'initial_payment',
        planType,
        userCount: orderDetails?.userCount || 1,
        firmName: orderDetails?.firmName || '',
        addressId: orderDetails?.addressId || null,
        renewalDate,
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        billingAddress,
        orderHistory,
        totalOrders: orderHistory.length,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })

  } catch (error) {
    logger.error('Error fetching user data', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
