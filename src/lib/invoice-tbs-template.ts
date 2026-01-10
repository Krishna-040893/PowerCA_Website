import { InvoiceData } from './invoice-generator'

// TBS Technologies Invoice Template
export function generateTBSInvoiceHTML(data: InvoiceData & { isTestMode?: boolean }, headerLogoBase64: string = '', productLogoBase64: string = ''): string {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Calculate account number from invoice number
  const _accountNumber = data.invoiceNumber.replace(/[^0-9]/g, '').padStart(12, '0')

  // Get user count and plan type
  const userCount = data.user_count || 1
  const planType = data.planType || 'onetime'

  // Plan display names
  const getPlanDisplayName = () => {
    switch (planType) {
      case 'monthly': return 'Monthly Subscription'
      case 'annual': return 'Annual Subscription'
      case 'onetime': return 'One Time Payment'
      case 'installment': return 'Installment Payment'
      case 'final_settlement': return 'Final Settlement'
      default: return 'PowerCA Implementation'
    }
  }

  const getProductDescription = () => {
    switch (planType) {
      case 'monthly': return 'Monthly subscription with ongoing support'
      case 'annual': return 'Annual subscription with ongoing support'
      case 'onetime': return 'Complete setup with first year subscription FREE'
      case 'installment': return 'Installment payment (10 months)'
      case 'final_settlement': return 'Final settlement payment for PowerCA service'
      default: return 'Installation and Ongoing Support & Update'
    }
  }

  // Calculate price per user (for display purposes)
  const pricePerUser = userCount > 1 ? Math.round(data.subtotal / userCount) : data.subtotal

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
      font-size: 12px;
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
      color: #3b7dd6;
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
      background: #3b7dd6;
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
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-row.subtotal {
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 8px;
    }
    .totals-row.total {
      background: #3b7dd6;
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
        ${headerLogoBase64 ? `<img src="${headerLogoBase64}" alt="PowerCA Logo" style="height: 60px; width: auto;">` : '<div class="logo-placeholder">PC</div>'}
      </div>
      <div class="company-address">
        No. 130, II Floor, Muneer Complex, Palani Road,<br>
        Udumalpet, 642126, TamilNadu<br>
        📞 +91 96295 14635 📧 contact@powerca.in
      </div>
    </div>

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
        <div class="invoice-title">RECEIPT</div>
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
          <th style="width: 60px;">S. No</th>
          <th style="width: 80px;">Image</th>
          <th>Product</th>
          <th style="width: 100px;" class="text-right">Quantity</th>
          <th style="width: 120px;" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, index) => `
        <tr>
          <td>${(index + 1).toString().padStart(2, '0')}</td>
          <td>
            ${productLogoBase64 ? `<img src="${productLogoBase64}" alt="PowerCA Logo" style="width: 60px; height: 60px; object-fit: contain; display: block;">` : `
            <div class="image-placeholder">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" fill="#e0e0e0"/>
                <path d="M15 15L25 25M25 15L15 25" stroke="#999" stroke-width="2"/>
              </svg>
            </div>
            `}
          </td>
          <td>
            <strong>${getPlanDisplayName()}</strong><br>
            <span style="font-size: 11px; color: #666; font-style: italic;">${getProductDescription()}</span>
            ${userCount > 1 ? `<br><span style="font-size: 11px; color: #3b7dd6; font-weight: 500;">@ ${formatCurrency(pricePerUser)} per user</span>` : ''}
          </td>
          <td class="text-right">${userCount > 1 ? `${userCount} users` : item.quantity}</td>
          <td class="text-right">
            ${data.originalAmount && data.discountAmount && data.discountAmount > 0 ? `
              <span style="text-decoration: line-through; color: #999; font-size: 12px; display: block;">${formatCurrency(data.originalAmount)}</span>
              ${userCount <= 1 ? `<strong>${formatCurrency(item.amount)}</strong>` : ''}
            ` : `
              ${userCount <= 1 ? `<strong>${formatCurrency(item.amount)}</strong>` : ''}
            `}
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        ${data.originalAmount && data.discountAmount && data.discountAmount > 0 ? `
        <div class="totals-row">
          <span>ORIGINAL AMOUNT:</span>
          <span style="text-decoration: line-through; color: #999;">${formatCurrency(data.originalAmount)}</span>
        </div>
        <div class="totals-row" style="color: #27ae60;">
          <span>DISCOUNT (${data.discountPercentage || 0}%):</span>
          <span>-${formatCurrency(data.discountAmount)}</span>
        </div>
        ` : ''}
        ${userCount > 1 ? `
        <div class="totals-row">
          <span>PRICE PER USER:</span>
          <span>${formatCurrency(pricePerUser)}</span>
        </div>
        <div class="totals-row">
          <span>NUMBER OF USERS:</span>
          <span>× ${userCount}</span>
        </div>
        ` : ''}
        <div class="totals-row subtotal">
          <span>SUB TOTAL:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        ${data.cgstAmount && data.sgstAmount ? `
        <div class="totals-row">
          <span>CGST (9%):</span>
          <span>${formatCurrency(data.cgstAmount)}</span>
        </div>
        <div class="totals-row">
          <span>SGST (9%):</span>
          <span>${formatCurrency(data.sgstAmount)}</span>
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
      <div class="terms">
        <h4>TERMS AND CONDITIONS:</h4>
        <p>
          This is a computer-generated invoice. For any queries or support, please contact us at contact@powerca.in or call +91 96295 14635.
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
