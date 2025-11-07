#!/usr/bin/env node

/**
 * Test complete admin login flow
 */

async function testLoginFlow() {
  console.log('🧪 Testing Complete Admin Login Flow\n')
  console.log('=' .repeat(60))

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in as PCAadmin...')
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'PCAadmin',
        password: 'Powerca@25'
      })
    })

    const loginData = await loginResponse.json()

    if (!loginResponse.ok || !loginData.success) {
      console.log('❌ Login failed:', loginData.message)
      return
    }

    console.log('✅ Login successful!')
    console.log('Token:', loginData.token.substring(0, 30) + '...')

    // Step 2: Access admin page WITH from_login parameter (simulating redirect)
    console.log('\n📝 Step 2: Accessing /admin?from_login=true (with cookie)...')
    const adminWithParamResponse = await fetch('http://localhost:3000/admin?from_login=true', {
      method: 'GET',
      headers: {
        'Cookie': `adminToken=${loginData.token}`
      },
      redirect: 'manual'
    })

    console.log('Status:', adminWithParamResponse.status)
    console.log('Redirect:', adminWithParamResponse.headers.get('location') || 'None')

    if (adminWithParamResponse.status === 200) {
      console.log('✅ Admin page accessible with from_login parameter!')
    } else if (adminWithParamResponse.status >= 300 && adminWithParamResponse.status < 400) {
      console.log('⚠️  Got redirect to:', adminWithParamResponse.headers.get('location'))
    }

    // Step 3: Access admin page WITHOUT parameter (normal access)
    console.log('\n📝 Step 3: Accessing /admin (normal access with cookie)...')
    const adminNormalResponse = await fetch('http://localhost:3000/admin', {
      method: 'GET',
      headers: {
        'Cookie': `adminToken=${loginData.token}`
      },
      redirect: 'manual'
    })

    console.log('Status:', adminNormalResponse.status)
    console.log('Redirect:', adminNormalResponse.headers.get('location') || 'None')

    if (adminNormalResponse.status === 200) {
      console.log('✅ Admin page accessible!')
    }

    // Step 4: Test without cookie (should redirect to login)
    console.log('\n📝 Step 4: Accessing /admin without cookie (should redirect)...')
    const noAuthResponse = await fetch('http://localhost:3000/admin', {
      method: 'GET',
      redirect: 'manual'
    })

    console.log('Status:', noAuthResponse.status)
    console.log('Redirect:', noAuthResponse.headers.get('location') || 'None')

    if (noAuthResponse.status >= 300 && noAuthResponse.status < 400) {
      const redirectLocation = noAuthResponse.headers.get('location')
      if (redirectLocation && redirectLocation.includes('/admin-login')) {
        console.log('✅ Correctly redirects to login when no auth!')
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests completed!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testLoginFlow()
