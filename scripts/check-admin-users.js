/**
 * Script to check admin_users table in Supabase
 * Run with: node scripts/check-admin-users.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminUsers() {
  console.log('🔍 Checking admin_users table in Supabase...\n')

  try {
    // Fetch all admin users
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching admin users:', error.message)
      if (error.code === '42P01') {
        console.log('\n⚠️  Table "admin_users" does not exist!')
        console.log('   Run: node scripts/setup-admin.js to create it')
      }
      return
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found in database')
      console.log('   Run: node scripts/setup-admin.js to create one')
      return
    }

    console.log(`✅ Found ${adminUsers.length} admin user(s):\n`)

    adminUsers.forEach((user, idx) => {
      console.log(`${idx + 1}. Admin User:`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Active: ${user.is_active ? '✅' : '❌'}`)
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
      console.log(`   Last Login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}`)
      console.log(`   Login Attempts: ${user.login_attempts || 0}`)
      console.log(`   Locked Until: ${user.locked_until ? new Date(user.locked_until).toLocaleString() : 'Not locked'}`)
      console.log(`   Password Hash: ${user.password_hash ? 'Set ✅' : 'NOT SET ❌'}`)
      console.log('')
    })

    // Check if default superadmin exists
    const superadmin = adminUsers.find(u => u.username === 'superadmin')
    if (superadmin) {
      console.log('✅ Default superadmin account exists')
      console.log('   Username: superadmin')
      console.log('   Password: Admin@123 (if not changed)')

      if (!superadmin.is_active) {
        console.log('   ⚠️  WARNING: Superadmin is not active!')
      }

      if (superadmin.locked_until && new Date(superadmin.locked_until) > new Date()) {
        console.log('   ⚠️  WARNING: Superadmin is locked!')
        console.log(`   Unlocks at: ${new Date(superadmin.locked_until).toLocaleString()}`)
      }
    } else {
      console.log('⚠️  Default superadmin account NOT found')
      console.log('   Run: node scripts/setup-admin.js to create it')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkAdminUsers()
