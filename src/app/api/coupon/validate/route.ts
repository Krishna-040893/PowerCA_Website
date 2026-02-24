import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    // Trim and normalize the coupon code (case-insensitive search)
    const normalizedCode = code.trim()

    // Query the coupon_codes table
    const { data: coupon, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .ilike('code', normalizedCode)
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json(
        { success: false, error: 'This coupon code is no longer active' },
        { status: 400 }
      )
    }

    // Check validity dates
    const now = new Date()

    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json(
        { success: false, error: 'This coupon code is not yet valid' },
        { status: 400 }
      )
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json(
        { success: false, error: 'This coupon code has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json(
        { success: false, error: 'This coupon code has reached its usage limit' },
        { status: 400 }
      )
    }

    // Coupon is valid - return the discount percentage
    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercentage: parseFloat(coupon.discount_percentage),
        description: coupon.description
      }
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon code' },
      { status: 500 }
    )
  }
}
