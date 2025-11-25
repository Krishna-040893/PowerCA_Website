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

    // Fetch payment_orders with address_id to get location from user_addresses
    const orderIds = invoices?.map(inv => {
      const payment = Array.isArray(inv.payments) ? inv.payments[0] : inv.payments
      return payment?.order_id
    }).filter(Boolean) || []

    // Get payment_orders with address_id and discount info
    let paymentOrders = null
    if (orderIds.length > 0) {
      const { data } = await supabase
        .from('payment_orders')
        .select('order_id, address_id, customer_city, discount_percentage, discount_amount, original_amount')
        .in('order_id', orderIds)
      paymentOrders = data
    }

    // Get all address_ids to fetch from user_addresses
    const addressIds = paymentOrders?.map(po => po.address_id).filter(Boolean) || []

    // Fetch user_addresses to get label/city
    let userAddresses: { id: string; label: string | null; city: string }[] = []
    if (addressIds.length > 0) {
      const { data } = await supabase
        .from('user_addresses')
        .select('id, label, city')
        .in('id', addressIds)
      userAddresses = data || []
    }

    // Create a map of address_id to location (prefer label, fallback to city)
    const addressLocationMap: Record<string, string> = {}
    for (const addr of userAddresses) {
      addressLocationMap[addr.id] = addr.label || addr.city
    }

    // Create a map of order_id to location and discount info
    const orderCityMap: Record<string, string> = {}
    const orderDiscountMap: Record<string, { discountPercentage: number; discountAmount: number; originalAmount: number | null }> = {}
    if (paymentOrders) {
      for (const po of paymentOrders) {
        if (po.order_id) {
          // First try to get location from user_addresses via address_id
          if (po.address_id && addressLocationMap[po.address_id]) {
            orderCityMap[po.order_id] = addressLocationMap[po.address_id]
          } else if (po.customer_city) {
            // Fallback to customer_city from payment_orders
            orderCityMap[po.order_id] = po.customer_city
          }
          // Store discount info
          orderDiscountMap[po.order_id] = {
            discountPercentage: po.discount_percentage || 0,
            discountAmount: po.discount_amount || 0,
            originalAmount: po.original_amount || null
          }
        }
      }
    }

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
      // Fetch from registration_forms if no payment history
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
      // Get city from payment_orders map
      const location = payment?.order_id ? (orderCityMap[payment.order_id] || '') : ''
      // Get discount info from payment_orders map
      const discountInfo = payment?.order_id ? orderDiscountMap[payment.order_id] : null
      return {
        invoiceNumber: invoice.invoice_number,
        orderId: payment?.order_id || 'N/A',
        paymentId: payment?.payment_id || 'N/A',
        amount: invoice.amount,
        gst: invoice.gst,
        total: invoice.total,
        status: invoice.status,
        issuedAt: invoice.issued_at,
        paidAt: payment?.created_at || invoice.issued_at,
        location: location,
        discountPercentage: discountInfo?.discountPercentage || 0,
        discountAmount: discountInfo?.discountAmount || 0,
        originalAmount: discountInfo?.originalAmount || null,
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        billingAddress,
        orderHistory,
        totalOrders: orderHistory.length,
      },
    })

  } catch (error) {
    logger.error('Error fetching user data', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}
