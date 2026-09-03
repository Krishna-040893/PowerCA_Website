import { InvoiceData } from './invoice-generator'

// TBS Technologies Invoice Template
export function generateTBSInvoiceHTML(data: InvoiceData & { isTestMode?: boolean }, headerLogoBase64: string = '', productLogoBase64: string = ''): string {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    const datePart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timePart = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${datePart} ${timePart}`
  }

  // Calculate account number from invoice number
  const _accountNumber = data.invoiceNumber.replace(/[^0-9]/g, '').padStart(12, '0')

  // Get user count, plan type, and coupon code
  const userCount = data.user_count || 1
  const planType = data.planType || 'annual'
  const couponCode = data.couponCode || null

  // Plan display names
  const getPlanDisplayName = () => {
    switch (planType) {
      case 'monthly': return 'Monthly Subscription'
      case 'annual': return 'Annual Subscription'
      case 'onetime': return '2 Year Pack'
      case 'final_settlement': return 'Final Settlement'
      default: return 'Power CA Implementation'
    }
  }

  const getProductDescription = () => {
    switch (planType) {
      case 'monthly': return 'Monthly subscription with ongoing support'
      case 'annual': return 'Annual subscription with ongoing support'
      case 'onetime': return '2 Year Pack - Per user pricing'
      case 'final_settlement': return 'Final settlement payment for Power CA service'
      default: return 'Installation and Ongoing Support & Update'
    }
  }

  // Server Installation & Configuration charge - only for first-time purchases
  const isFirstPurchase = data.paymentType === 'initial_payment' || !data.paymentType
  const serverInstallationCharge = isFirstPurchase ? 5000 : 0

  // Calculate license amount (subtotal minus server installation if applicable)
  const licenseTotal = data.subtotal - serverInstallationCharge

  // Calculate price per user (for display purposes)
  // Use originalAmount if available (before discount), otherwise derive from license total
  const pricePerUser = data.originalAmount && data.originalAmount > 0 ? data.originalAmount : (userCount > 0 ? Math.round(licenseTotal / userCount) : licenseTotal)

  // License amount before discount (per user * users)
  const licenseBeforeDiscount = pricePerUser * userCount

  // Coupon discount total (across all users)
  const totalCouponDiscount = data.discountAmount && data.discountAmount > 0 ? data.discountAmount * userCount : 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${data.invoiceNumber}</title>
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
      background: linear-gradient(135deg, #3b7dd6 0%, #2563a8 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 22px;
      box-shadow: 0 2px 8px rgba(59, 125, 214, 0.3);
    }
    .company-name {
      color: #3b7dd6;
      font-size: 20px;
      font-weight: bold;
    }
    .company-address {
      text-align: right;
      font-size: 14px;
      line-height: 1.6;
      color: #666;
    }

    /* Bill To Section */
    .billing-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .bill-to {
      width: 45%;
    }
    .bill-to h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    .bill-to-content {
      font-size: 15px;
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
      color: #3b7dd6;
      margin-bottom: 20px;
      text-align: center;
    }
    .invoice-details {
      font-size: 15px;
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
      background: #3b7dd6;
      color: white;
    }
    .items-table th {
      padding: 14px;
      text-align: left;
      font-size: 15px;
      font-weight: 600;
    }
    .items-table th.text-right {
      text-align: right;
    }
    .items-table td {
      padding: 16px 14px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 15px;
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
      opacity: 0.15;
      pointer-events: none;
    }
    .watermark-text {
      font-size: 120px;
      font-weight: bold;
      color: #4caf50;
      border: 8px solid #4caf50;
      padding: 20px 60px;
      border-radius: 20px;
      letter-spacing: 10px;
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
      padding: 10px 0;
      font-size: 16px;
    }
    .totals-row.subtotal {
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 8px;
    }
    .totals-row.total {
      background: #3b7dd6;
      color: white;
      padding: 14px 20px;
      margin: 15px -20px 0 0;
      font-size: 18px;
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
      color: #3b7dd6;
    }
    .terms p {
      font-size: 11px;
      line-height: 1.6;
      color: #666;
    }
    .payment-info {
      background: #3b7dd6;
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
        ${headerLogoBase64 ? `<img src="${headerLogoBase64}" alt="Power CA Logo" style="height: 90px; width: auto;">` : '<div class="logo-placeholder">PC</div>'}
      </div>
      <div class="company-address">
        No. 130, II Floor, Muneer Complex, Palani Road,<br>
        Udumalpet, 642126, TamilNadu<br>
        📞 +91 96295 14635 📧 contact@powerca.in
      </div>
    </div>

    <!-- Order Summary Title -->
    <div class="invoice-title">ORDER SUMMARY</div>

    <!-- Billing Section -->
    <div class="billing-section">
      <div class="bill-to">
        <h3>Billing Address</h3>
        <div class="bill-to-content">
          <strong>${data.customerName}</strong><br>
          ${data.customerCompany || ''}<br>
          ${data.customerAddress || ''}<br>
          ${data.customerPhone || ''}<br>
          ${data.customerEmail}<br>
          ${data.customerGSTN ? `<strong>GSTIN:</strong> ${data.customerGSTN}` : ''}
        </div>
      </div>

      <div class="invoice-info">
        <div class="invoice-details">
          <strong>Receipt #:</strong> ${data.invoiceNumber}<br>
          <strong>Order #:</strong> ${data.orderId}<br>
          <strong>Receipt Date:</strong> ${formatDate(data.invoiceDate)}<br>
          <strong>Order Date:</strong> ${formatDate(data.paymentDate)}
        </div>
      </div>
    </div>

    <!-- Watermark -->
    ${!data.isTestMode ? `
    <div class="watermark">
      <div class="watermark-text">RECEIVED</div>
    </div>
    ` : ''}

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 60px; white-space: nowrap;">S.No</th>
          <th>Product</th>
          <th style="width: 80px;" class="text-right">Users</th>
          <th style="width: 110px;" class="text-right">Price</th>
          <th style="width: 150px;" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <!-- Row 1: Subscription -->
        <tr>
          <td>01</td>
          <td>
            <strong>${getPlanDisplayName()} for Power CA</strong><br>
            <span style="font-size: 13px; color: #666;">${getProductDescription()}</span>
          </td>
          <td class="text-right"><strong>${userCount}</strong></td>
          <td class="text-right"><strong>${formatCurrency(pricePerUser)}</strong></td>
          <td class="text-right"><strong>${formatCurrency(licenseBeforeDiscount)}</strong></td>
        </tr>
        ${serverInstallationCharge > 0 ? `
        <!-- Row 2: Server Installation & Configuration (first-time only) -->
        <tr>
          <td>02</td>
          <td>
            <strong>Server Installation & Configuration</strong><br>
            <span style="font-size: 13px; color: #666;">One-time setup and configuration</span>
          </td>
          <td class="text-right">-</td>
          <td class="text-right">-</td>
          <td class="text-right"><strong>${formatCurrency(serverInstallationCharge)}</strong></td>
        </tr>
        ` : ''}
        ${totalCouponDiscount > 0 ? `
        <!-- Coupon Discount Row -->
        <tr>
          <td colspan="4" style="text-align: right; color: #16a34a; font-weight: 600;">
            Coupon Discount${couponCode ? ` (${couponCode})` : ''} ${data.discountPercentage || 0}%
          </td>
          <td class="text-right" style="color: #16a34a; font-weight: 600;">-${formatCurrency(totalCouponDiscount)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row subtotal">
          <span>SUB TOTAL:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        ${data.cgstAmount && data.sgstAmount ? `
        <div class="totals-row">
          <span>GST (18%):</span>
          <span>${formatCurrency(data.cgstAmount + data.sgstAmount)}</span>
        </div>
        ` : ''}
        ${data.igstAmount ? `
        <div class="totals-row">
          <span>IGST (18%):</span>
          <span>${formatCurrency(data.igstAmount)}</span>
        </div>
        ` : ''}
        <div class="totals-row total">
          <span>TOTAL:</span>
          <span>${formatCurrency(data.grandTotal)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thank-you" style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #3b7dd6; margin-bottom: 8px; font-size: 18px;">Thank You for Your Subscription!</h3>
        <p style="color: #666; font-size: 14px;">This is a computer-generated document. No signature required.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
