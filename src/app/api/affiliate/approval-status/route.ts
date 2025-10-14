import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('🔍 [Approval Status API] Session data:', {
      hasSession: !!session,
      userName: session?.user?.name,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    })

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔍 [Approval Status API] Querying database with email:', session.user.email)

    // Get user's affiliate application status
    const { data: affiliateApp, error } = await supabase
      .from('affiliate_registrations')
      .select('status, referral_code, approved_at, rejected_at, rejection_reason, email, created_at')
      .eq('email', session.user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    console.log('🔍 [Approval Status API] Database query result:', {
      found: !!affiliateApp,
      error: error?.message,
      data: affiliateApp
    })

    if (error) {
      console.log('❌ [Approval Status API] No application found for email:', session.user.email)
      // No application found
      return NextResponse.json({
        status: null,
        hasApplied: false,
        message: 'No affiliate application found'
      })
    }

    console.log('✅ [Approval Status API] Found application:', {
      email: affiliateApp.email,
      status: affiliateApp.status,
      createdAt: affiliateApp.created_at
    })

    return NextResponse.json({
      status: affiliateApp.status,
      hasApplied: true,
      referralCode: affiliateApp.referral_code,
      approvedAt: affiliateApp.approved_at,
      rejectedAt: affiliateApp.rejected_at,
      rejectionReason: affiliateApp.rejection_reason
    })

  } catch (error) {
    console.error('Error checking affiliate approval status:', error)
    return NextResponse.json(
      { error: 'Failed to check approval status' },
      { status: 500 }
    )
  }
}
