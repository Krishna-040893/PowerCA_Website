/**
 * Quick script to set up admin user
 * Run with: npx tsx scripts/quick-setup-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local instead of .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('✅ Environment variables loaded from .env.local')
console.log('📌 Supabase URL:', supabaseUrl)

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdmin() {
  try {
    console.log('\n🚀 Setting up admin user...\n')

    // Admin credentials
    const adminUsername = 'superadmin'
    const adminPassword = 'Admin@123456789' // Updated to meet 12-char requirement
    const adminEmail = 'admin@powerca.in'

    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)
    console.log('🔐 Password hashed successfully')

    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('username', adminUsername)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing user:', checkError)
      process.exit(1)
    }

    if (existingUser) {
      console.log(`⚠️  Admin user '${adminUsername}' already exists. Updating password...`)

      // Update existing admin user's password (don't update email to avoid duplicate error)
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
          login_attempts: 0,
          locked_until: null,
          is_active: true
        })
        .eq('username', adminUsername)

      if (updateError) {
        console.error('❌ Error updating admin user:', updateError)
        process.exit(1)
      }

      console.log('✅ Admin user password updated successfully!')
    } else {
      console.log('📝 Creating new admin user...')

      // Create new admin user
      const { data: newUser, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          username: adminUsername,
          password_hash: passwordHash,
          email: adminEmail,
          is_active: true
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating admin user:', insertError)
        process.exit(1)
      }

      console.log('✅ Admin user created successfully!')
    }

    console.log('\n' + '═'.repeat(60))
    console.log('🔐 Admin Setup Complete')
    console.log('═'.repeat(60))
    console.log('   Username:     ', adminUsername)
    console.log('   Password:     ', adminPassword)
    console.log('   Email:        ', adminEmail)
    console.log('   Login URL:    ', 'http://localhost:3002/admin-login')
    console.log('─'.repeat(60))
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!')
    console.log('\n✨ You can now login to the admin portal\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the setup
setupAdmin().then(() => {
  process.exit(0)
})
