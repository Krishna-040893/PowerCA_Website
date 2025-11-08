/**
 * Test complete forgot password flow
 */

async function testForgotPasswordFlow() {
  console.log('🧪 Testing Complete Forgot Password Flow\n')
  console.log('=' .repeat(60))

  const testEmail = 'nikilarajan0616@gmail.com'
  const baseUrl = 'http://localhost:3009' // Your dev server port

  try {
    // Step 1: Request password reset
    console.log('\n📝 Step 1: Requesting password reset...')
    console.log(`   Email: ${testEmail}`)
    console.log(`   URL: ${baseUrl}/api/auth/forgot-password`)

    const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      })
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)

    const data = await response.json()
    console.log(`   Response:`, JSON.stringify(data, null, 2))

    if (response.ok && data.success) {
      console.log('\n✅ Password reset request successful!')
      console.log('\n📧 Check your email inbox:')
      console.log(`   Email: ${testEmail}`)
      console.log('   Subject: Reset Your PowerCA Password')
      console.log('   From: PowerCA <contact@powerca.in>')
      console.log('\n⚠️  IMPORTANT: Also check your SPAM/JUNK folder!')
      console.log('\n💡 The email contains:')
      console.log('   - Reset password link (valid for 1 hour)')
      console.log('   - Button to reset password')
      console.log('   - Security notice')

      console.log('\n📌 Next steps:')
      console.log('   1. Check your email')
      console.log('   2. Click the reset password link')
      console.log('   3. Enter your new password')
      console.log('   4. Login with new password')

    } else {
      console.log('\n❌ Password reset request failed')
      console.log('   Error:', data.message || data.error)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Test completed')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('   Make sure your dev server is running on port 3009')
    console.error('   Run: npm run dev')
  }
}

testForgotPasswordFlow()
