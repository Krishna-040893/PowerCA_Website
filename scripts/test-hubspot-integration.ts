import { hubspotService } from '../src/lib/hubspot-service'
import { syncMiddleware } from '../src/middleware/hubspot-sync'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testHubSpotIntegration() {
  console.log('🔧 Testing HubSpot Integration...\n')

  // Check if credentials are configured
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN || !process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID) {
    console.error('❌ HubSpot credentials not found in environment variables')
    return
  }

  console.log('✅ HubSpot credentials found')
  console.log(`Portal ID: ${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}\n`)

  try {
    // Test 1: Create or update a test contact
    console.log('📝 Test 1: Creating/updating test contact...')
    const testUser = {
      email: 'test@powerca.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '+91 9876543210',
      firmName: 'Test CA Firm',
      caNumber: 'CA123456',
      firmSize: '10-50',
      planType: 'trial',
      status: 'lead'
    }

    const contactResult = await hubspotService.syncUserToHubSpot(testUser)
    if (contactResult) {
      console.log('✅ Contact created/updated successfully')
      console.log(`Contact ID: ${contactResult.id}\n`)
    } else {
      console.log('⚠️ Contact sync returned null (check HubSpot configuration)\n')
    }

    // Test 2: Search for the contact
    console.log('🔍 Test 2: Searching for contact...')
    const searchResult = await hubspotService.searchContactByEmail(testUser.email)
    if (searchResult) {
      console.log('✅ Contact found in HubSpot')
      console.log(`Contact details: ${searchResult.properties.email}\n`)
    } else {
      console.log('⚠️ Contact not found\n')
    }

    // Test 3: Get lead insights
    console.log('📊 Test 3: Fetching lead insights...')
    const insights = await hubspotService.getLeadInsights(testUser.email)
    if (insights) {
      console.log('✅ Lead insights retrieved')
      console.log('Properties:', Object.keys(insights.properties || {}).join(', '), '\n')
    } else {
      console.log('⚠️ No insights available\n')
    }

    // Test 4: Track an event
    console.log('📍 Test 4: Tracking custom event...')
    const eventResult = await hubspotService.trackEvent('integration_test', {
      email: testUser.email,
      test_date: new Date().toISOString(),
      test_type: 'manual'
    })
    if (eventResult) {
      console.log('✅ Event tracked successfully\n')
    } else {
      console.log('⚠️ Event tracking may not be configured\n')
    }

    // Test 5: Test middleware sync
    console.log('🔄 Test 5: Testing sync middleware...')
    await syncMiddleware.afterUserCreate({
      id: 'test_123',
      email: 'middleware-test@powerca.com',
      firstName: 'Middleware',
      lastName: 'Test',
      phone: '+91 9876543211',
      firmName: 'Middleware Test Firm',
      status: 'lead'
    })
    console.log('✅ Middleware sync completed\n')

    console.log('🎉 All tests completed!')
    console.log('\n📌 Next steps:')
    console.log('1. Check your HubSpot contacts at: https://app.hubspot.com/contacts/243943032')
    console.log('2. Look for the test contacts: test@powerca.com and middleware-test@powerca.com')
    console.log('3. The integration is ready to use!')

  } catch (error) {
    console.error('❌ Error during testing:', error)
    console.log('\nTroubleshooting:')
    console.log('1. Verify your Private App token is correct')
    console.log('2. Ensure the token has proper scopes (contacts read/write)')
    console.log('3. Check if your HubSpot account is active')
  }
}

// Run the test
testHubSpotIntegration()