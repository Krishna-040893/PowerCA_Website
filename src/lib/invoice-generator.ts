<<<<<<< HEAD
import puppeteer from 'puppeteer'

=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  dueDate?: Date
  
  // Customer Details
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerCompany?: string
  customerAddress?: string
  customerGSTN?: string
  
  // Payment Details
  orderId: string
  paymentId: string
  paymentDate: Date
  
  // Product Details
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  
  // Tax Details
  subtotal: number
  cgstRate?: number
  cgstAmount?: number
  sgstRate?: number
  sgstAmount?: number
  igstRate?: number
  igstAmount?: number
  totalTax: number
  grandTotal: number
}

// Generate invoice number
<<<<<<< HEAD
export function generateInvoiceNumber(isTest: boolean = false): string {
=======
export function generateInvoiceNumber(): string {
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
<<<<<<< HEAD
  const prefix = isTest ? 'TEST-PCA' : 'PCA'
  return `${prefix}-${year}${month}-${random}`
=======
  return `PCA-${year}${month}-${random}`
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
}

// Calculate GST (18% - 9% CGST + 9% SGST for intra-state, 18% IGST for inter-state)
export function calculateGST(amount: number, isInterState: boolean = false) {
  const gstRate = 0.18 // 18% GST
  const taxAmount = amount * gstRate
  
  if (isInterState) {
    return {
      igstRate: 18,
      igstAmount: taxAmount,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      totalTax: taxAmount,
    }
  } else {
    const halfTax = taxAmount / 2
    return {
      igstRate: 0,
      igstAmount: 0,
      cgstRate: 9,
      cgstAmount: halfTax,
      sgstRate: 9,
      sgstAmount: halfTax,
      totalTax: taxAmount,
    }
  }
}

// Generate HTML invoice
<<<<<<< HEAD
export function generateInvoiceHTML(data: InvoiceData & { isTestMode?: boolean }): string {
=======
export function generateInvoiceHTML(data: InvoiceData): string {
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
<<<<<<< HEAD
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #2c3e50;
      font-size: 13px;
      line-height: 1.5;
      background: #ffffff;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    /* Modern Header */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      margin: -30px -30px 30px -30px;
      border-radius: 0;
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .company-details h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .company-tagline {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 15px;
    }
    .company-info {
      font-size: 12px;
      opacity: 0.85;
      line-height: 1.6;
    }
    .invoice-title {
      text-align: right;
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    .invoice-title h2 {
      font-size: 22px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .invoice-number {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 25px;
      font-size: 11px;
      font-weight: bold;
      background: #27ae60;
      color: white;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Invoice Details */
    .invoice-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 35px;
    }
    .detail-section {
      background: #f8f9ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .detail-section h3 {
      color: #667eea;
      font-size: 16px;
      margin-bottom: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-section p {
      line-height: 1.8;
      color: #34495e;
    }
    .detail-section strong {
      color: #2c3e50;
      font-weight: 600;
    }

    /* Modern Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .items-table th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      padding: 15px 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #ecf0f1;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .items-table tr:hover {
      background: #f8f9ff;
    }
    .text-right { text-align: right; }

    /* Summary */
    .summary {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .summary-content {
      width: 350px;
      background: #f8f9ff;
      padding: 25px;
      border-radius: 10px;
      border: 1px solid #e3e8f0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e3e8f0;
      font-size: 14px;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      border-bottom: 3px solid #667eea;
      border-top: 2px solid #e3e8f0;
      margin-top: 15px;
      padding-top: 15px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      margin: 15px -25px 0 -25px;
      padding: 15px 25px;
    }

    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 25px;
      border-top: 2px solid #e3e8f0;
    }
    .footer-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .footer-section {
      background: #f8f9ff;
      padding: 20px;
      border-radius: 8px;
    }
    .footer-section h4 {
      color: #667eea;
      margin-bottom: 12px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer-section p {
      color: #34495e;
      line-height: 1.7;
      font-size: 12px;
    }
    .thank-you {
      text-align: center;
      margin-top: 35px;
      padding: 25px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 10px;
      border: 1px solid #e3e8f0;
    }
    .thank-you h3 {
      color: #667eea;
      margin-bottom: 10px;
      font-weight: 600;
      font-size: 18px;
    }
    .thank-you p {
      color: #34495e;
      font-size: 14px;
    }

    /* Print Styles */
    @media print {
      .invoice-container {
        padding: 15px;
        box-shadow: none;
      }
      .header { page-break-after: avoid; }
      .items-table { page-break-inside: avoid; }
    }
=======
    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; font-size: 14px; }
    .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; }
    
    /* Header */
    .header { border-bottom: 3px solid #1D91EB; padding-bottom: 20px; margin-bottom: 30px; }
    .header-content { display: flex; justify-content: space-between; align-items: start; }
    .company-details h1 { color: #1D91EB; font-size: 32px; margin-bottom: 10px; }
    .company-info { color: #666; line-height: 1.6; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { color: #333; font-size: 24px; margin-bottom: 10px; }
    .invoice-number { color: #1D91EB; font-size: 16px; font-weight: bold; }
    
    /* Invoice Details */
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .detail-section h3 { color: #333; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; }
    .detail-section p { line-height: 1.8; color: #666; }
    .detail-section strong { color: #333; }
    
    /* Table */
    .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    .items-table th { background: #f5f5f5; color: #333; font-weight: bold; padding: 12px; text-align: left; border: 1px solid #ddd; }
    .items-table td { padding: 12px; border: 1px solid #ddd; }
    .items-table tr:nth-child(even) { background: #fafafa; }
    .text-right { text-align: right; }
    
    /* Summary */
    .summary { margin-top: 30px; display: flex; justify-content: flex-end; }
    .summary-content { width: 300px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
    .summary-row.total { font-size: 18px; font-weight: bold; color: #1D91EB; border-bottom: 3px double #1D91EB; border-top: 1px solid #e0e0e0; margin-top: 10px; padding-top: 10px; }
    
    /* Footer */
    .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e0e0e0; }
    .footer-content { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .footer-section h4 { color: #333; margin-bottom: 10px; }
    .footer-section p { color: #666; line-height: 1.6; }
    .thank-you { text-align: center; margin-top: 40px; padding: 20px; background: #f0f8ff; border-radius: 8px; }
    .thank-you h3 { color: #1D91EB; margin-bottom: 10px; }
    
    /* Print Styles */
    @media print {
      .invoice-container { padding: 20px; }
      .header { page-break-after: avoid; }
      .items-table { page-break-inside: avoid; }
    }
    
    /* Status Badge */
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #4CAF50; color: white; margin-left: 10px; }
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  </style>
</head>
<body>
  <div class="invoice-container">
<<<<<<< HEAD
    ${data.isTestMode ? `
    <!-- Test Mode Banner -->
    <div style="background: #fff3cd; color: #856404; padding: 15px; margin: -30px -30px 20px -30px; text-align: center; border-radius: 0; border: 2px solid #ffc107; font-weight: bold; font-size: 16px;">
      🧪 TEST MODE INVOICE - NO REAL PAYMENT PROCESSED
    </div>
    ` : ''}
=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="company-details">
          <h1>PowerCA</h1>
<<<<<<< HEAD
          <div class="company-tagline">Complete CA Practice Management Solution</div>
          <div class="company-info">
            <div>📧 contact@powerca.in | 📞 +91 98765 43210</div>
            <div>🏢 GSTIN: 27AABCP1234A1Z5</div>
            <div>📍 Mumbai, Maharashtra 400001, India</div>
=======
          <div class="company-info">
            <p>Your Complete CA Practice Management Solution</p>
            <p>Email: billing@powerca.in | Phone: +91 98765 43210</p>
            <p>GSTIN: 27AABCP1234A1Z5</p>
            <p>Address: Mumbai, Maharashtra 400001</p>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
          </div>
        </div>
        <div class="invoice-title">
          <h2>TAX INVOICE</h2>
<<<<<<< HEAD
          <div class="invoice-number">${data.invoiceNumber}</div>
          <div>📅 ${formatDate(data.invoiceDate)}</div>
          ${data.dueDate ? `<div>Due: ${formatDate(data.dueDate)}</div>` : ''}
          <span class="status-badge">${data.isTestMode ? '🧪 TEST PAYMENT' : '✓ PAID'}</span>
=======
          <p class="invoice-number">${data.invoiceNumber}</p>
          <p>Date: ${formatDate(data.invoiceDate)}</p>
          ${data.dueDate ? `<p>Due Date: ${formatDate(data.dueDate)}</p>` : ''}
          <span class="status-badge">PAID</span>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        </div>
      </div>
    </div>
    
    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="detail-section">
<<<<<<< HEAD
        <h3>🎯 Bill To</h3>
        <p>
          <strong>${data.customerName}</strong><br>
          ${data.customerCompany ? `${data.customerCompany}<br>` : ''}
          📧 ${data.customerEmail}<br>
          ${data.customerPhone ? `📞 ${data.customerPhone}<br>` : ''}
          ${data.customerAddress ? `📍 ${data.customerAddress}<br>` : ''}
          ${data.customerGSTN ? `🏢 GSTIN: ${data.customerGSTN}` : ''}
        </p>
      </div>

      <div class="detail-section">
        <h3>💳 Payment Details</h3>
=======
        <h3>Bill To</h3>
        <p>
          <strong>${data.customerName}</strong><br>
          ${data.customerCompany ? `${data.customerCompany}<br>` : ''}
          ${data.customerEmail}<br>
          ${data.customerPhone ? `${data.customerPhone}<br>` : ''}
          ${data.customerAddress ? `${data.customerAddress}<br>` : ''}
          ${data.customerGSTN ? `GSTIN: ${data.customerGSTN}` : ''}
        </p>
      </div>
      
      <div class="detail-section">
        <h3>Payment Details</h3>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        <p>
          <strong>Order ID:</strong> ${data.orderId}<br>
          <strong>Payment ID:</strong> ${data.paymentId}<br>
          <strong>Payment Date:</strong> ${formatDate(data.paymentDate)}<br>
<<<<<<< HEAD
          <strong>Payment Method:</strong> 💰 Online (Razorpay)<br>
          <strong>Status:</strong> ✅ Success
        </p>
      </div>
    </div>

=======
          <strong>Payment Method:</strong> Online (Razorpay)<br>
          <strong>Payment Status:</strong> Success
        </p>
      </div>
    </div>
    
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
<<<<<<< HEAD
          <th style="width: 45%">📋 Description</th>
          <th style="width: 15%" class="text-right">🔢 Qty</th>
          <th style="width: 20%" class="text-right">💰 Rate</th>
          <th style="width: 20%" class="text-right">💵 Amount</th>
=======
          <th style="width: 50%">Description</th>
          <th style="width: 15%" class="text-right">Qty</th>
          <th style="width: 15%" class="text-right">Rate</th>
          <th style="width: 20%" class="text-right">Amount</th>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
        <tr>
<<<<<<< HEAD
          <td>
            <strong>${item.description}</strong>
            <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">
              ✨ Complete Setup • 🎓 Training Included • 🛠️ First Year FREE
            </div>
          </td>
          <td class="text-right"><strong>${item.quantity}</strong></td>
          <td class="text-right">${formatCurrency(item.rate)}</td>
          <td class="text-right"><strong>${formatCurrency(item.amount)}</strong></td>
=======
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.rate)}</td>
          <td class="text-right">${formatCurrency(item.amount)}</td>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        </tr>
        `).join('')}
      </tbody>
    </table>
<<<<<<< HEAD

=======
    
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    <!-- Summary -->
    <div class="summary">
      <div class="summary-content">
        <div class="summary-row">
<<<<<<< HEAD
          <span>💰 Subtotal</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>

        ${data.cgstAmount ? `
        <div class="summary-row">
          <span>🏛️ CGST (${data.cgstRate}%)</span>
          <span>${formatCurrency(data.cgstAmount)}</span>
        </div>
        <div class="summary-row">
          <span>🏛️ SGST (${data.sgstRate}%)</span>
          <span>${formatCurrency(data.sgstAmount)}</span>
        </div>
        ` : ''}

        ${data.igstAmount ? `
        <div class="summary-row">
          <span>🏛️ IGST (${data.igstRate}%)</span>
          <span>${formatCurrency(data.igstAmount)}</span>
        </div>
        ` : ''}

        <div class="summary-row total">
          <span>🎯 GRAND TOTAL</span>
=======
          <span>Subtotal:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        
        ${data.cgstAmount ? `
        <div class="summary-row">
          <span>CGST (${data.cgstRate}%):</span>
          <span>${formatCurrency(data.cgstAmount)}</span>
        </div>
        <div class="summary-row">
          <span>SGST (${data.sgstRate}%):</span>
          <span>${formatCurrency(data.sgstAmount)}</span>
        </div>
        ` : ''}
        
        ${data.igstAmount ? `
        <div class="summary-row">
          <span>IGST (${data.igstRate}%):</span>
          <span>${formatCurrency(data.igstAmount)}</span>
        </div>
        ` : ''}
        
        <div class="summary-row total">
          <span>Grand Total:</span>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
          <span>${formatCurrency(data.grandTotal)}</span>
        </div>
      </div>
    </div>
<<<<<<< HEAD

=======
    
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-section">
<<<<<<< HEAD
          <h4>📋 Terms & Conditions</h4>
          <p>
            ✅ This is a computer-generated invoice.<br>
            🎁 First year subscription is FREE with implementation.<br>
            🔄 Renewal charges apply from second year onwards.<br>
            📞 For queries, contact support@powerca.in
          </p>
        </div>

        <div class="footer-section">
          <h4>🏦 Bank Details</h4>
          <p>
            <strong>Bank:</strong> HDFC Bank<br>
            <strong>Account:</strong> PowerCA Solutions Pvt Ltd<br>
            <strong>A/C No:</strong> 1234567890<br>
            <strong>IFSC:</strong> HDFC0001234
          </p>
        </div>
      </div>

      <div class="thank-you">
        <h3>🙏 Thank You for Your Business!</h3>
        <p>We appreciate your trust in PowerCA and look forward to serving you with excellence.</p>
=======
          <h4>Terms & Conditions</h4>
          <p>
            1. This is a computer-generated invoice.<br>
            2. First year subscription is FREE with implementation.<br>
            3. Renewal charges apply from second year onwards.<br>
            4. For any queries, contact support@powerca.in
          </p>
        </div>
        
        <div class="footer-section">
          <h4>Bank Details</h4>
          <p>
            <strong>Bank Name:</strong> HDFC Bank<br>
            <strong>Account Name:</strong> PowerCA Solutions Pvt Ltd<br>
            <strong>Account Number:</strong> 1234567890<br>
            <strong>IFSC Code:</strong> HDFC0001234
          </p>
        </div>
      </div>
      
      <div class="thank-you">
        <h3>Thank You for Your Business!</h3>
        <p>We appreciate your trust in PowerCA and look forward to serving you.</p>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

<<<<<<< HEAD
// Generate PDF invoice
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const htmlContent = generateInvoiceHTML(data)

  let browser = null
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
    return pdfBuffer
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    throw error
  }
}

// Create invoice data from payment
export function createInvoiceData(payment: any): InvoiceData {
  const subtotal = 1 // Base amount - ₹1 for testing (Original: ₹22,000)
=======
// Create invoice data from payment
export function createInvoiceData(payment: any): InvoiceData {
  const subtotal = 22000 // Base amount
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  const gst = calculateGST(subtotal, false) // Assuming intra-state
  
  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: undefined, // Already paid
    
    customerName: payment.name || 'Customer',
    customerEmail: payment.email,
    customerPhone: payment.phone,
    customerCompany: payment.company,
    customerAddress: payment.address,
    customerGSTN: payment.gstNumber,
    
    orderId: payment.orderId,
    paymentId: payment.paymentId,
    paymentDate: new Date(),
    
    items: [{
      description: 'PowerCA Implementation - Complete setup with first year subscription FREE',
      quantity: 1,
      rate: subtotal,
      amount: subtotal,
    }],
    
    subtotal,
    ...gst,
    grandTotal: subtotal + gst.totalTax,
  }
}