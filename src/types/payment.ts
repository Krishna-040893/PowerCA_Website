export interface CreateOrderData {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, string | number | boolean>
}

export interface VerifyPaymentData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// Razorpay payment response types
export interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayErrorResponse {
  error: {
    code: string
    description: string
    source: string
    step: string
    reason: string
    metadata: {
      order_id: string
      payment_id: string
    }
  }
}

// Razorpay types for checkout
export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

export interface RazorpayInstance {
  open(): void
  on(event: string, callback: (response: unknown) => void): void
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance
}

// Window type extension for Razorpay
declare global {
  interface Window {
    Razorpay: RazorpayConstructor
  }
}