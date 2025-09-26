import Razorpay from 'razorpay'
import crypto from 'crypto'

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('Razorpay credentials not configured. Payment features will be disabled.')
}

export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''

export interface RazorpayOrderOptions {
  amount: number // Amount in paise (smallest currency unit)
  currency: string
  receipt: string
  notes?: Record<string, string | number | boolean>
}

export interface RazorpayPaymentData {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export function verifyPaymentSignature(data: RazorpayPaymentData): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay key secret not configured')
    return false
  }

  const body = data.razorpay_order_id + '|' + data.razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex')

  return expectedSignature === data.razorpay_signature
}