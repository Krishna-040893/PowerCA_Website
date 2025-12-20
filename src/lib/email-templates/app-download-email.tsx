interface AppDownloadEmailProps {
  name: string
  email: string
  orderId: string
  paymentId: string
  productName: string
  amount: number
  downloadLink: string
}

export const AppDownloadEmail = ({
  name,
  orderId,
  paymentId,
  productName,
  amount,
  downloadLink,
}: AppDownloadEmailProps): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your PowerCA Demo Version Download Link</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      border-radius: 16px 16px 0 0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    .footer-content {
      background: white;
      padding: 20px 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 16px 16px;
    }
    .download-box {
      background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%);
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
    }
    .download-button {
      background: white;
      color: #7C3AED;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 50px;
      display: inline-block;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .download-button:hover {
      background: #f0f0f0;
    }
    .details-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .warning-box {
      background: #FEF2F2;
      border-left: 4px solid #EF4444;
      padding: 15px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    .support-box {
      background: #ECFDF5;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #7C3AED;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Download is Ready!</h1>
      <p>Thank you for purchasing ${productName}</p>
    </div>

    <div class="content">
      <p>Dear ${name},</p>

      <p>Congratulations! Your payment has been successfully processed. You can now download ${productName} using the button below.</p>

      <!-- Download Button -->
      <div class="download-box">
        <p style="color: white; margin: 0 0 20px 0; font-size: 14px;">Click the button below to download demo version</p>
        <a href="${downloadLink}" class="download-button">
          Download Now
        </a>
      </div>

      <!-- Order Details -->
      <div class="details-box">
        <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
        <div class="detail-row">
          <span>Order ID:</span>
          <strong> ${orderId}</strong>
        </div>
        <div class="detail-row">
          <span>Payment ID:</span>
          <strong> ${paymentId}</strong>
        </div>
        <div class="detail-row">
          <span>Product:</span>
          <strong> ${productName}</strong>
        </div>
        <div class="detail-row">
          <span>Amount Paid:</span>
          <strong> ₹${amount.toLocaleString('en-IN')}</strong>
        </div>
        <div class="detail-row">
          <span>Date:</span>
          <strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export const AppDownloadEmailText = ({
  name,
  orderId,
  paymentId,
  productName,
  amount,
  downloadLink,
}: AppDownloadEmailProps): string => {
  return `
Your PowerCA Desktop Download is Ready!

Dear ${name},

Congratulations! Your payment has been successfully processed.

DOWNLOAD LINK:
${downloadLink}

ORDER DETAILS:
- Order ID: ${orderId}
- Payment ID: ${paymentId}
- Product: ${productName}
- Amount Paid: ₹${amount.toLocaleString('en-IN')}
- Date: ${new Date().toLocaleDateString('en-IN')}

IMPORTANT:
- This download link can only be used ONCE
- Link will expire immediately after download
- For additional downloads, please contact support

Need Help?
Email: contact@powerca.in
Phone: +91 98765 43210

Thank you for choosing PowerCA!

© ${new Date().getFullYear()} PowerCA. All rights reserved.
  `.trim()
}
