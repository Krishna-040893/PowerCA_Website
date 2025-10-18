/**
 * Create Test Failed Payment
 *
 * This script updates one payment to 'failed' status for testing the admin panel UI.
 *
 * Usage:
 *   npx tsx scripts/create-test-failed-payment.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestFailedPayment() {
  try {
    console.log('\n🔄 Creating test failed payment...\n')

    // Get the most recent payment
    const { data: payments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Error fetching payments:', fetchError)
      process.exit(1)
    }

    if (!payments || payments.length === 0) {
      console.log('❌ No payments found in database')
      process.exit(1)
    }

    console.log('📋 Available payments:\n')
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Order ID: ${payment.order_id}`)
      console.log(`   Status: ${payment.status}`)
      console.log(`   Customer: ${payment.name}`)
      console.log(`   Amount: ₹${payment.amount}`)
      console.log(`   Created: ${new Date(payment.created_at).toLocaleString()}`)
      console.log()
    })

    // Pick the first payment to update
    const paymentToUpdate = payments[0]

    console.log(`🎯 Setting payment to 'failed' status:`)
    console.log(`   Order ID: ${paymentToUpdate.order_id}`)
    console.log(`   Current Status: ${paymentToUpdate.status}`)
    console.log()

    // Update the payment to failed status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentToUpdate.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating payment:', updateError)
      process.exit(1)
    }

    console.log('✅ Payment updated successfully!\n')
    console.log('📊 Updated payment details:')
    console.log(`   Order ID: ${updatedPayment.order_id}`)
    console.log(`   Status: ${updatedPayment.status} ❌`)
    console.log(`   Customer: ${updatedPayment.name}`)
    console.log()
    console.log('🎉 You can now view this failed payment in the admin panel!')
    console.log('   1. Go to Admin → Payments')
    console.log('   2. Filter by status: "Failed"')
    console.log('   3. The payment should appear with a red badge and X mark')
    console.log('   4. Click the eye icon to view payment details popup')
    console.log()
    console.log('💡 To revert this payment back to captured:')
    console.log('   1. Use the "Sync Status" button (circular arrow) in the admin panel')
    console.log('   2. Or manually update status in Supabase dashboard')
    console.log()

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
createTestFailedPayment()
