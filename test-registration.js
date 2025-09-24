// Test script for registration API
const axios = require('axios');

async function testRegistration() {
  const testData = {
    name: "Test User",
    email: `test${Date.now()}@example.com`, // Unique email
    username: `testuser${Date.now()}`, // Unique username
    phone: "9876543210",
    password: "Test@123",
    role: "Student",
    registrationNo: "ABC123",
    instituteName: "TestInstitute"
  };

  console.log('Testing registration with:', testData);

  try {
    const response = await axios.post('http://localhost:3002/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testRegistration();