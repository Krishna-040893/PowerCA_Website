/**
 * Script to set up admin user in database
 * Run with: npx tsx scripts/setup-admin.ts
 *
 * Usage:
 * - Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_EMAIL environment variables
 * - Or the script will prompt for credentials
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import * as readline from 'readline'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to prompt for input
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function validatePassword(password: string): Promise<boolean> {
  if (password.length < 12) {
    console.error('❌ Password must be at least 12 characters long')
    return false
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
    console.error('❌ Password must contain uppercase, lowercase, numbers, and special characters')
    return false
  }

  return true
}

async function getAdminCredentials() {
  // Check environment variables first
  const envUsername = process.env.ADMIN_USERNAME
  const envPassword = process.env.ADMIN_PASSWORD
  const envEmail = process.env.ADMIN_EMAIL

  if (envUsername && envPassword && envEmail) {
    console.log('📌 Using credentials from environment variables')

    // Validate password even from env
    if (!await validatePassword(envPassword)) {
      console.error('❌ Password from environment variable does not meet security requirements')
      process.exit(1)
    }

    return {
      username: envUsername,
      password: envPassword,
      email: envEmail
    }
  }

  // Otherwise prompt for credentials
  console.log('🔐 Admin Setup - Please provide admin credentials')
  console.log('─'.repeat(50))

  const username = await prompt('Admin username: ') || 'admin'

  let password = ''
  let isValidPassword = false
  while (!isValidPassword) {
    password = await prompt('Admin password (min 12 chars, must include uppercase, lowercase, numbers, special chars): ')
    isValidPassword = await validatePassword(password)
  }

  const email = await prompt('Admin email: ') || 'admin@example.com'

  return { username, password, email }
}

async function createAdminUser() {
  try {
    console.log('\n🚀 Setting up admin user...\n')

    // Get admin credentials
    const { username: adminUsername, password: adminPassword, email: adminEmail } = await getAdminCredentials()

    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)

    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('username', adminUsername)
      .single()

    if (existingUser) {
      console.log(`\n⚠️  Admin user '${adminUsername}' already exists.`)
      const updateChoice = await prompt('Do you want to update the password? (yes/no): ')

      if (updateChoice.toLowerCase() === 'yes' || updateChoice.toLowerCase() === 'y') {
        // Update existing admin user's password
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({
            password_hash: passwordHash,
            email: adminEmail,
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

        console.log('\n✅ Admin user password updated successfully!')
      } else {
        console.log('\n⏭️  Skipping password update')
        process.exit(0)
      }
    } else {
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

      console.log('\n✅ Admin user created successfully!')
    }

    console.log('\n' + '═'.repeat(50))
    console.log('🔐 Admin Setup Complete')
    console.log('═'.repeat(50))
    console.log('   Username:', adminUsername)
    console.log('   Email:', adminEmail)
    console.log('   Status: Active')
    console.log('─'.repeat(50))
    console.log('\n⚠️  IMPORTANT Security Notes:')
    console.log('   1. Store the password securely')
    console.log('   2. Never commit passwords to version control')
    console.log('   3. Consider using a password manager')
    console.log('   4. Enable 2FA when available')
    console.log('\n📝 Login at: /admin-login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the setup
createAdminUser().then(() => {
  console.log('\n✨ Setup complete!')
  process.exit(0)
})