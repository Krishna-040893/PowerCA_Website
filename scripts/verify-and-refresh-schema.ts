/**
 * Verify payment fields and refresh Supabase schema cache
 *
 * Usage:
 *   npx tsx scripts/verify-and-refresh-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAndRefresh() {
  try {
    console.log('\n🔍 Checking database columns...\n')

    // Query the information schema to see actual columns
    const { data: columns, error } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'affiliate_referral_payments'
          ORDER BY ordinal_position;
        `
      })

    if (error) {
      console.log('⚠️  RPC method not available, using direct query...\n')

      // Direct query to check columns
      const query = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'affiliate_referral_payments'
        ORDER BY ordinal_position;
      `

      console.log('📋 Database columns in affiliate_referral_payments table:\n')
      console.log('Run this query in Supabase SQL Editor to verify:\n')
      console.log('─'.repeat(70))
      console.log(query)
      console.log('─'.repeat(70))
      console.log()

    } else {
      console.log('✅ Table columns:', columns)
    }

    console.log('\n📝 To fix the schema cache error, follow these steps:\n')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Run this query to verify columns exist:\n')
    console.log('─'.repeat(70))
    console.log(`
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'affiliate_referral_payments'
  AND column_name IN ('payment_mode', 'payment_date')
ORDER BY column_name;
    `)
    console.log('─'.repeat(70))
    console.log()
    console.log('3. If columns are missing, run this migration:\n')
    console.log('─'.repeat(70))
    console.log(`
-- Add the missing columns
ALTER TABLE public.affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50);

ALTER TABLE public.affiliate_referral_payments
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
    `)
    console.log('─'.repeat(70))
    console.log()
    console.log('4. After adding columns, RESTART your Next.js dev server:')
    console.log('   - Press Ctrl+C to stop the current dev server')
    console.log('   - Run: npm run dev')
    console.log()
    console.log('5. Clear your browser cache or open in incognito mode\n')
    console.log('This will refresh the Supabase schema cache.\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyAndRefresh()
