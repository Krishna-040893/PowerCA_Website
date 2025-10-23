#!/usr/bin/env node

/**
 * Test admin login locally with PCAadmin credentials
 */

async function testLocalAdminLogin() {
  console.log('🧪 Testing Local Admin Login\n')
  console.log('Target URL: http://localhost:3000')
  console.log('=' .repeat(60))

  try {
    // Test login with PCAadmin credentials
    console.log('\n📝 Testing admin login with PCAadmin...')
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'PCAadmin',
        password: 'Admin@123'
      })
    })

    console.log('Status:', loginResponse.status, loginResponse.statusText)
    console.log('Headers:', Object.fromEntries(loginResponse.headers.entries()))

    const loginData = await loginResponse.json()
    console.log('\n📦 Response:', JSON.stringify(loginData, null, 2))

    if (loginResponse.ok && loginData.success) {
      console.log('\n✅ Admin login successful!')
      console.log('Token received:', loginData.token ? 'Yes (' + loginData.token.substring(0, 20) + '...)' : 'No')
      console.log('User:', loginData.user)

      // Test accessing admin dashboard
      console.log('\n📝 Testing admin dashboard access...')
      const adminResponse = await fetch('http://localhost:3000/admin', {
        method: 'GET',
        headers: {
          'Cookie': `adminToken=${loginData.token}`
        },
        redirect: 'manual'
      })

      console.log('Admin page status:', adminResponse.status)
      console.log('Redirect location:', adminResponse.headers.get('location'))

    } else {
      console.log('\n❌ Admin login failed')
      console.log('Error:', loginData.message || loginData.error)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Test completed')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testLocalAdminLogin()
