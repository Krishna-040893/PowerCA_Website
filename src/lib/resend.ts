import {Resend  } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export interface BookingEmailData {
  name: string
  email: string
  phone: string
  firmName?: string
  date: string
  time: string
  message?: string
}

export const sendBookingConfirmationEmail = async (data: BookingEmailData) => {
  const { name, email, phone, firmName, date, time, message } = data

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Demo Booking Confirmation - Power CA</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D91EB 0%, #1BAF69 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #1D91EB 0%, #1BAF69 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Demo Booking Confirmed!</h1>
            <p>Your Power CA demo has been scheduled</p>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for booking a demo with Power CA! We're excited to show you how our practice management software can transform your CA practice.</p>
            
            <div class="booking-details">
              <h2 style="color: #1D91EB; margin-bottom: 20px;">Booking Details</h2>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${date}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${time}</span>
              </div>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${name}</span>
              </div>
              ${firmName ? `
              <div class="detail-row">
                <span class="label">Firm Name:</span>
                <span class="value">${firmName}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${phone}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              ${message ? `
              <div class="detail-row">
                <span class="label">Message:</span>
                <span class="value">${message}</span>
              </div>
              ` : ''}
            </div>
            
            <h3 style="color: #1D91EB;">What to Expect:</h3>
            <ul>
              <li>A personalized demo tailored to your practice needs</li>
              <li>Overview of key features and modules</li>
              <li>Q&A session to address your specific requirements</li>
              <li>Special pricing and offers discussion</li>
            </ul>
            
            <p>Our team will connect with you 15 minutes before the scheduled time to share the meeting link.</p>
            
            <div style="text-align: center;">
              <a href="https://powerca.in" class="button">Visit Power CA Website</a>
            </div>
            
            <p>If you need to reschedule or have any questions, please feel free to contact us at:</p>
            <p>📧 Email: contact@powerca.in<br>
            📞 Phone: +91 9629514635</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Power CA - Practice Management Software for CAs</p>
            <p>TBS Technologies, Udumalpet, Tamil Nadu</p>
          </div>
        </div>
      </body>
    </html>
  `

  const fromEmail = process.env.EMAIL_FROM || 'contact@powerca.in'

  // Send confirmation email to the user
  try {
    await resend.emails.send({
      from: `Power CA <${fromEmail}>`,
      to: email,
      subject: `Demo Booking Confirmed - ${date} at ${time}`,
      html: emailHtml,
    })
  } catch (error) {
    throw error
  }

  // Send notification email to the team
  const teamNotificationHtml = `
    <h2>New Demo Booking Request</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    ${firmName ? `<p><strong>Firm Name:</strong> ${firmName}</p>` : ''}
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
    ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
  `

  try {
    await resend.emails.send({
      from: `Power CA Bookings <${fromEmail}>`,
      to: ['contact@powerca.in', 'tbsindiaudt@gmail.com'],
      subject: `New Demo Booking - ${name} - ${date} at ${time}`,
      html: teamNotificationHtml,
    })
  } catch (error) {
    // Don't throw for team notification failure - silently handle error
    console.error('Failed to send team notification:', error)
  }
}

export interface AffiliateApprovalEmailData {
  name: string
  email: string
  referralCode: string
  affiliateLoginUrl: string
}

export interface ReferralLinkEmailData {
  customerName: string
  customerEmail: string
  affiliateName: string
  referralCode: string
  referralLink: string
  firmName?: string
  customerId?: string
}

export const sendReferralLinkEmail = async (data: ReferralLinkEmailData) => {
  const { customerName, customerEmail, affiliateName, referralCode, referralLink, firmName, customerId } = data

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Power CA Special Referral - Exclusive Access</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D91EB 0%, #1BAF69 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .referral-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .referral-link-box { background: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #1D91EB; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .referral-link { font-size: 14px; color: #1D91EB; word-break: break-all; margin: 15px 0; padding: 15px; background: #F0F9FF; border-radius: 6px; font-family: 'Courier New', monospace; }
          .button { display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #1D91EB 0%, #1BAF69 100%); color: white !important; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .info-box { background: #E0F2FE; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1D91EB; }
          .benefits-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Special Invitation from ${affiliateName}</h1>
            <p style="font-size: 16px;">Exclusive Access to Power CA Practice Management Software</p>
          </div>

          <div class="content">
            <div class="referral-badge">✨ REFERRED BY ${affiliateName}</div>

            <p>Dear ${customerName},</p>

            <p>${affiliateName} has recommended Power CA Practice Management Software for ${firmName || 'your firm'}. As a valued referral, you're invited to explore how Power CA can transform your CA practice.</p>

            <div class="referral-link-box">
              <h3 style="margin: 0 0 15px 0; color: #1D91EB;">Your Exclusive Referral Link</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">Click the button below to get started with special benefits</p>
              <div class="referral-link">${referralLink}</div>
              <a href="${referralLink}" class="button">Get Started with Power CA →</a>
              <p style="margin: 15px 0 0 0; font-size: 11px; color: #888;">
                Referral Code: <strong>${referralCode}</strong>
                ${customerId ? ` | Customer ID: <strong>${customerId}</strong>` : ''}
              </p>
            </div>

            <div class="benefits-list">
              <h3 style="color: #1D91EB; margin-top: 0;">Why Power CA?</h3>
              <ul style="padding-left: 20px;">
                <li><strong>Complete Practice Management</strong> - Client, tax, billing & more in one platform</li>
                <li><strong>Automated Compliance</strong> - Never miss a deadline with smart reminders</li>
                <li><strong>Secure Document Storage</strong> - Cloud-based with enterprise security</li>
                <li><strong>Real-time Collaboration</strong> - Work seamlessly with your team</li>
                <li><strong>GST & Invoice Management</strong> - Automated calculations and reports</li>
              </ul>
            </div>

            <div class="info-box">
              <h4 style="margin-top: 0;">📅 Book a Personalized Demo</h4>
              <p style="margin-bottom: 0;">Our team will walk you through Power CA's features tailored to your practice needs. Click the link above to schedule your demo and explore special referral benefits!</p>
            </div>

            <p style="margin-top: 30px;">Thank you for considering Power CA. We're committed to helping CA practices like yours work smarter and grow faster.</p>

            <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; font-size: 14px;"><strong>💡 Important:</strong> Use the referral link above to ensure you receive all referral benefits and special pricing.</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="margin-bottom: 10px;">Questions? We're here to help!</p>
              <p style="margin: 5px 0;">
                📧 <a href="mailto:contact@powerca.in" style="color: #1D91EB;">contact@powerca.in</a><br>
                📞 <a href="tel:+919629514635" style="color: #1D91EB;">+91 9629514635</a>
              </p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Power CA - Practice Management Software for CAs</strong></p>
            <p>© ${new Date().getFullYear()} TBS Technologies, Udumalpet, Tamil Nadu</p>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
              You received this referral from ${affiliateName}. This is a one-time invitation.<br>
              For support, contact us at <a href="mailto:contact@powerca.in" style="color: #1D91EB;">contact@powerca.in</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const fromEmail = process.env.EMAIL_FROM || 'contact@powerca.in'

    const emailResult = await resend.emails.send({
      from: `Power CA Referrals <${fromEmail}>`,
      to: customerEmail,
      subject: `${affiliateName} recommends Power CA for ${firmName || 'your practice'} - Exclusive Access`,
      html: emailHtml,
    })

    return { success: true, data: emailResult }
  } catch (error) {
    console.error('❌ Failed to send referral link email:', error)
    return { success: false, error }
  }
}

export const sendAffiliateApprovalEmail = async (data: AffiliateApprovalEmailData) => {
  const { name, email, referralCode, affiliateLoginUrl } = data

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Affiliate Application Approved - Power CA</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1D91EB 0%, #1BAF69 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10B981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .referral-code { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #1D91EB; }
          .referral-code-value { font-size: 28px; font-weight: bold; color: #1D91EB; font-family: 'Courier New', monospace; letter-spacing: 2px; }
          .info-box { background: #E0F2FE; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1D91EB; }
          .button { display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #1D91EB 0%, #1BAF69 100%); color: white !important; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button:hover { transform: translateY(-2px); box-shadow: 0 6px 8px rgba(0,0,0,0.15); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; padding-top: 20px; border-top: 1px solid #ddd; }
          .benefits-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefits-list li { padding: 8px 0; }
          .highlight { color: #1D91EB; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="font-size: 18px;">Your Affiliate Application Has Been Approved</p>
          </div>

          <div class="content">
            <div class="success-badge">✓ APPROVED</div>

            <p>Dear ${name},</p>

            <p>We're thrilled to welcome you to the <strong>Power CA Affiliate Program</strong>! Your application has been carefully reviewed and approved by our team.</p>

            <div class="referral-code">
              <p style="margin: 0; font-size: 14px; color: #666;">Your Unique Referral Code</p>
              <p class="referral-code-value">${referralCode}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #888;">Share this code with your clients and network</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #1D91EB;">🚀 Start Referring Today!</h3>
              <p style="margin-bottom: 0;">You can now start referring clients to Power CA and earn attractive commissions on every successful subscription!</p>
            </div>

            <div class="benefits-list">
              <h3 style="color: #1D91EB; margin-top: 0;">Your Affiliate Benefits:</h3>
              <ul style="list-style: none; padding-left: 0;">
                <li>✅ <span class="highlight">Generous Commission Structure</span> - Earn on every referral</li>
                <li>✅ <span class="highlight">Real-time Tracking</span> - Monitor your referrals and earnings</li>
                <li>✅ <span class="highlight">Marketing Materials</span> - Access promotional content</li>
                <li>✅ <span class="highlight">Dedicated Support</span> - Our team is here to help you succeed</li>
                <li>✅ <span class="highlight">Monthly Payouts</span> - Regular commission payments</li>
              </ul>
            </div>

            <h3 style="color: #1D91EB;">How to Get Started:</h3>
            <ol>
              <li>Click the button below to access your affiliate dashboard</li>
              <li>Share your unique referral code <strong>${referralCode}</strong> with potential clients</li>
              <li>Track your referrals and earnings in real-time</li>
              <li>Receive monthly commission payments</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${affiliateLoginUrl}" class="button">Access Affiliate Dashboard →</a>
            </div>

            <div class="info-box">
              <h4 style="margin-top: 0;">📞 Need Help?</h4>
              <p style="margin-bottom: 0;">Our affiliate support team is ready to assist you:</p>
              <p style="margin: 10px 0 0 0;">
                📧 Email: <a href="mailto:affiliates@powerca.in" style="color: #1D91EB;">affiliates@powerca.in</a><br>
                📞 Phone: <a href="tel:+919629514635" style="color: #1D91EB;">+91 9629514635</a>
              </p>
            </div>

            <p style="margin-top: 30px;">We're excited to have you as part of our affiliate network. Together, let's help more Chartered Accountants streamline their practice management!</p>

            <p style="margin-top: 20px;">Best regards,<br>
            <strong>The Power CA Team</strong></p>
          </div>

          <div class="footer">
            <p><strong>Power CA - Practice Management Software for CAs</strong></p>
            <p>© ${new Date().getFullYear()} TBS Technologies, Udumalpet, Tamil Nadu</p>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">
              You received this email because your affiliate application was approved.<br>
              For questions, contact us at <a href="mailto:contact@powerca.in" style="color: #1D91EB;">contact@powerca.in</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const fromEmail = process.env.EMAIL_FROM || 'contact@powerca.in'

    const emailResult = await resend.emails.send({
      from: `Power CA Affiliates <${fromEmail}>`,
      to: email,
      subject: '🎉 Welcome to Power CA Affiliate Program - Application Approved!',
      html: emailHtml,
    })

    return { success: true, data: emailResult }
  } catch (error) {
    console.error('❌ Failed to send affiliate approval email:', error)
    return { success: false, error }
  }
}