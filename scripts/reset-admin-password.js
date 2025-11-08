/**
 * Script to reset admin password
 * Run with: node scripts/reset-admin-password.js <username> <new-password>
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
const newPassword = process.argv[3]

if (!username || !newPassword) {
  console.log('Usage: node scripts/reset-admin-password.js <username> <new-password>')
  console.log('Example: node scripts/reset-admin-password.js superadmin Powerca@25')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetPassword() {
  console.log(`🔄 Resetting password for user: ${username}\n`)

  try {
    // Get admin user
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (fetchError || !adminUser) {
      console.error(`❌ User "${username}" not found in database`)
      console.log('\nAvailable users:')

      const { data: allUsers } = await supabase
        .from('admin_users')
        .select('username, email')

      if (allUsers && allUsers.length > 0) {
        allUsers.forEach(u => {
          console.log(`   - ${u.username} (${u.email})`)
        })
      }
      return
    }

    // Hash the new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update the password and reset login attempts
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: passwordHash,
        login_attempts: 0,
        locked_until: null,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('username', username)

    if (updateError) {
      console.error('❌ Error updating password:', updateError.message)
      return
    }

    console.log('✅ Password reset successfully!\n')
    console.log('═'.repeat(50))
    console.log('🔐 Updated Admin Credentials')
    console.log('═'.repeat(50))
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${newPassword}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Status: Active`)
    console.log('─'.repeat(50))
    console.log('\n📝 You can now login at:')
    console.log('   Local: http://localhost:3000/admin-login')
    console.log('   Vercel: https://your-vercel-url.vercel.app/admin-login')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

resetPassword()
