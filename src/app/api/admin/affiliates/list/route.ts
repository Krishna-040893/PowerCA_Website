import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {createAdminClient  } from '@/lib/supabase/admin'
import {createErrorResponse, ErrorType, handleDatabaseError  } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get all users with Affiliate role from registrations
    const { data: affiliateUsers, error: usersError } = await supabase
      .from('registrations')
      .select('*')
      .eq('role', 'Affiliate')
      .order('created_at', { ascending: false })

    if (usersError) {
      return handleDatabaseError(usersError)
    }

    if (!affiliateUsers || affiliateUsers.length === 0) {
      return NextResponse.json({
        success: true,
        affiliates: [],
        source: 'no_affiliates'
      })
    }

    // Get affiliate profiles for these users
    const userIds = affiliateUsers.map(u => u.id)

    const { data: affiliateProfiles, error: profilesError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .in('user_id', userIds)

    // Create a map of profiles for easy lookup
    const profilesMap = new Map()
    if (affiliateProfiles && !profilesError) {
      affiliateProfiles.forEach(profile => {
        profilesMap.set(profile.user_id, profile)
      })
    }

    // Map affiliate users with their profiles
    const mappedAffiliates = affiliateUsers.map(user => {
      const profile = profilesMap.get(user.id)

      return {
        id: user.id,
        affiliate_id: user.affiliate_id || profile?.affiliate_id || `AFF-${user.id?.substring(0, 6).toUpperCase()}`,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        username: user.username || 'N/A',
        phone: user.phone || 'N/A',
        firm_name: profile?.firm_name || user.firm_name || 'Not specified',
        firm_address: profile?.firm_address || 'Not specified',
        contact_person: profile?.contact_person || user.name || 'N/A',
        referral_code: profile?.referral_code || null,
        commission_rate: profile?.commission_rate || 10.00,
        total_referrals: profile?.total_referrals || 0,
        successful_referrals: profile?.successful_referrals || 0,
        total_commission: profile?.total_commission || 0,
        status: profile?.status || user.affiliate_status || 'active',
        has_profile: !!profile,
        profile_complete: profile && profile.firm_name && profile.firm_address,
        created_at: user.created_at,
        approved_at: profile?.approved_at || user.updated_at
      }
    })

    return NextResponse.json({
      success: true,
      affiliates: mappedAffiliates,
      total_users: affiliateUsers.length,
      total_profiles: affiliateProfiles?.length || 0,
      source: 'combined'
    })

  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}