// Script to fix payment_count in affiliate_referral_payments table
// Run with: node scripts/fix-payment-count.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPaymentCounts() {
  try {
    // 1. Get all affiliate_referral_payments records
    const { data: affiliatePayments, error: fetchError } = await supabase
      .from('affiliate_referral_payments')
      .select('id, referral_id, customer_email, commission_amount, referral_code')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching affiliate payments:', fetchError)
      return
    }

    console.log('Found affiliate payments:', affiliatePayments?.length || 0)
    console.log('\nCurrent records:')
    affiliatePayments?.forEach(p => {
      console.log(`  ID: ${p.id.substring(0, 8)}... | Email: ${p.customer_email} | Commission: ₹${p.commission_amount}`)
    })

    // 2. Get all payments from payments table grouped by email
    const { data: allPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('email, order_id')
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return
    }

    // Count payments per email (deduplicate by order_id)
    const paymentCountByEmail = new Map()
    const processedOrderIds = new Set()

    allPayments?.forEach(payment => {
      if (payment.order_id && processedOrderIds.has(payment.order_id)) {
        return // Skip duplicate order_id
      }
      if (payment.order_id) {
        processedOrderIds.add(payment.order_id)
      }

      const email = payment.email?.toLowerCase()
      if (email) {
        paymentCountByEmail.set(email, (paymentCountByEmail.get(email) || 0) + 1)
      }
    })

    console.log('\n\nPayment counts by email:')
    paymentCountByEmail.forEach((count, email) => {
      console.log(`  ${email}: ${count} payments`)
    })

    // 3. Update records that need fixing
    console.log('\n\nUpdating records...')
    for (const payment of affiliatePayments || []) {
      const email = payment.customer_email?.toLowerCase()
      const actualCount = paymentCountByEmail.get(email) || 1

      // Calculate expected commission based on count
      const BASE_PRICE = 25000
      const COMMISSION_RATE = 10
      const expectedCommission = BASE_PRICE * actualCount * (COMMISSION_RATE / 100)

      // Always update to ensure correct count and commission
      console.log(`\n  Updating ${payment.customer_email}:`)
      console.log(`    New count: ${actualCount}`)
      console.log(`    Current commission: ₹${payment.commission_amount} | Expected: ₹${expectedCommission}`)

      if (true) {

        const { error: updateError } = await supabase
          .from('affiliate_referral_payments')
          .update({
            payment_count: actualCount,
            commission_amount: expectedCommission  // Also fix commission if needed
          })
          .eq('id', payment.id)

        if (updateError) {
          console.error(`    Error updating: ${updateError.message}`)
        } else {
          console.log(`    ✓ Updated successfully`)
        }
      }
    }

    console.log('\n\nDone!')

  } catch (error) {
    console.error('Error:', error)
  }
}

fixPaymentCounts()
