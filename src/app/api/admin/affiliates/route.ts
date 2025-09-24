import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Fetch all affiliate profiles with their user data
    const { data: affiliateProfiles, error: profilesError } = await supabase
      .from('affiliate_profiles')
      .select(`
        *,
        user:registrations(
          id,
          name,
          email,
          username
        )
      `)
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching affiliate profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch affiliate profiles' },
        { status: 500 }
      )
    }

    // Fetch referrals for each affiliate
    const profilesWithReferrals = await Promise.all(
      (affiliateProfiles || []).map(async (profile) => {
        const { data: referrals, error: referralsError } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('affiliate_profile_id', profile.id)
          .order('created_at', { ascending: false })

        if (referralsError) {
          console.error(`Error fetching referrals for profile ${profile.id}:`, referralsError)
        }

        return {
          ...profile,
          referrals: referrals || []
        }
      })
    )

    return NextResponse.json({
      success: true,
      affiliates: profilesWithReferrals
    })

  } catch (error) {
    console.error('Error in GET /api/admin/affiliates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update affiliate status or details
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { affiliateId, status } = body

    if (!affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Update affiliate profile
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status

    const { data, error } = await supabase
      .from('affiliate_profiles')
      .update(updateData)
      .eq('id', affiliateId)
      .select()
      .single()

    if (error) {
      console.error('Error updating affiliate:', error)
      return NextResponse.json(
        { error: 'Failed to update affiliate' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      affiliate: data
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/affiliates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}