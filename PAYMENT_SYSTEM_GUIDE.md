# PowerCA Payment System - Complete Implementation Guide

## Overview
The PowerCA website now has a complete payment system with Razorpay integration, invoice generation, and email notifications. The price has been set to ₹1 for testing purposes (original price: ₹22,000).

## Features Implemented

### 1. Pricing Update
- **Location**: `src/config/features.ts`
- **Test Price**: ₹1 (100 paise)
- **Original Price**: ₹22,000

### 2. Payment Flow

#### Step 1: Pricing Page
- **URL**: http://localhost:3002/
- User sees the pricing with ₹1 test price
- Click "Book Now" or "Get Started Now" button

#### Step 2: Checkout Page
- **URL**: http://localhost:3002/checkout
- **Features**:
  - Product details display
  - Customer information form
  - Billing address collection
  - GST number (optional)
  - Order summary with test discount
  - Secure payment via Razorpay

#### Step 3: Payment Processing
- **Razorpay Integration**:
  - Test mode credentials configured
  - Supports all payment methods (Cards, UPI, Net Banking, Wallets)
  - Real-time payment verification

#### Step 4: Order Confirmation
- **Success Page**: `/payment-success`
- **Features**:
  - Order confirmation display
  - Invoice generation
  - Email notification with invoice

### 3. Invoice Generation System

#### Invoice Features:
- **Auto-generated invoice number**: Format `PCA-YYYYMM-XXXX`
- **GST Calculation**:
  - CGST: 9%
  - SGST: 9%
  - Total GST: 18%
- **Professional HTML invoice template**
- **Company branding and details**
- **Payment details and transaction IDs**

### 4. Email System

#### Email Features:
- **Powered by Resend API**
- **Sends to customer email**:
  - Payment confirmation
  - Invoice as HTML attachment
  - Order details
  - Transaction reference

## API Endpoints

### 1. Create Order
- **Endpoint**: `/api/payment/create-order`
- **Method**: POST
- **Purpose**: Creates Razorpay order
- **Test Amount**: ₹1 (100 paise)

### 2. Verify Payment
- **Endpoint**: `/api/payment/verify`
- **Method**: POST
- **Purpose**:
  - Verifies payment signature
  - Saves payment to database
  - Generates invoice
  - Sends confirmation email

## Database Schema

### Payments Table
```sql
- id (UUID)
- order_id (Razorpay order ID)
- payment_id (Razorpay payment ID)
- signature (Payment signature)
- amount (₹1 for testing)
- customer details (name, email, phone, company)
- address details
- GST number
- status
- timestamps
```

### Invoices Table
```sql
- id (UUID)
- invoice_number (unique)
- payment_id (reference)
- amount
- gst
- total
- status
- dates
```

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Razorpay Test Credentials (Already configured)
RAZORPAY_KEY_ID=rzp_test_KoHHWMZsGIeERP
RAZORPAY_KEY_SECRET=qJSJKHc4XfEJ5LQZ2iafVdfs
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_KoHHWMZsGIeERP

# Resend Email (Already configured)
RESEND_API_KEY=re_BHpihZ2L_GdXPKMHC5Usraiwi1Xc5JZEW
```

## Testing Instructions

### 1. Setup Database
Run these SQL scripts in Supabase:
```bash
1. Run: supabase/create-payment-tables.sql
```

### 2. Start Development Server
```bash
cd D:\PowerCA_Website-main\PowerCA_Website-main
npm run dev -- -p 3002
```

### 3. Test Payment Flow

#### Test Cards for Razorpay:
- **Success**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date

#### Test UPI:
- **UPI ID**: success@razorpay

#### Steps:
1. Navigate to http://localhost:3002/
2. Click "Get Started Now" button in pricing section
3. Fill checkout form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9999999999
   - Company: Test Company
   - Address details
4. Click "Pay Rs. 1 Now (Testing Mode)"
5. Complete payment using test credentials
6. Verify:
   - Payment success page
   - Check email for invoice
   - Check Supabase for payment record

### 4. Verify Invoice Generation
- Invoice will be sent to the email provided
- Check Supabase `invoices` table
- Invoice includes:
  - Company details
  - Customer information
  - Payment details
  - GST breakdown
  - Transaction IDs

## File Structure

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx          # Checkout page with form
│   ├── payment-success/
│   │   └── page.tsx          # Success page
│   └── api/
│       └── payment/
│           ├── create-order/
│           │   └── route.ts  # Create Razorpay order
│           └── verify/
│               └── route.ts  # Verify and process payment
├── lib/
│   ├── razorpay.ts          # Razorpay configuration
│   └── invoice-generator.ts  # Invoice generation logic
└── config/
    └── features.ts           # Pricing configuration
```

## Important Notes

### Testing Mode
- **Current Price**: ₹1 (for testing)
- **Original Price**: ₹22,000
- **To restore original price**, update:
  1. `src/config/features.ts` - Change price back to ₹22,000
  2. `src/lib/invoice-generator.ts` - Update subtotal to 22000
  3. `src/app/api/payment/create-order/route.ts` - Update amount to 2200000
  4. `src/app/api/payment/verify/route.ts` - Update amount to 22000
  5. `src/app/checkout/page.tsx` - Update displayed prices

### Razorpay Dashboard
- Login to Razorpay Dashboard to view:
  - Test transactions
  - Order details
  - Payment logs
- URL: https://dashboard.razorpay.com/

### Email Testing
- Emails are sent via Resend API
- Check spam folder if not in inbox
- Invoice attached as HTML file

## Troubleshooting

### Payment not processing
- Check Razorpay credentials in `.env.local`
- Ensure dev server is running
- Check browser console for errors

### Invoice not generating
- Verify payments table exists in Supabase
- Check invoice-generator.ts for errors
- Ensure GST calculations are correct

### Email not sending
- Verify Resend API key
- Check email address validity
- Review Resend dashboard for logs

## Production Deployment

Before deploying to production:
1. **Update prices** to actual amount (₹22,000)
2. **Replace test credentials** with production Razorpay keys
3. **Update email templates** with actual company details
4. **Test thoroughly** with real payment methods
5. **Enable webhooks** for payment status updates
6. **Setup backup** for payment records
7. **Configure SSL** for secure payments

## Support

For any issues or questions:
- Check browser console for errors
- Review server logs
- Verify database tables
- Check Razorpay dashboard
- Review email service logs

The payment system is now fully functional with ₹1 test pricing!