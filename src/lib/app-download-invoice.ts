import puppeteer from 'puppeteer'
import chromium from '@sparticuz/chromium'
import * as fs from 'fs'
import * as path from 'path'

export interface AppDownloadInvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderId: string
  paymentId: string
  productName: string
  amount: number
  currency: string
}

// Generate HTML for app download invoice
function generateAppDownloadInvoiceHTML(data: AppDownloadInvoiceData, headerLogoBase64: string = '', productLogoBase64: string = ''): string {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      position: relative;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .company-logo {
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
    }
    .logo-placeholder {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #1D91EB 0%, #1565c0 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 22px;
      box-shadow: 0 2px 8px rgba(29, 145, 235, 0.3);
    }
    .company-address {
      text-align: right;
      font-size: 12px;
      line-height: 1.6;
      color: #666;
    }

    /* Billing Section */
    .billing-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .bill-to {
      width: 45%;
    }
    .bill-to h3 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    .bill-to-content {
      font-size: 13px;
      line-height: 1.8;
      color: #666;
    }

    /* Invoice Info */
    .invoice-info {
      width: 45%;
      text-align: right;
    }
    .invoice-title {
      font-size: 36px;
      font-weight: bold;
      color: #1D91EB;
      margin-bottom: 10px;
    }
    .invoice-details {
      font-size: 13px;
      line-height: 1.8;
      color: #666;
    }
    .invoice-details strong {
      color: #333;
    }

    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      position: relative;
    }
    .items-table thead {
      background: #1D91EB;
      color: white;
    }
    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
    }
    .items-table th.text-right {
      text-align: right;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }
    .items-table td.text-right {
      text-align: right;
    }
    .image-placeholder {
      width: 60px;
      height: 60px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #999;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      z-index: 1;
      opacity: 0.12;
      pointer-events: none;
    }
    .watermark-text {
      font-size: 100px;
      font-weight: bold;
      color: #1BAF69;
      border: 6px solid #1BAF69;
      padding: 15px 50px;
      border-radius: 15px;
      letter-spacing: 8px;
    }

    /* Totals */
    .totals-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .totals-table {
      width: 350px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-row.subtotal {
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 8px;
    }
    .totals-row.total {
      background: #1D91EB;
      color: white;
      padding: 12px 20px;
      margin: 15px -20px 0 0;
      font-size: 16px;
      font-weight: bold;
    }

    /* Footer */
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e0e0e0;
    }
    .terms {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .terms h4 {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      color: #1D91EB;
    }
    .terms p {
      font-size: 11px;
      line-height: 1.6;
      color: #666;
    }
    .payment-info {
      background: #1D91EB;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 13px;
      margin-bottom: 15px;
      text-align: center;
    }
    .website {
      text-align: center;
      font-size: 12px;
      color: #666;
      padding: 15px 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 15px;
    }

    @media print {
      body { padding: 0; }
      .invoice-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-logo">
        ${headerLogoBase64 ? `<img src="${headerLogoBase64}" alt="Power CA Logo" style="height: 60px; width: auto;">` : '<div class="logo-placeholder">PC</div>'}
      </div>
      <div class="company-address">
        No. 130, II Floor, Muneer Complex, Palani Road,<br>
        Udumalpet, 642126, TamilNadu<br>
        +91 96295 14635 | contact@powerca.in
      </div>
    </div>

    <!-- Billing Section -->
    <div class="billing-section">
      <div class="bill-to">
        <h3>Billing Address</h3>
        <div class="bill-to-content">
          <strong>${data.customerName}</strong><br>
          ${data.customerEmail}<br>
          ${data.customerPhone || ''}
        </div>
      </div>

      <div class="invoice-info">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-details">
          <strong>Invoice #:</strong> ${data.invoiceNumber}<br>
          <strong>Order #:</strong> ${data.orderId}<br>
          <strong>Invoice Date:</strong> ${formatDate(data.invoiceDate)}<br>
          <strong>Payment ID:</strong> ${data.paymentId}
        </div>
      </div>
    </div>

    <!-- Watermark -->
    <div class="watermark">
      <div class="watermark-text">PAID</div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 60px;">S. No</th>
          <th style="width: 80px;">Image</th>
          <th>Product</th>
          <th style="width: 100px;" class="text-right">Quantity</th>
          <th style="width: 120px;" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>01</td>
          <td>
            ${productLogoBase64 ? `<img src="${productLogoBase64}" alt="Power CA Logo" style="width: 60px; height: 60px; object-fit: contain; display: block;">` : `
            <div class="image-placeholder">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#1D91EB"/>
                <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-weight="bold">PC</text>
              </svg>
            </div>
            `}
          </td>
          <td>
            <strong>${data.productName || 'Power CA Desktop'}</strong><br>
            <span style="font-size: 11px; color: #666; font-style: italic;">Demo Version - 1 Month Access</span><br>
          </td>
          <td class="text-right">1</td>
          <td class="text-right"><strong>${formatCurrency(data.amount)}</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row subtotal">
          <span>SUB TOTAL:</span>
          <span>${formatCurrency(data.amount)}</span>
        </div>
        <div class="totals-row">
          <span>GST (0%):</span>
          <span>${formatCurrency(0)}</span>
        </div>
        <div class="totals-row total">
          <span>TOTAL:</span>
          <span>${formatCurrency(data.amount)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="terms">
        <h4>TERMS AND CONDITIONS:</h4>
        <p>
          This is a computer-generated invoice. Demo version access is valid for 1 month from the date of purchase.
          The demo version is intended solely for training content. For any queries, please contact contact@powerca.in
        </p>
      </div>

      <div class="payment-info">
        <strong>Payment Method:</strong> Online Payment via Razorpay | <strong>Status:</strong> Paid
      </div>

      <div class="website">
        www.powerca.in | contact@powerca.in | +91 96295 14635
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Generate PDF from HTML using Puppeteer
export async function generateAppDownloadInvoicePDF(data: AppDownloadInvoiceData): Promise<Uint8Array> {
  // Read header logo and convert to base64
  const headerLogoPath = path.join(process.cwd(), 'public', 'images', 'Group 12.png')
  let headerLogoBase64 = ''

  try {
    const headerLogoBuffer = fs.readFileSync(headerLogoPath)
    headerLogoBase64 = `data:image/png;base64,${headerLogoBuffer.toString('base64')}`
  } catch {
    console.warn('Header logo file not found, using placeholder')
  }

  // Read product logo and convert to base64
  const productLogoPath = path.join(process.cwd(), 'public', 'images', 'power-ca-logo-footer.png')
  let productLogoBase64 = ''

  try {
    const productLogoBuffer = fs.readFileSync(productLogoPath)
    productLogoBase64 = `data:image/png;base64,${productLogoBuffer.toString('base64')}`
  } catch {
    console.warn('Product logo file not found, using placeholder')
  }

  // Generate HTML content
  const htmlContent = generateAppDownloadInvoiceHTML(data, headerLogoBase64, productLogoBase64)

  let browser = null
  try {
    // Vercel-compatible Puppeteer configuration
    const isProduction = process.env.NODE_ENV === 'production'

    browser = await puppeteer.launch({
      args: isProduction ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath: isProduction ? await chromium.executablePath() : puppeteer.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    await browser.close()
    return new Uint8Array(pdfBuffer)
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    throw error
  }
}
