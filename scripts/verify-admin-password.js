/**
 * Script to verify admin password
 * Run with: node scripts/verify-admin-password.js <username> <password>
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const username = process.argv[2]
const password = process.argv[3]

if (!username || !password) {
  console.log('Usage: node scripts/verify-admin-password.js <username> <password>')
  console.log('Example: node scripts/verify-admin-password.js PCAadmin yourpassword')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyPassword() {
  console.log(`🔍 Checking password for user: ${username}\n`)

  try {
    // Get admin user
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !adminUser) {
      console.error(`❌ User "${username}" not found in database`)
      return
    }

    console.log(`✅ User found: ${adminUser.username}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Active: ${adminUser.is_active ? 'Yes' : 'No'}`)
    console.log('')

    // Verify password
    const isMatch = await bcrypt.compare(password, adminUser.password_hash)

    if (isMatch) {
      console.log('✅ Password is CORRECT!')
      console.log(`\nYou can login with:`)
      console.log(`   Username: ${username}`)
      console.log(`   Password: ${password}`)
    } else {
      console.log('❌ Password is INCORRECT')
      console.log('\nIf you forgot the password, run:')
      console.log(`   node scripts/reset-admin-password.js ${username} newpassword`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

verifyPassword()
