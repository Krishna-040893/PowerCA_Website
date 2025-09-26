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
  company,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - PowerCA</title>
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
    .next-steps { background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .step { display: flex; align-items: start; margin: 15px 0; }
    .step-number { background: #1D91EB; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Successful!</h1>
      <p>Welcome to the PowerCA Family</p>
    </div>
    
    <div class="content">
      <p>Dear ${name},</p>
      
      <div class="success-badge">
        ✓ Payment Confirmed
      </div>
      
      <p>Thank you for choosing PowerCA! Your payment has been successfully processed and your account setup will begin shortly.</p>
      
      <div class="details-box">
        <h3>Transaction Details</h3>
        <div class="detail-row">
          <span>Order ID:</span>
          <strong>${orderId}</strong>
        </div>
        <div class="detail-row">
          <span>Payment ID:</span>
          <strong>${paymentId}</strong>
        </div>
        ${invoiceNumber ? `
        <div class="detail-row">
          <span>Invoice Number:</span>
          <strong>${invoiceNumber}</strong>
        </div>
        ` : ''}
        <div class="detail-row">
          <span>Amount Paid:</span>
          <strong>₹${amount.toLocaleString('en-IN')}</strong>
        </div>
        <div class="detail-row">
          <span>Plan:</span>
          <strong>PowerCA Implementation</strong>
        </div>
        <div class="detail-row">
          <span>First Year:</span>
          <strong style="color: #4CAF50;">FREE</strong>
        </div>
        ${company ? `
        <div class="detail-row">
          <span>Company:</span>
          <strong>${company}</strong>
        </div>
        ` : ''}
      </div>
      
      <div class="next-steps">
        <h3>What Happens Next?</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div>
            <strong>Account Setup (Within 24 hours)</strong><br>
            Our team will contact you to begin setting up your PowerCA account with all your requirements.
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div>
            <strong>Data Migration</strong><br>
            We'll help you migrate all your existing data seamlessly to PowerCA.
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div>
            <strong>Training Session</strong><br>
            Personalized training sessions will be scheduled for you and your team.
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div>
            <strong>Go Live!</strong><br>
            Start using PowerCA to manage your practice efficiently.
          </div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">
          Access Your Dashboard
        </a>
      </div>
      
      <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📄 GST Invoice:</strong> Your GST invoice is attached to this email. You can also download it from your dashboard.</p>
      </div>
      
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>💡 Need Help?</strong> Our support team is available 24/7.<br>
        Call: <a href="tel:+919876543210">+91 98765 43210</a> | Email: <a href="mailto:support@powerca.in">support@powerca.in</a></p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} PowerCA. All rights reserved.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms">Terms & Conditions</a> | 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy Policy</a>
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
Payment Successful - PowerCA

Dear ${name},

Your payment has been successfully processed!

Transaction Details:
- Order ID: ${orderId}
- Payment ID: ${paymentId}
${invoiceNumber ? `- Invoice Number: ${invoiceNumber}` : ''}
- Amount Paid: ₹${amount.toLocaleString('en-IN')}
- Plan: PowerCA Implementation
- First Year: FREE

What Happens Next?

1. Account Setup (Within 24 hours)
   Our team will contact you to begin setting up your PowerCA account.

2. Data Migration
   We'll help you migrate all your existing data seamlessly.

3. Training Session
   Personalized training sessions will be scheduled for you and your team.

4. Go Live!
   Start using PowerCA to manage your practice efficiently.

Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Need Help?
Call: +91 98765 43210
Email: support@powerca.in

Thank you for choosing PowerCA!

© ${new Date().getFullYear()} PowerCA. All rights reserved.
  `.trim()
}