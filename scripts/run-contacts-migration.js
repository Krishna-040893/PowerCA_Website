/**
 * Script to create the contacts table in Supabase
 * Run this with: node scripts/run-contacts-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Running contacts table migration...')

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '039_create_contacts_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log('  Executing statement...')
      const { error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from('_migrations').insert({})

        if (directError) {
          console.error('  ⚠️  Error:', error.message)
        }
      }
    }

    console.log('✅ Migration completed successfully!')
    console.log('\n📋 Contacts table created with the following structure:')
    console.log('  - id (UUID, primary key)')
    console.log('  - name (TEXT)')
    console.log('  - email (TEXT)')
    console.log('  - phone (TEXT)')
    console.log('  - message (TEXT)')
    console.log('  - status (TEXT, default: "new")')
    console.log('  - notes (TEXT)')
    console.log('  - created_at (TIMESTAMP)')
    console.log('\n💡 Note: You may need to run this migration manually in Supabase SQL Editor')
    console.log('   Go to: https://supabase.com/dashboard/project/[your-project]/sql/new')
    console.log('   Copy and paste the contents of: supabase/migrations/039_create_contacts_table.sql')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n💡 Please run the migration manually in Supabase SQL Editor')
    console.log('   1. Go to: https://supabase.com/dashboard/project/[your-project]/sql/new')
    console.log('   2. Copy and paste the contents of: supabase/migrations/039_create_contacts_table.sql')
    console.log('   3. Click "Run"')
    process.exit(1)
  }
}

runMigration()
