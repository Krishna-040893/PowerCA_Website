export interface CreateOrderData {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, any>
}

export interface VerifyPaymentData {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}