declare global {
  interface Window {
    Cashfree: (config: CashfreeConfig) => Promise<CashfreeInstance>
  }
}

interface CashfreeConfig {
  mode: 'sandbox' | 'production'
}

interface CashfreeInstance {
  checkout: (options: CashfreeCheckoutOptions) => Promise<CashfreePaymentResponse>
}

interface CashfreeCheckoutOptions {
  paymentSessionId: string
  redirectTarget?: '_self' | '_blank' | '_parent' | '_top'
  returnUrl?: string
}

interface CashfreePaymentResponse {
  error?: {
    message: string
    code: string
  }
  redirect?: boolean
  paymentDetails?: {
    orderId: string
    paymentSessionId: string
  }
}

export {}
