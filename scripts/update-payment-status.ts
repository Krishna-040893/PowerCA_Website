/**
 * Update Payment Status
 *
 * This script allows you to update payment status for testing purposes.
 * Useful for testing different payment states in the admin panel.
 *
 * Usage:
 *   npx tsx scripts/update-payment-status.ts <order_id> <new_status>
 *
 * Example:
 *   npx tsx scripts/update-payment-status.ts order_RUoe7a5whBX4mZ failed
 *   npx tsx scripts/update-payment-status.ts order_RUoe7a5whBX4mZ captured
 *
 * Valid statuses:
 *   - created (pending payment)
 *   - authorized (payment authorized but not captured)
 *   - captured (payment successful)
 *   - failed (payment failed)
 *   - refunded (payment refunded)
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

const VALID_STATUSES = ['created', 'authorized', 'captured', 'failed', 'refunded']

async function updatePaymentStatus() {
  try {
    const orderId = process.argv[2]
    const newStatus = process.argv[3]?.toLowerCase()

    if (!orderId || !newStatus) {
      console.log('\n❌ Missing arguments\n')
      console.log('Usage:')
      console.log('  npx tsx scripts/update-payment-status.ts <order_id> <new_status>\n')
      console.log('Example:')
      console.log('  npx tsx scripts/update-payment-status.ts order_RUoe7a5whBX4mZ failed\n')
      console.log('Valid statuses:', VALID_STATUSES.join(', '))
      console.log()
      process.exit(1)
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      console.log(`\n❌ Invalid status: "${newStatus}"\n`)
      console.log('Valid statuses:', VALID_STATUSES.join(', '))
      console.log()
      process.exit(1)
    }

    console.log(`\n🔄 Updating payment status...\n`)

    // Find the payment
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (fetchError || !payment) {
      console.error(`❌ Payment not found: ${orderId}`)
      console.error('Error:', fetchError?.message)
      process.exit(1)
    }

    console.log('📋 Current payment details:')
    console.log(`   Order ID: ${payment.order_id}`)
    console.log(`   Customer: ${payment.name}`)
    console.log(`   Amount: ₹${payment.amount}`)
    console.log(`   Current Status: ${payment.status}`)
    console.log()

    // Update the status
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating payment:', updateError)
      process.exit(1)
    }

    console.log('✅ Payment status updated successfully!\n')
    console.log('📊 New payment details:')
    console.log(`   Order ID: ${updatedPayment.order_id}`)
    console.log(`   Customer: ${updatedPayment.name}`)
    console.log(`   Amount: ₹${updatedPayment.amount}`)
    console.log(`   New Status: ${updatedPayment.status} ${getStatusEmoji(newStatus)}`)
    console.log()

    // Update affiliate referrals if any
    const { data: referrals } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('order_id', orderId)

    if (referrals && referrals.length > 0) {
      console.log('🔗 Found affiliate referral(s) for this payment')

      const referralStatus = newStatus === 'captured' ? 'completed' : newStatus === 'failed' ? 'failed' : 'pending'

      const { error: refUpdateError } = await supabase
        .from('affiliate_referrals')
        .update({
          status: referralStatus,
          updated_at: new Date().toISOString(),
          converted_at: newStatus === 'captured' ? new Date().toISOString() : null
        })
        .eq('order_id', orderId)

      if (refUpdateError) {
        console.error('⚠️  Failed to update affiliate referral status:', refUpdateError)
      } else {
        console.log(`   Updated referral status to: ${referralStatus}`)
      }
      console.log()
    }

    console.log('🎉 Done! Refresh the admin panel to see the changes.')
    console.log()

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'captured': return '✅'
    case 'authorized': return '🔵'
    case 'failed': return '❌'
    case 'refunded': return '🔄'
    case 'created': return '⏳'
    default: return ''
  }
}

// Run the script
updatePaymentStatus()
