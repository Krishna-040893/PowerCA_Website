import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    const supabase = createAdminClient()

    // Fetch the most recent incomplete payment order for this user
    // Status 'created' means order was created but payment not completed
    const { data: lastOrder, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('customer_email', userEmail)
      .eq('status', 'created') // Only get incomplete orders
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !lastOrder) {
      return NextResponse.json({
        hasOrder: false,
        orderData: null
      })
    }

    // Return the order data for auto-fill
    return NextResponse.json({
      hasOrder: true,
      orderData: {
        firstName: lastOrder.customer_name || '',
        firmName: lastOrder.firm_name || '',
        gstNo: lastOrder.customer_gst_no || lastOrder.gst_number || '',
        country: lastOrder.customer_country || '',
        address: lastOrder.customer_address || '',
        city: lastOrder.customer_city || '',
        state: lastOrder.customer_state || '',
        postcode: lastOrder.customer_postcode || '',
        email: lastOrder.customer_email || '',
        phone: lastOrder.customer_phone || '',
        company: lastOrder.company || ''
      }
    })
  } catch (error) {
    console.error('Error fetching last order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order information' },
      { status: 500 }
    )
  }
}
