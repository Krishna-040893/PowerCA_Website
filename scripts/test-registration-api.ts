/**
 * Test Script: Trigger Registration to Send Email
 *
 * This script makes API calls to the registration endpoint to trigger
 * email notifications to contact@powerca.in
 *
 * Usage: npx tsx scripts/test-registration-api.ts
 */

const BASE_URL = 'http://localhost:3009'

async function testProfessionalRegistration() {
  console.log('📧 Testing Professional Registration Email...\n')

  const response = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test Professional - Rajesh Kumar',
      email: `test.professional.${Date.now()}@example.com`,
      phone: '+919876543210',
      password: 'TestPassword123!',
      role: 'professional',
      professionalType: 'CA',
      membershipNumber: 'TEST123456',
      agreedToTerms: true,
    }),
  })

  const data = await response.json()

  if (response.ok) {
    console.log('✅ Professional registration successful!')
    console.log('   User ID:', data.id)
    console.log('   📧 Check contact@powerca.in for BLUE themed email')
  } else {
    console.error('❌ Registration failed:', data.error)
  }
  console.log('')
}

async function testStudentRegistration() {
  console.log('📧 Testing Student Registration Email...\n')

  const response = await fetch(`${BASE_URL}/api/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test Student - Priya Sharma',
      email: `test.student.${Date.now()}@example.com`,
      phone: '+918765432109',
      password: 'TestPassword123!',
      role: 'student',
      registrationNumber: 'SRN2024TEST001',
      instituteName: 'Institute of Chartered Accountants of India',
      agreedToTerms: true,
    }),
  })

  const data = await response.json()

  if (response.ok) {
    console.log('✅ Student registration successful!')
    console.log('   User ID:', data.id)
    console.log('   📧 Check contact@powerca.in for PURPLE themed email')
  } else {
    console.error('❌ Registration failed:', data.error)
  }
  console.log('')
}

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   PowerCA Registration Email Test')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('⚠️  Make sure the dev server is running on port 3009!\n')

  try {
    // Test 1: Professional
    await testProfessionalRegistration()

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test 2: Student
    await testStudentRegistration()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Test complete!')
    console.log('📬 Check contact@powerca.in inbox for:')
    console.log('   1. Professional Registration (Blue theme 💼)')
    console.log('   2. Student Registration (Purple theme 🎓)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (error) {
    console.error('❌ Error running tests:', error)
    console.log('\n⚠️  Make sure the dev server is running: npm run dev\n')
  }
}

runTests()
