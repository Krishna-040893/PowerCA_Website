import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { SubscriptionRenewalAvailableEmail } from '@/lib/email-templates/subscription-renewal-available'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job or authorized request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Get all launch offer subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*, users:user_id(id, name, email)')
      .in('plan', ['launch_offer', 'first_year'])
      .eq('status', 'ACTIVE')

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found',
        emailsSent: 0
      })
    }

    const now = new Date()
    const eligibleUsers: Array<{ name: string; email: string; subscriptionStartDate: string }> = []

    // Check each subscription for 11-month eligibility
    for (const subscription of subscriptions) {
      const subscriptionStart = new Date(subscription.current_period_start || subscription.created_at)
      const elevenMonthsLater = new Date(subscriptionStart)
      elevenMonthsLater.setMonth(elevenMonthsLater.getMonth() + 11)

      // Check if user has completed 11 months and hasn't been notified yet
      if (now >= elevenMonthsLater) {
        // Check if we've already sent renewal notification
        const { data: existingNotification } = await supabase
          .from('renewal_notifications')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('subscription_id', subscription.id)
          .eq('notification_type', '11_month_renewal')
          .single()

        // Only send if notification hasn't been sent before
        if (!existingNotification && subscription.users) {
          const userData = Array.isArray(subscription.users) ? subscription.users[0] : subscription.users
          eligibleUsers.push({
            name: userData.name || 'Valued Customer',
            email: userData.email,
            subscriptionStartDate: subscriptionStart.toISOString()
          })
        }
      }
    }

    let emailsSent = 0
    const errors: string[] = []

    // Send emails to eligible users
    for (const user of eligibleUsers) {
      try {
        const renewalUrl = `${process.env.NEXTAUTH_URL || 'https://powerca.in'}/pricing`

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.in>',
          to: user.email,
          subject: '🎉 Your PowerCA Annual Subscription is Now Available!',
          html: SubscriptionRenewalAvailableEmail({
            name: user.name,
            email: user.email,
            subscriptionStartDate: user.subscriptionStartDate,
            renewalUrl
          })
        })

        // Find the subscription ID for this user
        const userSubscription = subscriptions.find(sub => {
          const userData = Array.isArray(sub.users) ? sub.users[0] : sub.users
          return userData?.email === user.email
        })

        if (userSubscription) {
          // Record that we sent the notification
          await supabase
            .from('renewal_notifications')
            .insert({
              user_id: userSubscription.user_id,
              subscription_id: userSubscription.id,
              notification_type: '11_month_renewal',
              sent_at: new Date().toISOString(),
              email_sent_to: user.email
            })
        }

        emailsSent++
        console.log(`✅ Renewal notification sent to ${user.email}`)
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${user.email}:`, emailError)
        errors.push(`Failed to send to ${user.email}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${subscriptions.length} subscriptions`,
      eligibleUsers: eligibleUsers.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in renewal eligibility check:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow GET for manual testing (with auth)
export async function GET(request: NextRequest) {
  return POST(request)
}
