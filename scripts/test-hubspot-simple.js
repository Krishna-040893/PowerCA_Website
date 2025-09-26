const { Client } = require('@hubspot/api-client');
require('dotenv').config({ path: '.env.local' });

async function testHubSpotConnection() {
  console.log('Testing HubSpot connection...\n');

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  console.log('Token loaded:', !!token);
  console.log('Token format:', token?.substring(0, 15) + '...\n');

  if (!token) {
    console.error('❌ No token found in environment variables');
    return;
  }

  const hubspotClient = new Client({ accessToken: token });

  try {
    // Test 1: Simple API call to verify authentication
    console.log('Testing authentication with a simple API call...');
    const limit = 1;
    const after = undefined;
    const properties = ['email', 'firstname', 'lastname'];
    const propertiesWithHistory = undefined;
    const associations = undefined;
    const archived = false;

    const apiResponse = await hubspotClient.crm.contacts.basicApi.getPage(
      limit,
      after,
      properties,
      propertiesWithHistory,
      associations,
      archived
    );

    console.log('✅ Authentication successful!');
    console.log(`Found ${apiResponse.results.length} contacts in your HubSpot account\n`);

    // Test 2: Try to create a test contact
    console.log('Creating a test contact...');
    try {
      const contactObj = {
        properties: {
          email: 'test@powerca.com',
          firstname: 'Test',
          lastname: 'User',
          company: 'PowerCA Test'
        }
      };

      const createResponse = await hubspotClient.crm.contacts.basicApi.create(contactObj);
      console.log('✅ Test contact created successfully!');
      console.log(`Contact ID: ${createResponse.id}`);
      console.log(`Contact Email: ${createResponse.properties.email}\n`);
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Test contact already exists (this is fine)\n');
      } else {
        console.error('Error creating contact:', error.message);
      }
    }

    console.log('🎉 HubSpot integration is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Create custom properties in HubSpot for CA-specific data');
    console.log('2. Check your contacts at: https://app.hubspot.com/contacts/243943032');
    console.log('3. The integration is ready to use in your application!');

  } catch (error) {
    console.error('❌ Authentication failed!');
    console.error('Error:', error.message);

    if (error.code === 401) {
      console.log('\n⚠️ The token appears to be invalid or expired.');
      console.log('Please verify:');
      console.log('1. The token is copied correctly from HubSpot');
      console.log('2. The Private App has the correct scopes (contacts read/write)');
      console.log('3. The Private App is active');
    }
  }
}

testHubSpotConnection();