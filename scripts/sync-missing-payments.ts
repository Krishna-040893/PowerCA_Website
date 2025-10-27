/**
 * Sync Missing Payments from Razorpay
 *
 * This script fetches payments from Razorpay and saves any missing ones to your database.
 * Use this when payments are successful in Razorpay but not showing in your admin panel.
 *
 * Usage:
 *   npx tsx scripts/sync-missing-payments.ts
 *
 * Or sync specific date range:
 *   npx tsx scripts/sync-missing-payments.ts --from=2025-10-17 --to=2025-10-18
 */

import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const razorpayKeyId = process.env.RAZORPAY_KEY_ID!
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!

if (!supabaseUrl || !supabaseServiceKey || !razorpayKeyId || !razorpayKeySecret) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
})

interface RazorpayPayment {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  email?: string
  contact?: string
  created_at: number
  method?: string
}

async function syncPayments(fromDate?: Date, toDate?: Date) {
  try {
    console.log('\n🔄 Starting payment sync from Razorpay...\n')

    // Calculate date range (default: last 7 days)
    const from = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const to = toDate || new Date()

    console.log(`📅 Date range: ${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`)

    // Fetch payments from Razorpay
    console.log('\n📡 Fetching payments from Razorpay...')

    const payments = await razorpay.payments.all({
      from: Math.floor(from.getTime() / 1000),
      to: Math.floor(to.getTime() / 1000),
      count: 100
    })

    console.log(`✅ Found ${payments.items.length} payments in Razorpay\n`)

    let synced = 0
    let skipped = 0
    let failed = 0

    for (const payment of payments.items as RazorpayPayment[]) {
      // Only process captured/authorized payments
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        console.log(`⏭️  Skipping ${payment.id} (status: ${payment.status})`)
        skipped++
        continue
      }

      // Check if payment already exists in database
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('payment_id', payment.id)
        .single()

      if (existing) {
        console.log(`✓ ${payment.id} already exists in database`)
        skipped++
        continue
      }

      // Get order details
      const { data: orderData } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', payment.order_id)
        .single()

      // Calculate amounts
      const totalAmount = payment.amount / 100
      const paymentAmount = parseFloat((totalAmount / 1.18).toFixed(2))
      const gstAmount = parseFloat((totalAmount - paymentAmount).toFixed(2))

      // Insert payment into database
      const { error } = await supabase
        .from('payments')
        .insert({
          order_id: payment.order_id,
          payment_id: payment.id,
          signature: null,
          amount: totalAmount,
          currency: payment.currency.toUpperCase(),
          status: payment.status, // captured or authorized
          plan: 'PowerCA Implementation',
          email: payment.email || orderData?.customer_email || 'unknown@powerca.in',
          phone: payment.contact || orderData?.customer_phone,
          name: orderData?.customer_name || 'Customer',
          company: orderData?.company,
          gst_number: orderData?.gst_number,
          firm_name: orderData?.firm_name,
          address: orderData?.address,
          created_at: new Date(payment.created_at * 1000).toISOString()
        })

      if (error) {
        console.error(`❌ Failed to insert ${payment.id}:`, error.message)
        failed++
        continue
      }

      // Update payment_orders status
      if (orderData) {
        await supabase
          .from('payment_orders')
          .update({ status: 'paid' })
          .eq('order_id', payment.order_id)
      }

      console.log(`💾 Synced ${payment.id} (₹${totalAmount}) - ${payment.email || 'no email'}`)
      synced++
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Sync Summary:')
    console.log(`   ✅ Synced: ${synced}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📝 Total: ${payments.items.length}`)
    console.log('='.repeat(60) + '\n')

    if (synced > 0) {
      console.log('✨ Database updated successfully!')
      console.log('👉 Check your admin panel at http://localhost:3000/admin/payments\n')
    } else if (skipped > 0 && failed === 0) {
      console.log('✅ All payments are already in sync!\n')
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
let fromDate: Date | undefined
let toDate: Date | undefined

for (const arg of args) {
  if (arg.startsWith('--from=')) {
    fromDate = new Date(arg.split('=')[1])
  } else if (arg.startsWith('--to=')) {
    toDate = new Date(arg.split('=')[1])
  }
}

// Run sync
syncPayments(fromDate, toDate)
