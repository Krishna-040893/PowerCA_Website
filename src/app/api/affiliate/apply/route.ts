import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, accountEmail, paymentEmail, websiteUrl, promotionMethod } = body

    if (!userId || !name || !accountEmail || !paymentEmail || !promotionMethod) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('registrations')
      .select('id, name, email, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an application
    const { data: existingApplication } = await supabase
      .from('affiliate_applications')
      .select('id, status')
      .eq('user_id', userId)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: `You already have a ${existingApplication.status} affiliate application` },
        { status: 400 }
      )
    }

    // Create affiliate application
    const { data: application, error: applicationError } = await supabase
      .from('affiliate_applications')
      .insert({
        user_id: userId,
        name,
        account_email: accountEmail,
        payment_email: paymentEmail,
        website_url: websiteUrl,
        promotion_method: promotionMethod,
        status: 'pending'
      })
      .select()
      .single()

    if (applicationError) {
      console.error('Error creating affiliate application:', applicationError)
      return NextResponse.json(
        { error: 'Failed to submit affiliate application' },
        { status: 500 }
      )
    }

    // Update user affiliate status
    await supabase
      .from('registrations')
      .update({ affiliate_status: 'applied' })
      .eq('id', userId)

    // Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Affiliate Application</h2>
            </div>
            <div class="content">
              <p>A new affiliate application has been submitted.</p>

              <div class="info-row">
                <span class="label">Applicant Name:</span> ${name}
              </div>
              <div class="info-row">
                <span class="label">Account Email:</span> ${accountEmail}
              </div>
              <div class="info-row">
                <span class="label">Payment Email:</span> ${paymentEmail}
              </div>
              <div class="info-row">
                <span class="label">Website URL:</span> ${websiteUrl || 'Not provided'}
              </div>
              <div class="info-row">
                <span class="label">Promotion Method:</span> ${promotionMethod}
              </div>

              <p style="margin-top: 20px;">Please review this application in the admin panel.</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await resend.emails.send({
        from: 'PowerCA <contact@powerca.in>',
        to: 'contact@powerca.in',
        subject: 'New Affiliate Application - PowerCA',
        html: adminEmailHtml,
      })
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the application if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate application submitted successfully!',
      applicationId: application.id
    })

  } catch (error) {
    console.error('Error submitting affiliate application:', error)
    return NextResponse.json(
      { error: 'Failed to submit affiliate application' },
      { status: 500 }
    )
  }
}