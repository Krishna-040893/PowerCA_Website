import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { logger } from '@/lib/logger'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, firmName, userCount, message } = body

    // Validate required fields
    if (!name || !email || !phone || !firmName || !userCount) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Save to database
    const supabase = createAdminClient()
    const { data: inquiry, error: dbError } = await supabase
      .from('enterprise_inquiries')
      .insert({
        name,
        email,
        phone,
        firm_name: firmName,
        user_count: parseInt(userCount, 10),
        message: message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Failed to save enterprise inquiry', dbError)
      // Continue with email even if DB fails
    }

    // Send email to admin (contact@powerca.in)
    if (resend) {
      try {
        await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: 'contact@powerca.in',
          subject: `New Enterprise Inquiry - ${firmName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; margin: 0; padding: 0; background: #f8f9fa; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px 25px; text-align: center; }
                .header h2 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 30px 25px; line-height: 1.6; }
                .details { background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
                .detail-row:last-child { border-bottom: none; }
                .footer { background: #f8f9ff; padding: 20px 25px; text-align: center; font-size: 14px; color: #7f8c8d; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>New Enterprise Inquiry</h2>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Large Practitioner Plan Request</p>
                </div>
                <div class="content">
                  <div class="details">
                    <div class="detail-row">
                      <span><strong>Name:</strong></span>
                      <span>${name}</span>
                    </div>
                    <div class="detail-row">
                      <span><strong>Email:</strong></span>
                      <span><a href="mailto:${email}">${email}</a></span>
                    </div>
                    <div class="detail-row">
                      <span><strong>Phone:</strong></span>
                      <span><a href="tel:${phone}">${phone}</a></span>
                    </div>
                    <div class="detail-row">
                      <span><strong>Firm Name:</strong></span>
                      <span>${firmName}</span>
                    </div>
                    <div class="detail-row">
                      <span><strong>Expected Users:</strong></span>
                      <span><strong>${userCount}</strong></span>
                    </div>
                    ${message ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ecf0f1;">
                      <strong>Message:</strong>
                      <p style="margin: 10px 0 0 0;">${message}</p>
                    </div>
                    ` : ''}
                  </div>
                  <p style="text-align: center; margin-top: 20px;">
                    <a href="mailto:${email}" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600;">Reply to ${name}</a>
                  </p>
                </div>
                <div class="footer">
                  <p>This inquiry was submitted from the PowerCA Pricing page.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })

        // Send confirmation email to user
        await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: email,
          subject: 'Thank you for your Enterprise Inquiry - PowerCA',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; margin: 0; padding: 0; background: #f8f9fa; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px 25px; text-align: center; }
                .header h2 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 30px 25px; line-height: 1.6; }
                .footer { background: #f8f9ff; padding: 20px 25px; text-align: center; font-size: 14px; color: #7f8c8d; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Thank You for Your Interest!</h2>
                </div>
                <div class="content">
                  <p>Dear <strong>${name}</strong>,</p>
                  <p>Thank you for your interest in PowerCA's Enterprise/Large Practitioner plan!</p>
                  <p>We have received your inquiry for <strong>${userCount} users</strong> at <strong>${firmName}</strong>.</p>
                  <p>Our team will review your requirements and get back to you within <strong>24 hours</strong> with a custom pricing proposal tailored to your needs.</p>
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                    <h4 style="margin: 0 0 10px 0; color: #0369a1;">What happens next?</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>Our enterprise team will review your requirements</li>
                      <li>We'll prepare a custom pricing proposal</li>
                      <li>You'll receive a call/email within 24 hours</li>
                      <li>Schedule a demo at your convenience</li>
                    </ul>
                  </div>
                  <p>If you have any urgent questions, feel free to contact us at:</p>
                  <p>
                    <strong>Email:</strong> <a href="mailto:contact@powerca.in">contact@powerca.in</a><br>
                    <strong>Phone:</strong> +91-XXXXXXXXXX
                  </p>
                  <p>Best Regards,<br><strong>The PowerCA Team</strong></p>
                </div>
                <div class="footer">
                  <p>&copy; 2024 PowerCA - Complete CA Practice Management Solution</p>
                </div>
              </div>
            </body>
            </html>
          `
        })

        logger.info('Enterprise inquiry emails sent successfully', { email, firmName })
      } catch (emailError) {
        logger.error('Failed to send enterprise inquiry emails', emailError)
        // Don't fail if email fails - the inquiry is saved
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry?.id
    })

  } catch (error) {
    logger.error('Enterprise inquiry error', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch all inquiries (for admin)
export async function GET(req: NextRequest) {
  try {
    // Check for admin auth (you might want to add proper auth here)
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: inquiries, error } = await supabase
      .from('enterprise_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch enterprise inquiries', error)
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
    }

    return NextResponse.json({ success: true, inquiries })
  } catch (error) {
    logger.error('Error fetching enterprise inquiries', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
