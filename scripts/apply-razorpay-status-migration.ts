/**
 * Script to apply Razorpay status migration
 * This updates the database to use actual Razorpay statuses
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting Razorpay status migration...\n')

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/030_use_razorpay_payment_statuses.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log('📝 Executing migration SQL...\n')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).single()

    if (error) {
      // If the RPC function doesn't exist, try executing the SQL directly
      console.log('⚠️  RPC function not available, attempting direct execution...\n')

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement) {
          console.log(`Executing: ${statement.substring(0, 60)}...`)
          const { error: execError } = await supabase.rpc('exec', { query: statement })

          if (execError) {
            console.error(`❌ Error executing statement: ${execError.message}`)
            throw execError
          }
        }
      }
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n📊 Summary of changes:')
    console.log('   - Updated existing payment statuses:')
    console.log('     • "success" → "captured"')
    console.log('     • "paid" → "captured"')
    console.log('     • "pending" → "created"')
    console.log('   - Updated payments table constraint to use Razorpay statuses')
    console.log('   - Updated payment_orders table constraint to use Razorpay statuses')
    console.log('\n✨ Your database now uses actual Razorpay payment statuses!')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.error('\n⚠️  Manual migration required:')
    console.error('   1. Go to your Supabase Dashboard')
    console.error('   2. Navigate to SQL Editor')
    console.error('   3. Copy the contents of: supabase/migrations/030_use_razorpay_payment_statuses.sql')
    console.error('   4. Paste and execute the SQL')
    process.exit(1)
  }
}

runMigration()
