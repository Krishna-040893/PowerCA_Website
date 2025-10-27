import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const resend = new Resend(process.env.RESEND_API_KEY)

// Create Supabase client with service role key for bypassing RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Function to send notification email to admin
async function sendAdminNotification(subscriberEmail: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.in>',
      to: 'contact@powerca.in',
      subject: 'New Newsletter Subscriber',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #144fed; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">New Newsletter Subscriber</h1>
            </div>

            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                A new user has subscribed to the PowerCA newsletter!
              </p>

              <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #144fed;">
                <h2 style="color: #144fed; margin-top: 0;">Subscriber Details</h2>
                <p style="margin: 10px 0;">
                  <strong>Email:</strong> ${subscriberEmail}
                </p>
                <p style="margin: 10px 0;">
                  <strong>Source:</strong> Website Footer
                </p>
                <p style="margin: 10px 0;">
                  <strong>Subscribed At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>

              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                You can manage newsletter subscribers from the admin panel.
              </p>
            </div>

            <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
              <p>PowerCA - Complete CA Practice Management Solution</p>
              <p>© ${new Date().getFullYear()} TBS Technologies [P] Limited. All rights reserved.</p>
            </div>
          </body>
        </html>
      `
    })
    console.log('✅ Admin notification email sent for new subscriber:', subscriberEmail)
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error)
    // Don't throw error - we still want to save the subscription even if email fails
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, is_active, unsubscribed_at')
      .eq('email', normalizedEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected for new subscribers
      console.error('Error checking existing subscriber:', checkError)
      return NextResponse.json(
        { error: 'An error occurred while processing your subscription' },
        { status: 500 }
      )
    }

    // If subscriber exists
    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('email', normalizedEmail)

        if (updateError) {
          console.error('Error reactivating subscription:', updateError)
          return NextResponse.json(
            { error: 'An error occurred while reactivating your subscription' },
            { status: 500 }
          )
        }

        return NextResponse.json(
          {
            message: 'Welcome back! Your subscription has been reactivated successfully',
            email: normalizedEmail
          },
          { status: 200 }
        )
      }
    }

    // Create new subscription
    const { data, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: normalizedEmail,
          source: 'footer',
          is_active: true,
          subscribed_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      return NextResponse.json(
        { error: 'An error occurred while subscribing. Please try again later' },
        { status: 500 }
      )
    }

    // Send notification email to admin (async, don't wait for it)
    sendAdminNotification(normalizedEmail).catch(err =>
      console.error('Error sending admin notification:', err)
    )

    return NextResponse.json(
      {
        message: 'Thank you for subscribing! You will receive our latest updates and news',
        email: normalizedEmail
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error in newsletter subscription:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later' },
      { status: 500 }
    )
  }
}
