import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify Cashfree configuration
 * This helps debug authentication issues in production
 *
 * Usage: GET /api/test/cashfree-config
 */
export async function GET() {
  try {
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    // Check if credentials exist
    const hasAppId = !!appId
    const hasSecretKey = !!secretKey

    // Detect environment based on App ID
    const environment = appId?.toUpperCase().startsWith('TEST') ? 'sandbox' : 'production'
    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg'

    // Validate App ID format
    const appIdFormat = appId
      ? appId.toUpperCase().startsWith('TEST')
        ? 'TEST credentials (Sandbox)'
        : 'Production credentials'
      : 'Missing'

    // Validate Secret Key format
    const secretKeyFormat = secretKey
      ? secretKey.startsWith('cfsk_ma_test')
        ? 'TEST secret (Sandbox)'
        : secretKey.startsWith('cfsk_ma_prod')
        ? 'Production secret'
        : 'Unknown format'
      : 'Missing'

    // Check for mismatch
    const mismatch =
      (appIdFormat.includes('TEST') && secretKeyFormat.includes('Production')) ||
      (appIdFormat.includes('Production') && secretKeyFormat.includes('TEST'))

    // Test API connectivity (without creating an order)
    let apiStatus = 'Not tested'
    if (hasAppId && hasSecretKey) {
      try {
        // Just test if we can reach the API endpoint
        const testResponse = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': appId!,
            'x-client-secret': secretKey!,
            'x-api-version': '2023-08-01',
          },
          body: JSON.stringify({
            // Invalid payload to trigger validation error (not create real order)
            order_id: 'TEST_VALIDATION',
            order_amount: 0,
          })
        })

        const data = await testResponse.json()

        // We expect a validation error, not an auth error
        if (testResponse.status === 400 || testResponse.status === 422) {
          apiStatus = '✅ API authentication successful (validation error expected)'
        } else if (testResponse.status === 401 || testResponse.status === 403) {
          apiStatus = '❌ Authentication failed - Invalid credentials'
        } else {
          apiStatus = `⚠️ Unexpected response: ${testResponse.status}`
        }
      } catch (error) {
        apiStatus = `❌ API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    return NextResponse.json({
      success: true,
      configuration: {
        hasAppId,
        hasSecretKey,
        appIdFormat,
        secretKeyFormat,
        detectedEnvironment: environment,
        baseUrl,
        credentialsMismatch: mismatch,
        appIdPreview: appId ? `${appId.substring(0, 10)}...${appId.substring(appId.length - 4)}` : 'Not set',
        secretKeyPreview: secretKey ? `${secretKey.substring(0, 15)}...` : 'Not set',
      },
      apiTest: {
        status: apiStatus,
        message: mismatch
          ? '⚠️ WARNING: App ID and Secret Key environments do not match!'
          : hasAppId && hasSecretKey
          ? '✅ Credentials are configured and format matches'
          : '❌ Missing credentials'
      },
      recommendation: mismatch
        ? 'Your App ID and Secret Key are from different environments. Please ensure both are either TEST or both are PRODUCTION credentials.'
        : !hasAppId || !hasSecretKey
        ? 'Please configure both NEXT_PUBLIC_CASHFREE_APP_ID and CASHFREE_SECRET_KEY in your environment variables.'
        : 'Configuration looks good! If authentication still fails, verify credentials in Cashfree merchant dashboard.'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
