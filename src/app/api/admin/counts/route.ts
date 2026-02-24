import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

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
          approvedAffiliates: 0,
          referrals: 0,
          pendingPayments: 0,
          affiliatePayments: 0,
          payments: 0,
          paymentOrders: 0,
          newsletterSubscribers: 0,
          blogPosts: 0,
          enterpriseInquiries: 0
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
      approvedAffiliatesResult,
      referralsResult,
      pendingPaymentsResult,
      paymentEmailsResult,
      paymentOrderEmailsResult,
      newsletterSubscribersResult,
      blogPostsResult,
      affiliateReferralsResult,
      paidPaymentsResult,
      enterpriseInquiriesResult
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

      // Approved affiliates count
      supabase
        .from('affiliate_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),

      // Total affiliate referrals count
      supabase
        .from('affiliate_referrals')
        .select('id', { count: 'exact', head: true }),

      // Pending payments count from database (unpaid commissions)
      supabase
        .from('affiliate_referral_payments')
        .select('referral_id, commission_paid'),

      // Fetch emails from payments table to count unique customers
      supabase
        .from('payments')
        .select('email'),

      // Fetch emails from payment_orders table to count unique customers
      supabase
        .from('payment_orders')
        .select('customer_email'),

      // Total newsletter subscribers count (active subscribers)
      supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total blog posts count
      supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true }),

      // Fetch affiliate referrals with referred emails for email matching
      supabase
        .from('affiliate_referrals')
        .select('id, referred_email, affiliate_id'),

      // Fetch paid payments with emails for affiliate payment matching
      supabase
        .from('payments')
        .select('email')
        .in('status', ['captured', 'paid', 'authorized', 'success']),

      // Total enterprise inquiries count
      supabase
        .from('enterprise_inquiries')
        .select('id', { count: 'exact', head: true })
    ])

    // Count unique customers for payments (by email)
    let paymentsUniqueCustomers = 0
    if (paymentEmailsResult.status === 'fulfilled' && paymentEmailsResult.value.data) {
      const uniqueEmails = new Set(
        paymentEmailsResult.value.data
          .map(p => p.email?.toLowerCase())
          .filter(Boolean)
      )
      paymentsUniqueCustomers = uniqueEmails.size
    }

    // Count unique customers for payment orders (by customer_email)
    let paymentOrdersUniqueCustomers = 0
    if (paymentOrderEmailsResult.status === 'fulfilled' && paymentOrderEmailsResult.value.data) {
      const uniqueEmails = new Set(
        paymentOrderEmailsResult.value.data
          .map(p => p.customer_email?.toLowerCase())
          .filter(Boolean)
      )
      paymentOrdersUniqueCustomers = uniqueEmails.size
    }

    // Calculate pending affiliate payments including email-matched ones
    let pendingPaymentsCount = 0

    // Get existing payment records
    const existingPayments = pendingPaymentsResult.status === 'fulfilled'
      ? (pendingPaymentsResult.value.data || [])
      : []

    // Get referral IDs that have payment records
    const referralIdsWithPayments = new Set(
      existingPayments.map((p: { referral_id: string }) => p.referral_id)
    )

    // Count pending payments from existing records
    const pendingFromDb = existingPayments.filter(
      (p: { commission_paid: boolean }) => !p.commission_paid
    ).length

    // Count email-matched payments (referrals with paid payments but no payment record)
    let emailMatchedCount = 0
    if (affiliateReferralsResult.status === 'fulfilled' &&
        paidPaymentsResult.status === 'fulfilled' &&
        affiliateReferralsResult.value.data &&
        paidPaymentsResult.value.data) {

      // Create set of paid customer emails
      const paidEmails = new Set(
        paidPaymentsResult.value.data
          .map((p: { email: string }) => p.email?.toLowerCase())
          .filter(Boolean)
      )

      // Count referrals where customer paid but no payment record exists
      affiliateReferralsResult.value.data.forEach((ref: { id: string; referred_email: string; affiliate_id: string }) => {
        if (ref.referred_email &&
            paidEmails.has(ref.referred_email.toLowerCase()) &&
            !referralIdsWithPayments.has(ref.id)) {
          emailMatchedCount++
        }
      })
    }

    pendingPaymentsCount = pendingFromDb + emailMatchedCount

    // Calculate total affiliate payments (count unique affiliates who have paid referral customers)
    let totalAffiliatePayments = 0
    if (affiliateReferralsResult.status === 'fulfilled' &&
        paidPaymentsResult.status === 'fulfilled' &&
        affiliateReferralsResult.value.data &&
        paidPaymentsResult.value.data) {

      const paidEmails = new Set(
        paidPaymentsResult.value.data
          .map((p: { email: string }) => p.email?.toLowerCase())
          .filter(Boolean)
      )

      // Collect unique affiliate IDs that have at least one paid referral customer
      const uniqueAffiliateIds = new Set<string>()
      affiliateReferralsResult.value.data.forEach((ref: { id: string; referred_email: string; affiliate_id: string }) => {
        if (ref.referred_email && ref.affiliate_id && paidEmails.has(ref.referred_email.toLowerCase())) {
          uniqueAffiliateIds.add(ref.affiliate_id)
        }
      })
      totalAffiliatePayments = uniqueAffiliateIds.size
    }

    const counts = {
      bookings: bookingsResult.status === 'fulfilled' ? (bookingsResult.value.count || 0) : 0,
      registrations: registrationsResult.status === 'fulfilled' ? (registrationsResult.value.count || 0) : 0,
      affiliates: affiliatesResult.status === 'fulfilled' ? (affiliatesResult.value.count || 0) : 0,
      pendingApprovals: pendingApprovalsResult.status === 'fulfilled' ? (pendingApprovalsResult.value.count || 0) : 0,
      approvedAffiliates: approvedAffiliatesResult.status === 'fulfilled' ? (approvedAffiliatesResult.value.count || 0) : 0,
      referrals: referralsResult.status === 'fulfilled' ? (referralsResult.value.count || 0) : 0,
      pendingPayments: pendingPaymentsCount,
      affiliatePayments: totalAffiliatePayments,
      payments: paymentsUniqueCustomers,
      paymentOrders: paymentOrdersUniqueCustomers,
      newsletterSubscribers: newsletterSubscribersResult.status === 'fulfilled' ? (newsletterSubscribersResult.value.count || 0) : 0,
      blogPosts: blogPostsResult.status === 'fulfilled' ? (blogPostsResult.value.count || 0) : 0,
      enterpriseInquiries: enterpriseInquiriesResult.status === 'fulfilled' ? (enterpriseInquiriesResult.value.count || 0) : 0,
    }

    return NextResponse.json(counts)

  } catch (error) {
    logger.error('Failed to fetch admin counts:', error)
    return NextResponse.json(
      {
        bookings: 0,
        registrations: 0,
        affiliates: 0,
        pendingApprovals: 0,
        approvedAffiliates: 0,
        referrals: 0,
        pendingPayments: 0,
        affiliatePayments: 0,
        payments: 0,
        paymentOrders: 0,
        newsletterSubscribers: 0,
        blogPosts: 0,
        enterpriseInquiries: 0
      },
      { status: 200 }
    )
  }
}
