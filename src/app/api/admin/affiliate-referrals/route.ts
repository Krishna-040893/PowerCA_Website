import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = req.nextUrl.searchParams
    const affiliateId = searchParams.get('affiliateId')

    // First, get all affiliate registrations to use as a lookup
    const { data: affiliateRegs, error: regError } = await supabase
      .from('affiliate_registrations')
      .select('affiliate_id, full_name, email, company_name, referral_code')

    if (regError) {
      logger.error('Failed to fetch affiliate registrations', regError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch affiliate data' },
        { status: 500 }
      )
    }

    // Create a lookup map by affiliate_id
    const affiliateMap = new Map<string, Record<string, unknown>>()
    affiliateRegs?.forEach((reg: Record<string, unknown>) => {
      if (reg.affiliate_id) {
        affiliateMap.set(reg.affiliate_id as string, reg)
      }
    })

    // Get all affiliate referrals
    let query = supabase
      .from('affiliate_referrals')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by specific affiliate if provided
    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId)
    }

    const { data: referrals, error } = await query

    if (error) {
      logger.error('Failed to fetch affiliate referrals', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch referrals' },
        { status: 500 }
      )
    }

    // Group referrals by affiliate
    const groupedByAffiliate: Record<string, Record<string, unknown>> = {}

    referrals?.forEach((referral: Record<string, unknown>) => {
      const affId = referral.affiliate_id as string

      // Get affiliate details from the map
      const affiliateInfo = affiliateMap.get(affId) || {}

      if (!groupedByAffiliate[affId]) {
        groupedByAffiliate[affId] = {
          affiliate_id: affId,
          affiliate_name: affiliateInfo.full_name || 'Unknown',
          affiliate_email: affiliateInfo.email || '',
          affiliate_company: affiliateInfo.company_name || '',
          referral_code: referral.referral_code,
          referrals: [],
          stats: {
            total: 0,
            pending: 0,
            completed: 0,
            converted: 0,
          }
        }
      }

      groupedByAffiliate[affId].referrals.push(referral)
      groupedByAffiliate[affId].stats.total++

      if (referral.status === 'pending') groupedByAffiliate[affId].stats.pending++
      if (referral.status === 'completed') groupedByAffiliate[affId].stats.completed++
      if (referral.status === 'converted') groupedByAffiliate[affId].stats.converted++
    })

    const result = Object.values(groupedByAffiliate)

    return NextResponse.json({
      success: true,
      data: result,
      totalReferrals: referrals?.length || 0
    })

  } catch (error) {
    logger.error('Error in affiliate referrals API', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
