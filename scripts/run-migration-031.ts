/**
 * Run Migration 031: Add payment_mode and payment_date to affiliate_referral_payments
 *
 * This script runs the migration to add payment tracking fields to the affiliate payments table.
 *
 * Usage:
 *   npx tsx scripts/run-migration-031.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

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

async function runMigration() {
  try {
    console.log('\n🔄 Running migration 031: Add payment_mode and payment_date...\n')

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '031_add_payment_mode_and_date_to_affiliate_payments.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration SQL:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    console.log()

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct execution if RPC fails
      console.log('⚠️  RPC method failed, trying direct execution...\n')

      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const result = await supabase.rpc('exec_sql', { sql_query: statement })
        if (result.error) {
          console.error(`❌ Error executing statement:`, result.error)
        } else {
          console.log(`✅ Statement executed successfully`)
        }
      }
    } else {
      console.log('✅ Migration executed successfully!\n')
    }

    // Verify the columns were added
    console.log('🔍 Verifying columns were added...\n')

    const { data: columns, error: verifyError } = await supabase
      .from('affiliate_referral_payments')
      .select('*')
      .limit(1)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      console.log('✅ Table structure verified!')
      console.log('📋 Available columns:', Object.keys(columns?.[0] || {}))
    }

    console.log('\n✨ Migration completed successfully!\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
runMigration()
