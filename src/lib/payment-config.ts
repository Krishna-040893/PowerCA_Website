// Payment Configuration
// Set TEST_MODE to true to bypass real payments
// All payment flows will complete successfully without charging real money

export const PAYMENT_CONFIG = {
  // IMPORTANT: Set to true for testing, false for production
  TEST_MODE: true,

  // Test mode settings
  TEST_PAYMENT_DELAY: 2000, // Simulate payment processing delay (ms)
  TEST_AUTO_SUCCESS: true,  // Automatically succeed all test payments

  // Test payment details
  TEST_ORDER_ID_PREFIX: 'TEST_ORDER_',
  TEST_PAYMENT_ID_PREFIX: 'TEST_PAY_',

  // Amount for testing (in paise)
  TEST_AMOUNT: 100, // ₹1 for testing

  // Messages
  TEST_MODE_MESSAGE: '🧪 TEST MODE - No real payment will be processed',

  // Generate test IDs
  generateTestOrderId: () => `${PAYMENT_CONFIG.TEST_ORDER_ID_PREFIX}${Date.now()}`,
  generateTestPaymentId: () => `${PAYMENT_CONFIG.TEST_PAYMENT_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
}

export const isTestMode = () => PAYMENT_CONFIG.TEST_MODE