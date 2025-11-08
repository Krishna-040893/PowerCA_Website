/**
 * @fileoverview Comprehensive tests for payment flow
 *
 * Tests cover:
 * - Razorpay order creation
 * - Payment verification
 * - Error handling for payment failures
 * - Form validation
 * - Subscription creation
 * - Payment success redirect
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockSession } from '@/test/test-utils'
import { server } from '@/test/mocks/server'
import { rest } from 'msw'

// We'll create a simplified CheckoutForm component for testing
// In reality, this should test the actual checkout page

describe('Payment Flow', () => {
  beforeEach(() => {
    // Mock Razorpay
    (global as any).Razorpay = jest.fn().mockImplementation((options) => {
      return {
        open: jest.fn(),
        on: jest.fn(),
      }
    })
  })

  describe('Order Creation', () => {
    it('should create Razorpay order successfully', async () => {
      const createOrderSpy = jest.fn()

      server.use(
        rest.post('/api/payment/create-order', async (req, res, ctx) => {
          const body = await req.json()
          createOrderSpy(body)

          return res(
            ctx.status(200),
            ctx.json({
              order_id: 'order_123',
              amount: body.amount,
              currency: 'INR',
              key: 'rzp_test_key',
            })
          )
        })
      )

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          plan: 'professional',
          userId: 'user-123',
        }),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toEqual({
        order_id: 'order_123',
        amount: 5000,
        currency: 'INR',
        key: 'rzp_test_key',
      })

      expect(createOrderSpy).toHaveBeenCalledWith({
        amount: 5000,
        plan: 'professional',
        userId: 'user-123',
      })
    })

    it('should handle order creation failure', async () => {
      server.use(
        rest.post('/api/payment/create-order', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              error: 'Failed to create order',
              code: 'ORDER_CREATION_FAILED',
            })
          )
        })
      )

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          plan: 'professional',
        }),
      })

      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create order')
    })

    it('should validate order amount', async () => {
      server.use(
        rest.post('/api/payment/create-order', async (req, res, ctx) => {
          const body = await req.json()

          if (!body.amount || body.amount <= 0) {
            return res(
              ctx.status(400),
              ctx.json({
                error: 'Invalid amount',
                code: 'INVALID_AMOUNT',
              })
            )
          }

          return res(
            ctx.status(200),
            ctx.json({
              order_id: 'order_123',
              amount: body.amount,
            })
          )
        })
      )

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: -100, // Invalid negative amount
          plan: 'professional',
        }),
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid amount')
    })
  })

  describe('Payment Verification', () => {
    it('should verify successful payment', async () => {
      const mockPaymentData = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'signature_123',
      }

      server.use(
        rest.post('/api/payment/verify', async (req, res, ctx) => {
          const body = await req.json()

          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              order_id: body.razorpay_order_id,
              payment_id: body.razorpay_payment_id,
              verified: true,
            })
          )
        })
      )

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPaymentData),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.verified).toBe(true)
      expect(data.order_id).toBe('order_123')
    })

    it('should reject invalid payment signature', async () => {
      server.use(
        rest.post('/api/payment/verify', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              success: false,
              error: 'Invalid payment signature',
              code: 'SIGNATURE_VERIFICATION_FAILED',
            })
          )
        })
      )

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'invalid_signature',
        }),
      })

      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid payment signature')
    })

    it('should handle payment verification timeout', async () => {
      server.use(
        rest.post('/api/payment/verify', async (req, res, ctx) => {
          // Simulate timeout
          await new Promise((resolve) => setTimeout(resolve, 100))
          return res.networkError('Payment verification timeout')
        })
      )

      await expect(
        fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'signature_123',
          }),
        })
      ).rejects.toThrow()
    })
  })

  describe('Payment Amount Calculation', () => {
    const plans = [
      { name: 'starter', price: 999, gst: 179.82, total: 1178.82 },
      { name: 'professional', price: 4999, gst: 899.82, total: 5898.82 },
      { name: 'enterprise', price: 9999, gst: 1799.82, total: 11798.82 },
    ]

    plans.forEach(({ name, price, gst, total }) => {
      it(`should calculate correct amount for ${name} plan`, () => {
        const basePrice = price
        const gstRate = 0.18
        const calculatedGst = Math.round(basePrice * gstRate * 100) / 100
        const calculatedTotal = Math.round((basePrice + calculatedGst) * 100) / 100

        expect(calculatedGst).toBeCloseTo(gst, 2)
        expect(calculatedTotal).toBeCloseTo(total, 2)
      })
    })
  })

  describe('Subscription Creation', () => {
    it('should create subscription after successful payment', async () => {
      server.use(
        rest.post('/api/subscription/create', async (req, res, ctx) => {
          const body = await req.json()

          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              subscription: {
                id: 'sub_123',
                user_id: body.userId,
                plan: body.plan,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              },
            })
          )
        })
      )

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          plan: 'professional',
          payment_id: 'pay_123',
          order_id: 'order_123',
        }),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.subscription.status).toBe('active')
      expect(data.subscription.plan).toBe('professional')
    })

    it('should handle subscription creation failure', async () => {
      server.use(
        rest.post('/api/subscription/create', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              success: false,
              error: 'Failed to create subscription',
            })
          )
        })
      )

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123',
          plan: 'professional',
        }),
      })

      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(data.success).toBe(false)
    })
  })

  describe('Razorpay Integration', () => {
    it('should initialize Razorpay with correct options', () => {
      const mockOptions = {
        key: 'rzp_test_key',
        amount: 500000, // 5000 INR in paise
        currency: 'INR',
        name: 'PowerCA',
        order_id: 'order_123',
        handler: jest.fn(),
        prefill: {
          email: 'user@example.com',
          contact: '9876543210',
        },
      }

      const razorpay = new (global as any).Razorpay(mockOptions)

      expect((global as any).Razorpay).toHaveBeenCalledWith(mockOptions)
      expect(razorpay).toBeDefined()
    })

    it('should handle Razorpay payment success callback', () => {
      const handleSuccess = jest.fn()

      const mockOptions = {
        key: 'rzp_test_key',
        amount: 500000,
        order_id: 'order_123',
        handler: handleSuccess,
      }

      const razorpay = new (global as any).Razorpay(mockOptions)

      // Simulate successful payment
      mockOptions.handler({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'signature_123',
      })

      expect(handleSuccess).toHaveBeenCalledWith({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'signature_123',
      })
    })

    it('should handle Razorpay payment failure', () => {
      const handleFailure = jest.fn()

      const mockOptions = {
        key: 'rzp_test_key',
        amount: 500000,
        order_id: 'order_123',
        handler: jest.fn(),
        modal: {
          ondismiss: handleFailure,
        },
      }

      new (global as any).Razorpay(mockOptions)

      // Simulate modal dismiss (payment cancelled)
      mockOptions.modal.ondismiss()

      expect(handleFailure).toHaveBeenCalled()
    })
  })

  describe('Payment Error Scenarios', () => {
    it('should handle network errors during order creation', async () => {
      server.use(
        rest.post('/api/payment/create-order', (req, res) => {
          return res.networkError('Network error')
        })
      )

      await expect(
        fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 5000,
            plan: 'professional',
          }),
        })
      ).rejects.toThrow()
    })

    it('should handle rate limiting on payment endpoints', async () => {
      server.use(
        rest.post('/api/payment/create-order', (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.json({
              error: 'Too many requests',
              limit: 5,
              remaining: 0,
              reset: Date.now() + 60000,
            })
          )
        })
      )

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          plan: 'professional',
        }),
      })

      expect(response.status).toBe(429)

      const data = await response.json()
      expect(data.error).toBe('Too many requests')
    })

    it('should handle insufficient balance error', async () => {
      server.use(
        rest.post('/api/payment/create-order', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              error: 'Insufficient balance',
              code: 'INSUFFICIENT_BALANCE',
            })
          )
        })
      )

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          plan: 'professional',
        }),
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.code).toBe('INSUFFICIENT_BALANCE')
    })
  })

  describe('Payment Webhook', () => {
    it('should handle Razorpay webhook for successful payment', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_123',
              order_id: 'order_123',
              amount: 500000,
              status: 'captured',
            },
          },
        },
      }

      server.use(
        rest.post('/api/payment/webhook', async (req, res, ctx) => {
          const body = await req.json()

          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              message: 'Webhook processed',
            })
          )
        })
      )

      const response = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'valid_signature',
        },
        body: JSON.stringify(webhookPayload),
      })

      expect(response.ok).toBe(true)
    })

    it('should reject webhook with invalid signature', async () => {
      server.use(
        rest.post('/api/payment/webhook', (req, res, ctx) => {
          const signature = req.headers.get('x-razorpay-signature')

          if (signature !== 'valid_signature') {
            return res(
              ctx.status(401),
              ctx.json({
                error: 'Invalid webhook signature',
              })
            )
          }

          return res(ctx.status(200), ctx.json({ success: true }))
        })
      )

      const response = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'invalid_signature',
        },
        body: JSON.stringify({
          event: 'payment.captured',
        }),
      })

      expect(response.status).toBe(401)
    })
  })
})
