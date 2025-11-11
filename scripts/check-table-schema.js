/**
 * Check table schema and columns
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkSchema() {
  console.log('🔍 Checking database schema...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Check registration_forms columns
  console.log('📋 registration_forms table columns:')
  const { data: regData, error: regError } = await supabase
    .from('registration_forms')
    .select('*')
    .limit(1)

  if (regError) {
    console.error('❌ Error:', regError.message)
  } else {
    const columns = regData && regData.length > 0 ? Object.keys(regData[0]) : []
    console.log('  ', columns.join(', '))
    console.log(`   Total: ${columns.length} columns`)
    console.log(`   Has reset_token: ${columns.includes('reset_token') ? '✅' : '❌'}`)
    console.log(`   Has reset_token_expiry: ${columns.includes('reset_token_expiry') ? '✅' : '❌'}`)
    console.log(`   Has name: ${columns.includes('name') ? '✅' : '❌'}`)
    console.log(`   Has full_name: ${columns.includes('full_name') ? '✅' : '❌'}`)
    console.log(`   Has password: ${columns.includes('password') ? '✅' : '❌'}`)
    console.log(`   Has password_hash: ${columns.includes('password_hash') ? '✅' : '❌'}`)
  }

  // Check affiliate_registrations columns
  console.log('\n📋 affiliate_registrations table columns:')
  const { data: affData, error: affError } = await supabase
    .from('affiliate_registrations')
    .select('*')
    .limit(1)

  if (affError) {
    console.error('❌ Error:', affError.message)
  } else {
    const columns = affData && affData.length > 0 ? Object.keys(affData[0]) : []
    console.log('  ', columns.join(', '))
    console.log(`   Total: ${columns.length} columns`)
    console.log(`   Has reset_token: ${columns.includes('reset_token') ? '✅' : '❌'}`)
    console.log(`   Has reset_token_expiry: ${columns.includes('reset_token_expiry') ? '✅' : '❌'}`)
    console.log(`   Has full_name: ${columns.includes('full_name') ? '✅' : '❌'}`)
    console.log(`   Has password: ${columns.includes('password') ? '✅' : '❌'}`)
  }

  // Check if test email exists
  console.log('\n📧 Checking for email: nikilarajan0616@gmail.com')
  const { data: userData, error: userError } = await supabase
    .from('registration_forms')
    .select('id, name, email')
    .eq('email', 'nikilarajan0616@gmail.com')
    .maybeSingle()

  if (userError) {
    console.error('❌ Error:', userError.message)
  } else if (userData) {
    console.log('✅ Found:', userData)
  } else {
    console.log('❌ Email NOT found in registration_forms')
  }

  const { data: affUserData, error: affUserError } = await supabase
    .from('affiliate_registrations')
    .select('id, full_name, email')
    .eq('email', 'nikilarajan0616@gmail.com')
    .maybeSingle()

  if (affUserError) {
    console.error('❌ Error:', affUserError.message)
  } else if (affUserData) {
    console.log('✅ Found in affiliates:', affUserData)
  } else {
    console.log('❌ Email NOT found in affiliate_registrations')
  }
}

checkSchema()
