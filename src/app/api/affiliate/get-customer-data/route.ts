import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ref = searchParams.get('ref')
    const cus = searchParams.get('cus')

    if (!ref) {
      return NextResponse.json({
        success: false,
        error: 'Missing referral code'
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Build query - get customer data from affiliate_referrals table
    let query = supabase
      .from('affiliate_referrals')
      .select(`
        referred_name,
        referred_email,
        referred_phone,
        status,
        referral_code,
        customer_id
      `)
      .eq('referral_code', ref)

    // If customer_id is provided, filter by it
    if (cus) {
      query = query.eq('customer_id', cus)
    }

    // Get the most recent pending referral
    query = query
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    const { data: referrals, error: referralError } = await query

    if (referralError) {
      console.error('❌ [Get Customer Data API] Database error:', referralError)
      return NextResponse.json({
        success: false,
        error: 'Database query failed'
      }, { status: 500 })
    }

    if (!referrals || referrals.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Referral not found or already used'
      }, { status: 404 })
    }

    const referral = referrals[0]

    // Get customer data directly from affiliate_referrals table
    const customerName = referral.referred_name || ''
    const customerEmail = referral.referred_email || ''
    const customerPhone = referral.referred_phone || ''

    return NextResponse.json({
      success: true,
      customerData: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      }
    })
  } catch (error) {
    console.error('❌ [Get Customer Data API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customer data'
    }, { status: 500 })
  }
}
