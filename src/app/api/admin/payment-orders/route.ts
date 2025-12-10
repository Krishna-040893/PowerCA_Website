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

    // Fetch all affiliate referrals to check if payments are from referred customers
    const { data: affiliateReferrals } = await supabase
      .from('affiliate_referrals')
      .select('referred_email, referral_code, affiliate_id, customer_id')

    // Create a map of referred emails to affiliate info
    const referredEmailMap = new Map<string, { referral_code: string; affiliate_id: string; customer_id: string }>()
    affiliateReferrals?.forEach(ref => {
      if (ref.referred_email) {
        referredEmailMap.set(ref.referred_email.toLowerCase(), {
          referral_code: ref.referral_code,
          affiliate_id: ref.affiliate_id,
          customer_id: ref.customer_id
        })
      }
    })

    // Map the orders to include address data and affiliate info based on email matching
    const mappedOrders = (orders || []).map(order => {
      const addressData = order.user_addresses
      // Build location: use label first, then city only (state is common)
      const city = order.customer_city || addressData?.city

      // Check if this order's email matches any affiliate referral
      const emailKey = order.customer_email?.toLowerCase()
      const affiliateInfo = emailKey ? referredEmailMap.get(emailKey) : null

      // Determine if this is an affiliate purchase:
      // 1. Explicit is_affiliate_purchase flag, OR
      // 2. Email matches a referred customer
      const isAffiliatePurchase = order.is_affiliate_purchase || !!affiliateInfo

      return {
        ...order,
        // Use label field for location, or use city only
        location: addressData?.label || city || null,
        // Use direct fields first, fall back to joined address data
        customer_city: order.customer_city || addressData?.city || null,
        customer_state: order.customer_state || addressData?.state || null,
        customer_postcode: order.customer_postcode || addressData?.postcode || null,
        customer_country: order.customer_country || addressData?.country || null,
        // Override affiliate purchase status based on email matching
        is_affiliate_purchase: isAffiliatePurchase,
        // Add affiliate info if matched by email
        referral_code: order.referral_code || affiliateInfo?.referral_code || null,
        affiliate_id: affiliateInfo?.affiliate_id || null,
        matched_customer_id: affiliateInfo?.customer_id || null,
      }
    })

    // Group orders by email
    const groupedByEmail = new Map<string, {
      email: string;
      customer_name: string | null;
      firm_names: string[];
      company: string | null;
      customer_phone: string | null;
      gst_number: string | null;
      total_amount: number;
      total_orders: number;
      locations: string[];
      statuses: string[];
      is_affiliate_purchase: boolean;
      referral_code: string | null;
      latest_order: typeof mappedOrders[0];
      all_orders: typeof mappedOrders;
    }>()

    mappedOrders.forEach(order => {
      const emailKey = (order.customer_email || 'unknown').toLowerCase()

      if (!groupedByEmail.has(emailKey)) {
        groupedByEmail.set(emailKey, {
          email: order.customer_email,
          customer_name: order.customer_name,
          firm_names: [],
          company: order.company,
          customer_phone: order.customer_phone,
          gst_number: order.gst_number,
          total_amount: 0,
          total_orders: 0,
          locations: [],
          statuses: [],
          is_affiliate_purchase: false,
          referral_code: null,
          latest_order: order,
          all_orders: []
        })
      }

      const group = groupedByEmail.get(emailKey)!
      group.total_amount += order.amount || 0
      group.total_orders += 1
      group.all_orders.push(order)

      // Collect unique locations
      if (order.location && !group.locations.includes(order.location)) {
        group.locations.push(order.location)
      }

      // Collect unique firm names
      if (order.firm_name && !group.firm_names.includes(order.firm_name)) {
        group.firm_names.push(order.firm_name)
      }

      // Collect unique statuses
      if (order.status && !group.statuses.includes(order.status)) {
        group.statuses.push(order.status)
      }

      // Track affiliate info
      if (order.is_affiliate_purchase) {
        group.is_affiliate_purchase = true
        group.referral_code = order.referral_code || group.referral_code
      }

      // Update customer info from most recent if available
      if (order.customer_name) group.customer_name = order.customer_name
      if (order.company) group.company = order.company
      if (order.customer_phone) group.customer_phone = order.customer_phone
      if (order.gst_number) group.gst_number = order.gst_number
    })

    // Convert to array and sort by latest order date
    const groupedOrders = Array.from(groupedByEmail.values())
      .sort((a, b) => new Date(b.latest_order.created_at).getTime() - new Date(a.latest_order.created_at).getTime())
      .map(group => ({
        id: group.latest_order.id,
        customer_email: group.email,
        customer_name: group.customer_name,
        firm_names: group.firm_names,
        company: group.company,
        customer_phone: group.customer_phone,
        gst_number: group.gst_number,
        total_amount: group.total_amount,
        total_orders: group.total_orders,
        locations: group.locations,
        statuses: group.statuses,
        is_affiliate_purchase: group.is_affiliate_purchase,
        referral_code: group.referral_code,
        latest_order: group.latest_order,
        all_orders: group.all_orders,
        // Backward compatibility fields
        order_id: group.latest_order.order_id,
        amount: group.total_amount,
        currency: group.latest_order.currency,
        status: group.latest_order.status,
        created_at: group.latest_order.created_at,
        updated_at: group.latest_order.updated_at,
      }))

    return NextResponse.json({
      success: true,
      orders: groupedOrders,
      count: groupedOrders.length,
      totalRecords: mappedOrders.length,
    })
  } catch (error) {
    console.error('Error in payment-orders API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
