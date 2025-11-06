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
    // Fetch all payment orders
    const { data: orders, error } = await supabase
      .from('payment_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment orders:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0,
    })
  } catch (error) {
    console.error('Error in payment-orders API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
