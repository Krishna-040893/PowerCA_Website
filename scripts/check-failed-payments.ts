/**
 * Check Failed Payments in Database
 *
 * This script queries the database to check for failed payments
 * and diagnose why they might not be showing in the admin panel.
 *
 * Usage:
 *   npx tsx scripts/check-failed-payments.ts
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

async function checkFailedPayments() {
  try {
    console.log('\n🔍 Checking for failed payments in database...\n')

    // Fetch all payments
    const { data: allPayments, error: allError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('❌ Error fetching payments:', allError)
      process.exit(1)
    }

    console.log(`📊 Total payments in database: ${allPayments?.length || 0}\n`)

    // Group payments by status
    const statusGroups: Record<string, number> = {}
    allPayments?.forEach(payment => {
      const status = payment.status || 'null'
      statusGroups[status] = (statusGroups[status] || 0) + 1
    })

    console.log('📈 Payment status breakdown:')
    console.log('─'.repeat(50))
    Object.entries(statusGroups)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status.padEnd(20)} : ${count}`)
      })
    console.log('─'.repeat(50))
    console.log()

    // Check for failed payments (case-insensitive)
    const failedPayments = allPayments?.filter(p =>
      p.status?.toLowerCase() === 'failed'
    ) || []

    console.log(`🔴 Failed payments found: ${failedPayments.length}\n`)

    if (failedPayments.length > 0) {
      console.log('📋 Failed payment details:\n')
      failedPayments.forEach((payment, index) => {
        console.log(`${index + 1}. Order ID: ${payment.order_id}`)
        console.log(`   Status: "${payment.status}" (exact value)`)
        console.log(`   Status (lowercase): "${payment.status?.toLowerCase()}"`)
        console.log(`   Customer: ${payment.name} (${payment.email})`)
        console.log(`   Amount: ₹${payment.amount}`)
        console.log(`   Created: ${new Date(payment.created_at).toLocaleString()}`)
        console.log(`   Payment ID: ${payment.payment_id || 'Not set'}`)
        console.log()
      })
    } else {
      console.log('⚠️  No failed payments found!')
      console.log('   This could mean:')
      console.log('   1. There are no failed payments in the database')
      console.log('   2. The status field has a different value (check breakdown above)')
      console.log()

      // Check for similar status values
      const similarStatuses = Object.keys(statusGroups).filter(status =>
        status.toLowerCase().includes('fail') ||
        status.toLowerCase().includes('error') ||
        status.toLowerCase().includes('decline')
      )

      if (similarStatuses.length > 0) {
        console.log('🔍 Found similar status values:')
        similarStatuses.forEach(status => {
          console.log(`   - "${status}"`)
        })
        console.log()
      }
    }

    // Check for payments without payment_id (might indicate failed/incomplete payments)
    const noPaymentId = allPayments?.filter(p => !p.payment_id) || []
    if (noPaymentId.length > 0) {
      console.log(`⚠️  Payments without payment_id: ${noPaymentId.length}`)
      console.log('   (These might be incomplete/failed payments)\n')
      noPaymentId.slice(0, 5).forEach((payment, index) => {
        console.log(`${index + 1}. Order ID: ${payment.order_id}, Status: ${payment.status}`)
      })
      console.log()
    }

    console.log('✅ Diagnostic complete!\n')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run the diagnostic
checkFailedPayments()
