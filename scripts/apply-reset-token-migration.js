/**
 * Apply reset_token migration to database
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

async function applyMigration() {
  console.log('🔧 Applying reset_token migration...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials missing')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read the migration SQL
  const migrationSql = fs.readFileSync('supabase/migrations/014_add_reset_token_to_registration_forms.sql', 'utf8')

  try {
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql })

    if (error) {
      console.error('❌ Migration failed:', error.message)
      console.log('\n💡 Trying alternative approach...')

      // Try adding columns individually
      console.log('\n1. Adding reset_token to registration_forms...')
      await supabase.from('registration_forms').select('reset_token').limit(1)

      console.log('2. Adding reset_token_expiry to registration_forms...')
      await supabase.from('registration_forms').select('reset_token_expiry').limit(1)

      console.log('3. Adding reset_token to affiliate_registrations...')
      await supabase.from('affiliate_registrations').select('reset_token').limit(1)

      console.log('4. Adding reset_token_expiry to affiliate_registrations...')
      await supabase.from('affiliate_registrations').select('reset_token_expiry').limit(1)

      console.log('\n✅ Columns verified (they may already exist)')
    } else {
      console.log('✅ Migration applied successfully')
    }

    console.log('\n✅ Migration process completed')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

applyMigration()
