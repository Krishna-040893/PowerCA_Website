import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Fetch the next available customer ID for preview
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get ALL customer IDs to find the highest number
    const { data: allReferrals, error: fetchError } = await supabase
      .from('affiliate_referrals')
      .select('customer_id')
      .not('customer_id', 'is', null)
      .order('customer_id', { ascending: false })

    if (fetchError) {
      console.error('❌ [Next Customer ID] Error fetching customer IDs:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch customer IDs' },
        { status: 500 }
      )
    }

    // Calculate next customer ID by finding the highest number
    let nextCustomerId = 'CUS001'

    if (allReferrals && allReferrals.length > 0) {
      // Extract all numeric parts and find the maximum
      const customerNumbers = allReferrals
        .map(ref => {
          const match = ref.customer_id?.match(/^CUS(\d+)$/)
          return match ? parseInt(match[1], 10) : 0
        })
        .filter(num => num > 0)

      if (customerNumbers.length > 0) {
        const maxNumber = Math.max(...customerNumbers)
        const nextNumber = maxNumber + 1
        nextCustomerId = 'CUS' + nextNumber.toString().padStart(3, '0')
      }
    }

    return NextResponse.json({
      success: true,
      nextCustomerId
    })

  } catch (error) {
    console.error('Error fetching next customer ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
