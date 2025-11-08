import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestInvoice() {
  try {
    console.log('Creating test invoice for PCA-202510-9087...')

    // First, create a payment record without user_id
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: null,
        order_id: 'order_RU3iancwIoMecf',
        payment_id: 'test_payment_id',
        signature: 'test_signature',
        amount: 12.98,
        currency: 'INR',
        status: 'success',
        plan: 'PowerCA Implementation',
        email: 'test@powerca.in',
        phone: '+91 98765 43210',
        name: 'Test Customer',
        firm_name: 'TBS Technologies',
        company: 'TBS Technologies [P] Limited',
        gst_number: '33AABCT1234C1Z5',
        address: 'No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet, 642126, TamilNadu'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to create payment:', paymentError)
      return
    }

    console.log('Payment created:', payment.id)

    // Now create the invoice
    const baseAmount = 11.00 // Base amount excluding GST
    const gstAmount = 1.98 // 18% GST
    const totalAmount = 12.98

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: 'PCA-202510-9087',
        payment_id: payment.id,
        amount: baseAmount,
        gst: gstAmount,
        total: totalAmount,
        status: 'paid'
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError)
      return
    }

    console.log('✅ Invoice created successfully:', invoice.invoice_number)
    console.log('You can now test the invoice download at:')
    console.log(`http://localhost:3003/payment-success?orderId=order_RU3iancwIoMecf&invoiceId=PCA-202510-9087`)

  } catch (error) {
    console.error('Error:', error)
  }
}

createTestInvoice()
