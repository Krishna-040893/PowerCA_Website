import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

export async function GET(_request: NextRequest) {
  try {
    // Verify admin authentication using NextAuth session
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          bookings: 0,
          registrations: 0,
          affiliates: 0,
          pendingApprovals: 0,
          referrals: 0,
          pendingPayments: 0,
          payments: 0,
          paymentOrders: 0,
          newsletterSubscribers: 0,
          blogPosts: 0
        },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Fetch all counts in parallel
    const [
      bookingsResult,
      registrationsResult,
      affiliatesResult,
      pendingApprovalsResult,
      referralsResult,
      pendingPaymentsResult,
      paymentsResult,
      paymentOrdersResult,
      newsletterSubscribersResult,
      blogPostsResult
    ] = await Promise.allSettled([
      // Total bookings count
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true }),

      // Total registrations count (using registration_forms table)
      supabase
        .from('registration_forms')
        .select('id', { count: 'exact', head: true }),

      // Total affiliates count (ALL statuses: pending, approved, rejected)
      supabase
        .from('affiliate_registrations')
        .select('id', { count: 'exact', head: true }),

      // Pending affiliate approvals count
      supabase
        .from('affiliate_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Total affiliate referrals count
      supabase
        .from('affiliate_referrals')
        .select('id', { count: 'exact', head: true }),

      // Pending payments count (unpaid commissions)
      supabase
        .from('affiliate_referral_payments')
        .select('id', { count: 'exact', head: true })
        .eq('commission_paid', false),

      // Total payments count (from payments table)
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true }),

      // Total payment orders count (from payment_orders table)
      supabase
        .from('payment_orders')
        .select('id', { count: 'exact', head: true }),

      // Total newsletter subscribers count (active subscribers)
      supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total blog posts count
      supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
    ])

    const counts = {
      bookings: bookingsResult.status === 'fulfilled' ? (bookingsResult.value.count || 0) : 0,
      registrations: registrationsResult.status === 'fulfilled' ? (registrationsResult.value.count || 0) : 0,
      affiliates: affiliatesResult.status === 'fulfilled' ? (affiliatesResult.value.count || 0) : 0,
      pendingApprovals: pendingApprovalsResult.status === 'fulfilled' ? (pendingApprovalsResult.value.count || 0) : 0,
      referrals: referralsResult.status === 'fulfilled' ? (referralsResult.value.count || 0) : 0,
      pendingPayments: pendingPaymentsResult.status === 'fulfilled' ? (pendingPaymentsResult.value.count || 0) : 0,
      payments: paymentsResult.status === 'fulfilled' ? (paymentsResult.value.count || 0) : 0,
      paymentOrders: paymentOrdersResult.status === 'fulfilled' ? (paymentOrdersResult.value.count || 0) : 0,
      newsletterSubscribers: newsletterSubscribersResult.status === 'fulfilled' ? (newsletterSubscribersResult.value.count || 0) : 0,
      blogPosts: blogPostsResult.status === 'fulfilled' ? (blogPostsResult.value.count || 0) : 0,
    }

    return NextResponse.json(counts)

  } catch (error) {
    console.error('Failed to fetch admin counts:', error)
    return NextResponse.json(
      {
        bookings: 0,
        registrations: 0,
        affiliates: 0,
        pendingApprovals: 0,
        referrals: 0,
        pendingPayments: 0,
        payments: 0,
        paymentOrders: 0,
        newsletterSubscribers: 0,
        blogPosts: 0
      },
      { status: 200 }
    )
  }
}
