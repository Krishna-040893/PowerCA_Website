/**
 * Add payment_mode and payment_date fields to affiliate_referral_payments table
 *
 * This script manually adds the required fields using Supabase admin client.
 * Run this if the SQL migration doesn't work.
 *
 * Usage:
 *   npx tsx scripts/add-affiliate-payment-fields.ts
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

async function addFields() {
  try {
    console.log('\n🔄 Adding payment_mode and payment_date fields...\n')

    // Check current table structure
    console.log('📋 Checking current table structure...')
    const { data: sampleRow, error: checkError } = await supabase
      .from('affiliate_referral_payments')
      .select('*')
      .limit(1)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('❌ Error checking table:', checkError)
      process.exit(1)
    }

    const existingColumns = sampleRow ? Object.keys(sampleRow) : []
    console.log('   Current columns:', existingColumns.join(', '))

    if (existingColumns.includes('payment_mode') && existingColumns.includes('payment_date')) {
      console.log('\n✅ Fields already exist! No migration needed.\n')
      return
    }

    console.log('\n⚠️  Fields are missing. You need to run the SQL migration manually.\n')
    console.log('📝 Steps to run the migration:\n')
    console.log('1. Open Supabase Dashboard: https://app.supabase.com/')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy and paste this SQL:\n')
    console.log('─'.repeat(70))
    console.log(`
-- Add payment mode and payment date fields
ALTER TABLE affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50);

ALTER TABLE affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN affiliate_referral_payments.payment_mode IS 'Method used to pay affiliate commission';
COMMENT ON COLUMN affiliate_referral_payments.payment_date IS 'Date when the company paid the affiliate commission';
    `)
    console.log('─'.repeat(70))
    console.log('\n4. Click "Run" button')
    console.log('5. After successful execution, try the "Mark Paid" feature again\n')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run
addFields()
