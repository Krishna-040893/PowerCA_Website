import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
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
          created_at
        )
      `)
      .eq('payments.email', session.user.email)
      .order('issued_at', { ascending: false })

    if (invoicesError) {
      logger.error('Error fetching user invoices', invoicesError)
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
