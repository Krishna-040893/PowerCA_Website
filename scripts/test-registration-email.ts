/**
 * Test Script: Send Sample Registration Notification Emails
 *
 * This script sends test emails to contact@powerca.in to preview
 * the new admin registration notification template design.
 *
 * Usage: npx tsx scripts/test-registration-email.ts
 */

// Load environment variables
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

import { sendAdminRegistrationNotification } from '../src/lib/send-emails'

async function sendTestEmails() {
  console.log('📧 Sending test registration notification emails...\n')

  // Test 1: Professional Registration
  console.log('1️⃣ Sending Professional Registration Email...')
  const professionalResult = await sendAdminRegistrationNotification({
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh.kumar@example.com',
    userPhone: '+91 98765 43210',
    userRole: 'professional',
    professionalType: 'CA',
    membershipNo: '123456',
    registeredAt: new Date().toISOString(),
  })

  if (professionalResult.success) {
    console.log('✅ Professional email sent successfully!')
    console.log(`   Email ID: ${(professionalResult.data as any)?.data?.id || 'N/A'}\n`)
  } else {
    console.error('❌ Failed to send professional email:')
    console.error('   Error:', professionalResult.error)
    console.log('')
  }

  // Wait 2 seconds between emails
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test 2: Student Registration
  console.log('2️⃣ Sending Student Registration Email...')
  const studentResult = await sendAdminRegistrationNotification({
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@example.com',
    userPhone: '+91 87654 32109',
    userRole: 'student',
    registrationNo: 'SRN2024001',
    instituteName: 'Institute of Chartered Accountants of India',
    registeredAt: new Date().toISOString(),
  })

  if (studentResult.success) {
    console.log('✅ Student email sent successfully!')
    console.log(`   Email ID: ${(studentResult.data as any)?.data?.id || 'N/A'}\n`)
  } else {
    console.error('❌ Failed to send student email:')
    console.error('   Error:', studentResult.error)
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Test emails sent!')
  console.log('📬 Check contact@powerca.in inbox for:')
  console.log('   1. Professional Registration (Blue theme 💼)')
  console.log('   2. Student Registration (Purple theme 🎓)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Run the test
sendTestEmails().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
