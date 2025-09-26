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
        <title>Demo Booking Confirmation - PowerCA</title>
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
            <p>Your PowerCA demo has been scheduled</p>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for booking a demo with PowerCA! We're excited to show you how our practice management software can transform your CA practice.</p>
            
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
              <a href="https://powerca.in" class="button">Visit PowerCA Website</a>
            </div>
            
            <p>If you need to reschedule or have any questions, please feel free to contact us at:</p>
            <p>📧 Email: support@powerca.in<br>
            📞 Phone: +91 9629514635</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PowerCA - Practice Management Software for CAs</p>
            <p>TBS Technologies, Udumalpet, Tamil Nadu</p>
          </div>
        </div>
      </body>
    </html>
  `

  // Send confirmation email to the user
  try {
    const _emailResult = await resend.emails.send({
      from: 'PowerCA <onboarding@resend.dev>',
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
    const _teamEmailResult = await resend.emails.send({
      from: 'PowerCA Bookings <onboarding@resend.dev>',
      to: 'contact@powerca.in',
      subject: `New Demo Booking - ${name} - ${date} at ${time}`,
      html: teamNotificationHtml,
    })
  } catch (error) {
    // Don't throw for team notification failure - silently handle error
    console.error('Failed to send team notification:', error)
  }
}