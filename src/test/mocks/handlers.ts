/**
 * MSW (Mock Service Worker) handlers for API mocking in tests
 *
 * @module mocks/handlers
 */

import { rest } from 'msw'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Mock handlers for API endpoints
 */
export const handlers = [
  // Authentication endpoints
  rest.post(`${API_BASE_URL}/api/auth/callback/credentials`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'subscriber',
        },
      })
    )
  }),

  // User profile
  rest.get(`${API_BASE_URL}/api/user/profile`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        phone: '9876543210',
        firm_name: 'Test Firm',
        role: 'subscriber',
      })
    )
  }),

  // Bookings
  rest.get(`${API_BASE_URL}/api/admin/bookings`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        bookings: [
          {
            id: '1',
            name: 'Test Booking',
            email: 'test@example.com',
            phone: '9876543210',
            date: '2025-11-01',
            time: '10:00 AM',
            type: 'demo',
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ],
      })
    )
  }),

  // Payment creation
  rest.post(`${API_BASE_URL}/api/payment/create-order`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        order_id: 'test_order_123',
        amount: 5000,
        currency: 'INR',
        key: 'test_razorpay_key',
      })
    )
  }),

  // Payment verification
  rest.post(`${API_BASE_URL}/api/payment/verify`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        order_id: 'test_order_123',
        payment_id: 'test_payment_123',
      })
    )
  }),

  // Contact form
  rest.post(`${API_BASE_URL}/api/contact`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Contact form submitted successfully',
      })
    )
  }),

  // Registration
  rest.post(`${API_BASE_URL}/api/auth/simple-register`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Registration successful',
      })
    )
  }),

  // Affiliate endpoints
  rest.get(`${API_BASE_URL}/api/affiliate/referrals`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        referrals: [
          {
            id: '1',
            customer_id: 'CUST001',
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '9876543210',
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ],
      })
    )
  }),

  rest.post(`${API_BASE_URL}/api/affiliate/create-referral`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        referralId: 'test_referral_123',
        customerId: 'CUST002',
      })
    )
  }),
]

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = {
  /**
   * Handler for authentication errors
   */
  authError: rest.post(`${API_BASE_URL}/api/auth/callback/credentials`, (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Invalid credentials',
      })
    )
  }),

  /**
   * Handler for network errors
   */
  networkError: rest.get(`${API_BASE_URL}/*`, (req, res) => {
    return res.networkError('Network error')
  }),

  /**
   * Handler for server errors
   */
  serverError: rest.get(`${API_BASE_URL}/*`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal server error',
      })
    )
  }),

  /**
   * Handler for rate limit errors
   */
  rateLimitError: rest.post(`${API_BASE_URL}/*`, (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.json({
        error: 'Too many requests',
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      })
    )
  }),
}
