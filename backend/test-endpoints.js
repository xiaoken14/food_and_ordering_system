// Simple test script to verify backend endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🔍 Testing Backend Endpoints...\n');

  // Test 1: Basic API connectivity
  try {
    console.log('1. Testing basic API connectivity...');
    const response = await axios.get(`${API_URL}/`);
    console.log('✅ API is running:', response.data);
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    console.log('   Make sure to run: npm run dev');
    return;
  }

  // Test 2: Auth endpoint without token (should return 401)
  try {
    console.log('\n2. Testing auth endpoint without token...');
    await axios.get(`${API_URL}/api/auth/me`);
    console.log('❌ Auth endpoint should return 401 without token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Auth endpoint correctly returns 401 without token');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.message);
    }
  }

  // Test 3: Users endpoint without token (should return 401)
  try {
    console.log('\n3. Testing users endpoint without token...');
    await axios.get(`${API_URL}/api/auth/users`);
    console.log('❌ Users endpoint should return 401 without token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Users endpoint correctly returns 401 without token');
    } else if (error.response?.status === 404) {
      console.log('❌ Users endpoint not found (404) - check routes configuration');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.message);
    }
  }

  console.log('\n🎯 Next steps:');
  console.log('1. If API connection failed: Start backend with "npm run dev"');
  console.log('2. If users endpoint returns 404: Check routes configuration');
  console.log('3. If all tests pass: The issue might be with authentication');
  console.log('4. Create an admin user with: npm run create-admin');
  console.log('5. Login through frontend and check browser console for token');
}

// Run the tests
testEndpoints().catch(console.error);