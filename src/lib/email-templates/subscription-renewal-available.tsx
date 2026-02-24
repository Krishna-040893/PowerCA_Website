import * as React from 'react'

interface SubscriptionRenewalAvailableEmailProps {
  name: string
  email: string
  subscriptionStartDate: string
  renewalUrl: string
}

export const SubscriptionRenewalAvailableEmail: React.FC<SubscriptionRenewalAvailableEmailProps> = ({
  name,
  email: _email,
  subscriptionStartDate,
  renewalUrl,
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Annual Subscription Now Available - PowerCA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
    .highlight-box { background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
    .details-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .detail-row:last-child { border-bottom: none; }
    .cta-button { background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
    .pricing-box { background: #F5F5F5; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .pricing-option { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
    .price { font-size: 32px; font-weight: bold; color: #2E7D32; }
    .badge { background: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Great News, ${name}!</h1>
      <p>Your Annual Subscription is Now Available</p>
    </div>

    <div class="content">
      <div class="badge">11 Months Completed</div>

      <p>Dear ${name},</p>

      <p>Congratulations! You've been using PowerCA for 11 months, and we're thrilled to have you as part of our growing family.</p>

      <div class="highlight-box">
        <h3 style="margin-top: 0; color: #2E7D32;">✅ You're Now Eligible for Annual Subscription!</h3>
        <p style="margin-bottom: 0;">Your first-year plan started on <strong>${new Date(subscriptionStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, and you can now renew your subscription to continue enjoying PowerCA's comprehensive practice management features.</p>
      </div>

      <h3>Annual Subscription Pricing</h3>
      <div class="pricing-box">
        <div class="pricing-option">
          <div style="color: #666; font-size: 14px; margin-bottom: 10px;">YOUR ANNUAL TURNOVER</div>
          <div class="price">0.25%</div>
          <div style="color: #666; font-size: 14px; margin-top: 5px;">+ Applicable Taxes</div>
        </div>

        <div style="font-size: 24px; margin: 20px 0; color: #333;">OR</div>

        <div class="pricing-option">
          <div style="color: #666; font-size: 14px; margin-bottom: 10px;">MINIMUM COST</div>
          <div class="price">₹18,000</div>
          <div style="color: #666; font-size: 14px; margin-top: 5px;">+ Applicable Taxes</div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${renewalUrl}" class="cta-button">Renew Your Subscription Now</a>
      </div>

      <div class="details-box">
        <h4 style="margin-top: 0;">What You'll Continue to Get:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Easy Implementation & Training</li>
          <li>Ongoing Support & Updates</li>
          <li>Full Access to All Features</li>
          <li>Priority Customer Support</li>
        </ul>
      </div>

      <div class="highlight-box">
        <h4 style="margin-top: 0; color: #2E7D32;">⚡ Why Renew Now?</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Uninterrupted access to your practice data</li>
          <li>Continue streamlining your CA practice</li>
          <li>Stay ahead with regular feature updates</li>
          <li>Maintain your competitive edge</li>
        </ul>
      </div>

      <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
        <p style="margin: 0;"><strong>⏰ Note:</strong> While your current plan continues until the end of the year, renewing now ensures seamless continuity of service and access to all features.</p>
      </div>

      <p>If you have any questions about your renewal or need assistance, our team is here to help!</p>

      <div class="footer">
        <p><strong>PowerCA - Empowering CA Practices</strong></p>
        <p>Need help? Contact us at <a href="mailto:contact@powerca.in" style="color: #4CAF50;">contact@powerca.in</a></p>
        <p style="font-size: 12px; color: #999; margin-top: 15px;">
          This email was sent to ${_email}<br>
          © ${new Date().getFullYear()} PowerCA. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
}
