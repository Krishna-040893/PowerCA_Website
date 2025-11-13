import {NextRequest, NextResponse  } from 'next/server'
import {createClient  } from '@supabase/supabase-js'
import {Resend  } from 'resend'
import {
  createErrorResponse,
  handleConfigurationError,
  handleDatabaseError,
  handleValidationError,
  isServiceConfigured,
  ErrorType
} from '@/lib/error-handler'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    // Initialize Supabase inside the route handler (not at module level)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Initialize Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY
    const resend = resendApiKey ? new Resend(resendApiKey) : null

    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      password,
      city,
      state,
      businessType,
      companyName,
      designation,
      experience,
      promotionMethod,
      targetAudience,
      monthlyLeads,
      accountNumber,
      ifscCode,
      panNumber,
      gstNumber,
      referredByCode // Optional: Referral code of the affiliate who referred this person
    } = body

    // Detailed validation logging
    logger.info('Affiliate registration attempt', { email, fullName, city, state })

    // Validate required fields
    if (!fullName || !email || !phone || !password || !city || !state || !promotionMethod || !targetAudience) {
      const missingFields = []
      if (!fullName) missingFields.push('fullName')
      if (!email) missingFields.push('email')
      if (!phone) missingFields.push('phone')
      if (!password) missingFields.push('password')
      if (!city) missingFields.push('city')
      if (!state) missingFields.push('state')
      if (!promotionMethod) missingFields.push('promotionMethod')
      if (!targetAudience) missingFields.push('targetAudience')

      logger.warn('Missing required fields in affiliate registration', { missingFields })
      return handleValidationError([
        `Missing required fields: ${missingFields.join(', ')}`
      ])
    }

    // Check if email is already registered as a client
    const { data: existingClient } = await supabase
      .from('registration_forms')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (existingClient) {
      logger.warn('Email already registered as client, cannot use for affiliate', { email })
      return NextResponse.json(
        { error: 'This email is already registered. Please use a different email address.' },
        { status: 400 }
      )
    }

    // Check if email already registered as affiliate
    const { data: existingRegistration } = await supabase
      .from('affiliate_registrations')
      .select('id, status')
      .eq('email', email)
      .maybeSingle()

    if (existingRegistration) {
      return NextResponse.json(
        { error: `This email already has a ${existingRegistration.status} affiliate application` },
        { status: 400 }
      )
    }

    // Hash password using bcrypt
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Validate referral code if provided
    let referrerExists = false
    if (referredByCode) {
      const { data: referrer } = await supabase
        .from('affiliate_registrations')
        .select('referral_code, status')
        .eq('referral_code', referredByCode)
        .eq('status', 'approved')
        .single()

      if (referrer) {
        referrerExists = true
      }
    }

    // Create affiliate registration with password
    const { data: registration, error: registrationError } = await supabase
      .from('affiliate_registrations')
      .insert({
        full_name: fullName,
        email,
        phone,
        password: hashedPassword, // Store hashed password
        city,
        state,
        business_type: businessType || 'individual',
        company_name: companyName,
        designation,
        experience,
        promotion_method: promotionMethod,
        target_audience: targetAudience,
        monthly_leads: monthlyLeads,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        pan_number: panNumber,
        gst_number: gstNumber,
        referred_by_code: referrerExists ? referredByCode : null, // Only store if referrer is valid
        status: 'pending'
      })
      .select()
      .single()

    if (registrationError) {
      logger.error('Error creating affiliate registration', registrationError, {
        email,
        fullName
      })
      return handleDatabaseError(registrationError)
    }

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
              <h2>New Affiliate Registration</h2>
            </div>
            <div class="content">
              <p>A new affiliate registration has been submitted.</p>

              <div class="info-row">
                <span class="label">Applicant Name:</span> ${fullName}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${email}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${phone}
              </div>
              <div class="info-row">
                <span class="label">City:</span> ${city}, ${state}
              </div>
              <div class="info-row">
                <span class="label">Business Type:</span> ${businessType || 'Individual'}
              </div>
              ${companyName ? `<div class="info-row"><span class="label">Company Name:</span> ${companyName}</div>` : ''}
              ${accountNumber ? `<div class="info-row"><span class="label">Account Number:</span> ${accountNumber}</div>` : ''}
              ${ifscCode ? `<div class="info-row"><span class="label">IFSC Code:</span> ${ifscCode}</div>` : ''}
              ${panNumber ? `<div class="info-row"><span class="label">PAN Number:</span> ${panNumber}</div>` : ''}
              <div class="info-row">
                <span class="label">Promotion Method:</span> ${promotionMethod}
              </div>
              <div class="info-row">
                <span class="label">Target Audience:</span> ${targetAudience}
              </div>

              <p style="margin-top: 20px;">Please review this registration in the admin panel.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send notification email to admin
    if (resend) {
      try {
        const adminEmailResult = await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: 'contact@powerca.in',
          subject: 'New Affiliate Registration - PowerCA',
          html: adminEmailHtml,
        })
        logger.info('Admin email sent successfully', {
          resultId: adminEmailResult.data?.id || 'sent'
        })
      } catch (emailError) {
        logger.error('Admin email sending error', emailError)
        // Don't fail the registration if email fails
      }
    } else {
      logger.warn('Resend API key not configured; skipping admin notification email')
    }

    // Send confirmation email to affiliate
    const affiliateEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to PowerCA Affiliate Program!</h1>
            </div>
            <div class="content">
              <p>Dear ${fullName},</p>

              <p>Thank you for applying to the PowerCA Affiliate Program! We're excited to have you on board.</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #1e40af;">Application Status: Under Review</h3>
                <p style="margin-bottom: 0;">Our team will review your application within 3-5 business days. You will receive an email notification once your application is approved.</p>
              </div>

              <h3 style="color: #1e40af;">Your Registration Details:</h3>
              <ul style="background: white; padding: 20px; border-radius: 4px;">
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>City:</strong> ${city}, ${state}</li>
                <li><strong>Business Type:</strong> ${businessType || 'Individual'}</li>
              </ul>

              <h3 style="color: #1e40af;">What's Next?</h3>
              <ol>
                <li>Our team will review your application</li>
                <li>You'll receive an approval email with your unique referral code</li>
                <li>Once approved, you can login to your affiliate dashboard</li>
                <li>Start referring clients and earn 10% commission!</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://powerca.in/affiliate-login" class="button">Login to Your Account</a>
              </div>

              <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                If you have any questions, please contact us at <a href="mailto:contact@powerca.in">contact@powerca.in</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    if (resend) {
      try {
        const affiliateEmailResult = await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: email,
          subject: 'Welcome to PowerCA Affiliate Program - Application Received',
          html: affiliateEmailHtml,
        })
        logger.info('Affiliate confirmation email sent successfully', {
          resultId: affiliateEmailResult.data?.id || 'sent'
        })
      } catch (emailError) {
        logger.error('Affiliate email sending error', emailError)
        // Don't fail the registration if email fails
      }
    } else {
      logger.warn('Resend API key not configured; skipping affiliate confirmation email')
    }

    logger.info('Affiliate registration successful', { registrationId: registration.id, email })

    return NextResponse.json({
      success: true,
      message: 'Affiliate registration submitted successfully!',
      registrationId: registration.id
    })

  } catch (error) {
    logger.error('Fatal error submitting affiliate application', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
