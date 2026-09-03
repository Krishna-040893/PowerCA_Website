import * as React from 'react'

interface PaymentConfirmationEmailProps {
  name: string
  email: string
  amount: number
  orderId: string
  paymentId: string
  invoiceNumber?: string
  company?: string
}

export const PaymentConfirmationEmail: React.FC<PaymentConfirmationEmailProps> = ({
  name,
  email: _email,
  amount,
  orderId,
  paymentId,
  invoiceNumber,
  company: _company,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - Power CA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1D91EB 0%, #1976D2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
    .success-badge { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
    .details-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-row:last-child { border-bottom: none; }
    .cta-button { background: #1D91EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Successful!</h1>
      <p>Welcome to the Power CA Family</p>
    </div>
    
    <div class="content">
      <p>Dear ${name},</p>
      
      <div class="success-badge">
        ✓ Payment Confirmed
      </div>
      
      <p>Thank you for choosing Power CA! Your payment has been successfully processed and your account setup will begin shortly.</p>
      
      <div class="details-box">
        <h3>💳 PAYMENT SUMMARY</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${invoiceNumber ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555;">📋 Receipt Number</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;"><strong>${invoiceNumber}</strong></td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555;">🔗 Order ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;"><strong>${orderId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555;">💰 Payment ID</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;"><strong>${paymentId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #555;">📅 Date</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;"><strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #555;">💵 Total Amount</td>
            <td style="padding: 10px 0; text-align: right;"><strong>₹${amount.toLocaleString('en-IN')}</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>💡 Need Help?</strong> Our support team is available 24/7.<br>
        Call: <a href="tel:+919876543210">+91 98765 43210</a> | Email: <a href="mailto:contact@powerca.in">contact@powerca.in</a></p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} Power CA. All rights reserved.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/terms">Terms & Conditions</a> |
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export const PaymentConfirmationEmailText = ({
  name,
  orderId,
  paymentId,
  amount,
  invoiceNumber,
}: PaymentConfirmationEmailProps) => {
  return `
Payment Successful - Power CA

Dear ${name},

Your payment has been successfully processed!

Transaction Details:
- Order ID: ${orderId}
- Payment ID: ${paymentId}
${invoiceNumber ? `- Receipt Number: ${invoiceNumber}` : ''}
- Amount Paid: ₹${amount.toLocaleString('en-IN')}
- Plan: Power CA Implementation
- First Year: FREE

Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/dashboard

Need Help?
Call: +91 98765 43210
Email: contact@powerca.in

Thank you for choosing Power CA!

© ${new Date().getFullYear()} Power CA. All rights reserved.
  `.trim()
}