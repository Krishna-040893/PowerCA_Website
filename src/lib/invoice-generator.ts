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
export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PCA-${year}${month}-${random}`
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
export function generateInvoiceHTML(data: InvoiceData): string {
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
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="company-details">
          <h1>PowerCA</h1>
          <div class="company-info">
            <p>Your Complete CA Practice Management Solution</p>
            <p>Email: billing@powerca.in | Phone: +91 98765 43210</p>
            <p>GSTIN: 27AABCP1234A1Z5</p>
            <p>Address: Mumbai, Maharashtra 400001</p>
          </div>
        </div>
        <div class="invoice-title">
          <h2>TAX INVOICE</h2>
          <p class="invoice-number">${data.invoiceNumber}</p>
          <p>Date: ${formatDate(data.invoiceDate)}</p>
          ${data.dueDate ? `<p>Due Date: ${formatDate(data.dueDate)}</p>` : ''}
          <span class="status-badge">PAID</span>
        </div>
      </div>
    </div>
    
    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="detail-section">
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
        <p>
          <strong>Order ID:</strong> ${data.orderId}<br>
          <strong>Payment ID:</strong> ${data.paymentId}<br>
          <strong>Payment Date:</strong> ${formatDate(data.paymentDate)}<br>
          <strong>Payment Method:</strong> Online (Razorpay)<br>
          <strong>Payment Status:</strong> Success
        </p>
      </div>
    </div>
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th style="width: 15%" class="text-right">Qty</th>
          <th style="width: 15%" class="text-right">Rate</th>
          <th style="width: 20%" class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(item.rate)}</td>
          <td class="text-right">${formatCurrency(item.amount)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- Summary -->
    <div class="summary">
      <div class="summary-content">
        <div class="summary-row">
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
          <span>${formatCurrency(data.grandTotal)}</span>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-section">
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
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Create invoice data from payment
export function createInvoiceData(payment: any): InvoiceData {
  const subtotal = 22000 // Base amount
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