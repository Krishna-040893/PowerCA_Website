import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {createAdminClient  } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // First, get the user's affiliate profile
    const { data: affiliateProfile, error: profileError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !affiliateProfile) {
      // User hasn't created an affiliate profile yet
      return NextResponse.json({
        hasReferred: false,
        referralCount: 0,
        referredDetails: null,
        canRefer: false,
        message: 'Please complete your affiliate profile first'
      })
    }

    // Check if affiliate has made any referrals (ALL statuses)
    const { data: referrals, error: referralError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_profile_id', affiliateProfile.id)
      .order('created_at', { ascending: false })

    if (referralError) {
      console.error('Error fetching referrals:', referralError)
      return NextResponse.json({
        hasReferred: false,
        referralCount: 0,
        referredDetails: null,
        canRefer: true
      })
    }

    const hasReferred = referrals && referrals.length > 0
    const referralCount = referrals?.length || 0
    const referredDetails = hasReferred ? referrals[0] : null

    // Count referrals by status
    const pendingCount = referrals?.filter(r => r.status === 'pending').length || 0
    const completedCount = referrals?.filter(r => r.status === 'completed' || r.status === 'converted').length || 0

    // Affiliates can make unlimited referrals
    const canRefer = true

    // Also get payment referral details if available
    let paymentDetails = null
    if (referredDetails) {
      const { data: paymentRef } = await supabase
        .from('payment_referrals')
        .select('*')
        .eq('affiliate_profile_id', affiliateProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (paymentRef) {
        paymentDetails = paymentRef
      }
    }

    const response = {
      success: true,
      hasReferred,
      referralCount,
      pendingCount,
      completedCount,
      referredDetails: referredDetails ? {
        ...referredDetails,
        payment: paymentDetails
      } : null,
      canRefer,
      affiliateProfile: {
        id: affiliateProfile.id,
        referral_code: affiliateProfile.referral_code,
        total_referrals: affiliateProfile.total_referrals || 0,
        successful_referrals: affiliateProfile.successful_referrals || 0,
        pending_referrals: affiliateProfile.pending_referrals || 0,
        status: affiliateProfile.status
      },
      message: hasReferred
        ? `You have ${referralCount} total referrals (${pendingCount} pending, ${completedCount} completed)`
        : 'You can refer multiple customers to Power CA'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching referral status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch referral status',
        hasReferred: false,
        referralCount: 0,
        canRefer: false
      },
      { status: 500 }
    )
  }
}