/**
 * Script to test admin login API
 * Run with: node scripts/test-admin-login.js
 */

require('dotenv').config({ path: '.env.local' })
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const jwtSecret = process.env.NEXTAUTH_SECRET

if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdminLogin() {
  const testUsername = 'PCAadmin'
  const testPassword = 'Admin@123'

  console.log('🧪 Testing Admin Login Flow\n')
  console.log('Test Credentials:')
  console.log(`   Username: ${testUsername}`)
  console.log(`   Password: ${testPassword}\n`)

  try {
    // Step 1: Fetch admin user
    console.log('Step 1: Fetching admin user from database...')
    const { data: adminUser, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', testUsername)
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError.message)
      return
    }

    if (!adminUser) {
      console.error('❌ User not found')
      return
    }

    console.log('✅ User found in database')
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Username: ${adminUser.username}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Active: ${adminUser.is_active}`)
    console.log(`   Locked: ${adminUser.locked_until || 'No'}`)
    console.log(`   Login Attempts: ${adminUser.login_attempts || 0}\n`)

    // Step 2: Check if account is locked
    if (adminUser.locked_until) {
      const lockoutTime = new Date(adminUser.locked_until).getTime()
      if (lockoutTime > Date.now()) {
        const minutesRemaining = Math.ceil((lockoutTime - Date.now()) / 60000)
        console.error(`❌ Account is locked for ${minutesRemaining} more minutes`)
        return
      }
    }

    // Step 3: Check if account is active
    if (!adminUser.is_active) {
      console.error('❌ Account is disabled')
      return
    }

    console.log('✅ Account is active and not locked\n')

    // Step 4: Verify password
    console.log('Step 2: Verifying password...')
    const isValidPassword = await bcrypt.compare(testPassword, adminUser.password_hash)

    if (!isValidPassword) {
      console.error('❌ Password is incorrect')
      return
    }

    console.log('✅ Password is correct\n')

    // Step 5: Generate JWT token
    console.log('Step 3: Generating JWT token...')
    const token = jwt.sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin',
        loginTime: new Date().toISOString()
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('✅ JWT token generated successfully')
    console.log(`   Token length: ${token.length} characters`)
    console.log(`   Token parts: ${token.split('.').length} (should be 3)\n`)

    // Step 6: Verify the token
    console.log('Step 4: Verifying JWT token...')
    const decoded = jwt.verify(token, jwtSecret)
    console.log('✅ JWT token is valid')
    console.log(`   Decoded payload:`, JSON.stringify(decoded, null, 2))

    console.log('\n' + '═'.repeat(60))
    console.log('✅ ALL TESTS PASSED - Login should work!')
    console.log('═'.repeat(60))
    console.log('\nIf login still fails on Vercel, the issue is likely:')
    console.log('1. Environment variables not set on Vercel')
    console.log('2. NEXTAUTH_SECRET mismatch between local and Vercel')
    console.log('3. Supabase credentials not accessible from Vercel')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
  }
}

testAdminLogin()
