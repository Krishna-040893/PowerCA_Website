#!/usr/bin/env node

/**
 * Quick Error Handling Migration Test Script
 *
 * This script tests the migrated endpoints to verify:
 * - Standardized error responses
 * - Rate limiting functionality
 * - Proper logging
 *
 * Usage:
 *   node test-error-handling.js
 *
 * Note: Make sure the dev server is running on http://localhost:3000
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

// Helper to make API requests
async function makeRequest(endpoint, method = 'POST', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    }
  } catch (error) {
    return {
      status: 0,
      error: error.message,
    }
  }
}

// Test standardized error format
function validateErrorFormat(data, testName) {
  const required = ['success', 'error', 'timestamp']
  const errorRequired = ['type', 'message', 'code']

  const hasAllFields = required.every(field => field in data)
  const hasErrorFields = data.error && errorRequired.every(field => field in data.error)

  if (hasAllFields && hasErrorFields && data.success === false) {
    logSuccess(`${testName}: Standardized error format`)
    return true
  } else {
    logError(`${testName}: Invalid error format`)
    console.log('  Expected fields:', required.join(', '))
    console.log('  Received:', JSON.stringify(data, null, 2))
    return false
  }
}

// Test 1: Contact Form - Validation Error
async function testContactValidation() {
  logInfo('\n[Test 1] Contact Form - Validation Error')

  const result = await makeRequest('/api/contact', 'POST', {
    name: 'Test',
    // Missing required fields: email, message
  })

  if (result.status === 400) {
    logSuccess('Status: 400 (correct)')
    return validateErrorFormat(result.data, 'Contact validation')
  } else {
    logError(`Status: ${result.status} (expected 400)`)
    return false
  }
}

// Test 2: Auth Login - Validation Error
async function testLoginValidation() {
  logInfo('\n[Test 2] Auth Login - Validation Error')

  const result = await makeRequest('/api/auth/login', 'POST', {
    // Missing required fields
  })

  if (result.status === 400) {
    logSuccess('Status: 400 (correct)')
    return validateErrorFormat(result.data, 'Login validation')
  } else {
    logError(`Status: ${result.status} (expected 400)`)
    return false
  }
}

// Test 3: Auth Login - Invalid Credentials
async function testLoginInvalidCredentials() {
  logInfo('\n[Test 3] Auth Login - Invalid Credentials')

  const result = await makeRequest('/api/auth/login', 'POST', {
    email: 'nonexistent@example.com',
    password: 'wrongpassword',
  })

  if (result.status === 401) {
    logSuccess('Status: 401 (correct)')
    return validateErrorFormat(result.data, 'Login authentication')
  } else {
    logError(`Status: ${result.status} (expected 401)`)
    return false
  }
}

// Test 4: Rate Limiting
async function testRateLimiting() {
  logInfo('\n[Test 4] Rate Limiting - Contact Form (3 req/min)')

  const results = []

  // Make 5 requests quickly
  for (let i = 0; i < 5; i++) {
    const result = await makeRequest('/api/contact', 'POST', {
      name: `Test ${i}`,
      email: `test${i}@example.com`,
      message: 'Test message for rate limiting',
    })

    results.push(result)

    if (result.status === 429) {
      logSuccess(`Request ${i + 1}: Rate limited (429)`)
    } else if (result.status === 400 || result.status === 200) {
      logInfo(`Request ${i + 1}: Passed (${result.status})`)
    } else {
      logWarning(`Request ${i + 1}: Unexpected status ${result.status}`)
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Check if we got rate limited
  const rateLimited = results.some(r => r.status === 429)

  if (rateLimited) {
    logSuccess('Rate limiting is working!')

    // Check for Retry-After header
    const rateLimitedResponse = results.find(r => r.status === 429)
    if (rateLimitedResponse && rateLimitedResponse.headers['retry-after']) {
      logSuccess(`Retry-After header present: ${rateLimitedResponse.headers['retry-after']}s`)
    }

    return true
  } else {
    logWarning('Rate limiting not triggered (might need more requests or wait longer)')
    return false
  }
}

// Test 5: Forgot Password - Email Validation
async function testForgotPasswordValidation() {
  logInfo('\n[Test 5] Forgot Password - Validation')

  const result = await makeRequest('/api/auth/forgot-password', 'POST', {
    // Missing email field
  })

  if (result.status === 400) {
    logSuccess('Status: 400 (correct)')
    return validateErrorFormat(result.data, 'Forgot password validation')
  } else {
    logError(`Status: ${result.status} (expected 400)`)
    return false
  }
}

// Test 6: Check Request ID in Response
async function testRequestIdPresent() {
  logInfo('\n[Test 6] Request ID Tracking')

  const result = await makeRequest('/api/auth/login', 'POST', {})

  if (result.data && result.data.requestId) {
    logSuccess(`Request ID present: ${result.data.requestId}`)
    return true
  } else {
    logWarning('Request ID not found in response (check if X-Request-Id header is used instead)')
    return false
  }
}

// Test 7: Server Health Check
async function testServerHealth() {
  logInfo('\n[Test 7] Server Health Check')

  try {
    const response = await fetch(`${BASE_URL}/`)

    if (response.ok) {
      logSuccess('Server is running and responding')
      return true
    } else {
      logWarning(`Server returned status ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`Cannot connect to server: ${error.message}`)
    logInfo(`Make sure dev server is running: npm run dev`)
    return false
  }
}

// Main test runner
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan')
  log('  Error Handling Migration - Quick Test Suite', 'cyan')
  log('='.repeat(60) + '\n', 'cyan')

  logInfo(`Testing against: ${BASE_URL}`)
  logInfo('Make sure the dev server is running!\n')

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  }

  // Run tests
  const tests = [
    { name: 'Server Health', fn: testServerHealth, critical: true },
    { name: 'Contact Validation', fn: testContactValidation },
    { name: 'Login Validation', fn: testLoginValidation },
    { name: 'Login Invalid Credentials', fn: testLoginInvalidCredentials },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Forgot Password Validation', fn: testForgotPasswordValidation },
    { name: 'Request ID Tracking', fn: testRequestIdPresent },
  ]

  for (const test of tests) {
    try {
      const passed = await test.fn()

      if (passed) {
        results.passed++
      } else if (test.critical) {
        logError(`\nCritical test failed: ${test.name}`)
        logError('Cannot continue testing. Please start the dev server.\n')
        process.exit(1)
      } else {
        results.failed++
      }
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`)
      results.failed++
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan')
  log('  Test Summary', 'cyan')
  log('='.repeat(60) + '\n', 'cyan')

  logSuccess(`Passed: ${results.passed}`)
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`)
  }
  if (results.warnings > 0) {
    logWarning(`Warnings: ${results.warnings}`)
  }

  const totalTests = tests.length
  const passRate = ((results.passed / totalTests) * 100).toFixed(1)

  log(`\nPass Rate: ${passRate}%`, passRate >= 70 ? 'green' : 'red')

  if (results.passed === totalTests) {
    logSuccess('\n🎉 All tests passed! Migration looks good!')
  } else if (results.failed === 0) {
    logInfo('\n✓ All tests passed with some warnings')
  } else {
    logWarning('\n⚠ Some tests failed. Review the errors above.')
  }

  log('\nFor detailed testing, see: ERROR_HANDLING_TEST_GUIDE.md\n')
}

// Check if running as main script
if (require.main === module) {
  runTests().catch(error => {
    logError(`\nTest runner error: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { runTests }
