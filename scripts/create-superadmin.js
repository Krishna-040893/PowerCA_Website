/**
 * Script to create superadmin account
 * Run with: node scripts/create-superadmin.js
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSuperadmin() {
  console.log('🔐 Creating superadmin account...\n')

  const username = 'superadmin'
  const password = 'Admin@123'
  const email = 'superadmin@powerca.in'

  try {
    // Check if superadmin already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (existing) {
      console.log('⚠️  Superadmin already exists, updating password...\n')

      const passwordHash = await bcrypt.hash(password, 12)

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
        console.error('❌ Error updating superadmin:', updateError.message)
        return
      }

      console.log('✅ Superadmin password updated!')
    } else {
      console.log('Creating new superadmin account...\n')

      const passwordHash = await bcrypt.hash(password, 12)

      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          username,
          password_hash: passwordHash,
          email,
          is_active: true
        })

      if (insertError) {
        console.error('❌ Error creating superadmin:', insertError.message)
        return
      }

      console.log('✅ Superadmin created successfully!')
    }

    console.log('\n═'.repeat(50))
    console.log('🔐 Superadmin Credentials')
    console.log('═'.repeat(50))
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
    console.log(`   Email: ${email}`)
    console.log(`   Status: Active`)
    console.log('─'.repeat(50))
    console.log('\n📝 Login URLs:')
    console.log('   Local: http://localhost:3000/admin-login')
    console.log('   Vercel: https://power-ca-website-1nuqc0ll0-krishna-fitschool.vercel.app/admin-login')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createSuperadmin()
