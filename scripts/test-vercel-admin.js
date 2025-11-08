#!/usr/bin/env node

/**
 * Test script for Vercel admin login
 * Tests the live deployment admin login functionality
 */

const VERCEL_URL = 'https://power-ca-website-git-feature-branch-1-krishna-fitschool.vercel.app'

async function testAdminLogin() {
  console.log('🧪 Testing Vercel Admin Login\n')
  console.log('Target URL:', VERCEL_URL)
  console.log('=' .repeat(60))

  try {
    // Test 1: Check if admin-login page is accessible
    console.log('\n📝 Test 1: Checking admin-login page accessibility...')
    const pageResponse = await fetch(`${VERCEL_URL}/admin-login`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    console.log('Status:', pageResponse.status, pageResponse.statusText)
    console.log('Headers:', Object.fromEntries(pageResponse.headers.entries()))

    if (pageResponse.ok) {
      console.log('✅ Admin login page is accessible')
    } else {
      console.log('❌ Admin login page returned error:', pageResponse.status)
      const text = await pageResponse.text()
      console.log('Response body:', text.substring(0, 500))
    }

    // Test 2: Try logging in
    console.log('\n📝 Test 2: Testing admin login API...')
    const loginResponse = await fetch(`${VERCEL_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'Powerca@25'
      })
    })

    console.log('Status:', loginResponse.status, loginResponse.statusText)

    const loginData = await loginResponse.json()
    console.log('Response:', JSON.stringify(loginData, null, 2))

    if (loginResponse.ok && loginData.success) {
      console.log('✅ Admin login API is working correctly')
      console.log('Token received:', loginData.token ? 'Yes' : 'No')

      // Test 3: Try accessing admin page with token
      console.log('\n📝 Test 3: Testing admin page access with token...')
      const adminResponse = await fetch(`${VERCEL_URL}/admin`, {
        method: 'GET',
        headers: {
          'Cookie': `adminToken=${loginData.token}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      console.log('Status:', adminResponse.status, adminResponse.statusText)

      if (adminResponse.ok) {
        console.log('✅ Admin page is accessible with valid token')
      } else {
        console.log('⚠️  Admin page returned:', adminResponse.status)
        console.log('This might be expected if there are redirects')
      }
    } else {
      console.log('❌ Admin login failed:', loginData.message)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Test completed')

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testAdminLogin()
