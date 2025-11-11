/**
 * Test script to check forgot password functionality
 * Run with: node test-forgot-password.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const testEmail = 'nikilarajan0616@gmail.com'

async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password Functionality\n')
  console.log('=' .repeat(60))

  // Step 1: Check Supabase configuration
  console.log('\n📝 Step 1: Checking Supabase configuration...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials missing')
    return
  }
  console.log('✅ Supabase configured')

  // Step 2: Check Resend API key
  console.log('\n📝 Step 2: Checking Resend configuration...')
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY missing')
    return
  }
  console.log('✅ Resend API key found')
  console.log(`   Key: ${resendApiKey.substring(0, 10)}...`)

  // Step 3: Check if email exists in database
  console.log(`\n📝 Step 3: Checking if email exists: ${testEmail}`)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Check registration_forms (clients)
  const { data: client, error: clientError } = await supabase
    .from('registration_forms')
    .select('id, email, full_name, password')
    .eq('email', testEmail)
    .maybeSingle()

  if (clientError) {
    console.error('❌ Error querying registration_forms:', clientError.message)
  }

  if (client) {
    console.log('✅ Email found in registration_forms (Client)')
    console.log(`   ID: ${client.id}`)
    console.log(`   Name: ${client.full_name}`)
    console.log(`   Email: ${client.email}`)
    console.log(`   Has Password: ${client.password ? 'Yes' : 'No'}`)
  } else {
    console.log('❌ Email NOT found in registration_forms')
  }

  // Check affiliate_registrations
  const { data: affiliate, error: affiliateError } = await supabase
    .from('affiliate_registrations')
    .select('id, email, full_name, password')
    .eq('email', testEmail)
    .maybeSingle()

  if (affiliateError) {
    console.error('❌ Error querying affiliate_registrations:', affiliateError.message)
  }

  if (affiliate) {
    console.log('✅ Email found in affiliate_registrations (Affiliate)')
    console.log(`   ID: ${affiliate.id}`)
    console.log(`   Name: ${affiliate.full_name}`)
    console.log(`   Email: ${affiliate.email}`)
    console.log(`   Has Password: ${affiliate.password ? 'Yes' : 'No'}`)
  } else {
    console.log('❌ Email NOT found in affiliate_registrations')
  }

  const foundUser = client || affiliate
  const userType = client ? 'client' : 'affiliate'

  if (!foundUser) {
    console.log('\n❌ EMAIL NOT FOUND IN DATABASE')
    console.log('   This email needs to be registered first before using forgot password')
    return
  }

  // Step 4: Test Resend email sending
  console.log('\n📝 Step 4: Testing Resend email service...')
  const resend = new Resend(resendApiKey)

  try {
    const testEmailHtml = `
      <h1>Test Email from PowerCA</h1>
      <p>This is a test email to verify Resend is working.</p>
      <p>If you received this, the email service is configured correctly.</p>
    `

    console.log('   Sending test email...')
    const result = await resend.emails.send({
      from: 'PowerCA <contact@powerca.in>',
      to: testEmail,
      subject: 'Test Email - PowerCA Password Reset',
      html: testEmailHtml,
    })

    console.log('✅ Test email sent successfully!')
    console.log('   Email ID:', result.data?.id || result.id)
    console.log('\n   📧 Check your inbox:', testEmail)
    console.log('   ⚠️  Also check SPAM/JUNK folder!')

  } catch (emailError) {
    console.error('\n❌ Failed to send test email')
    console.error('   Error:', emailError.message)
    if (emailError.message.includes('not verified')) {
      console.log('\n💡 FIX: The domain "powerca.in" needs to be verified in Resend')
      console.log('   1. Go to https://resend.com/domains')
      console.log('   2. Verify the domain by adding DNS records')
      console.log('   3. OR use a verified email address (like your personal email)')
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Test completed')
}

testForgotPassword().catch(error => {
  console.error('❌ Test failed:', error)
})
