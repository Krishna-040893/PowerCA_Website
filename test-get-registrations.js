// Test fetching registrations
const axios = require('axios');

async function testGetRegistrations() {
  console.log('Testing GET /api/registrations...\n');

  try {
    const response = await axios.get('http://localhost:3002/api/registrations');

    console.log('✅ Successfully fetched registrations!');
    console.log(`Total registrations: ${response.data.length}`);

    if (response.data.length > 0) {
      console.log('\nFirst registration:');
      console.log(JSON.stringify(response.data[0], null, 2));
    } else {
      console.log('\nNo registrations found in the database.');
    }
  } catch (error) {
    console.error('❌ Failed to fetch registrations:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testGetRegistrations();