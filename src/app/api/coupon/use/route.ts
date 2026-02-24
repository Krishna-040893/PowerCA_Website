import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// This endpoint is called after successful payment to increment coupon usage
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const normalizedCode = code.trim()

    // Increment usage count
    const { error } = await supabase.rpc('increment_coupon_usage', {
      coupon_code: normalizedCode
    })

    // If RPC doesn't exist, do it manually
    if (error) {
      const { error: updateError } = await supabase
        .from('coupon_codes')
        .update({ usage_count: supabase.rpc('increment', { x: 1 }) })
        .ilike('code', normalizedCode)

      if (updateError) {
        // Fallback: fetch and update
        const { data: coupon } = await supabase
          .from('coupon_codes')
          .select('usage_count')
          .ilike('code', normalizedCode)
          .single()

        if (coupon) {
          await supabase
            .from('coupon_codes')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .ilike('code', normalizedCode)
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating coupon usage:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon usage' },
      { status: 500 }
    )
  }
}
