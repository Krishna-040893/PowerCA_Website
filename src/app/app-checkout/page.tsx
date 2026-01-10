'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, Shield, Download, Mail } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Script from 'next/script'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
}

// Product data (should match app-download page)
const appProducts: Record<string, {
  id: string
  name: string
  description: string
  price: number
}> = {
  'powerca-demo-version': {
    id: 'powerca-demo-version',
    name: 'Demo Version',
    description: 'Access is limited to one month and is intended solely for training content.',
    price: 2000
  }
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

function AppCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  const productId = searchParams.get('product') || 'powerca-demo-version'
  const product = appProducts[productId] || appProducts['powerca-demo-version']

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Calculate pricing (no GST)
  const total = product.price

  // Enforce authentication
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setCheckingAuth(true)
      return
    }

    if (sessionStatus === 'unauthenticated' || !session) {
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    setCheckingAuth(false)
  }, [session, sessionStatus, router])

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || '',
        name: session.user?.name || '',
        phone: session.user?.phone || '',
      }))
    }
  }, [session])

  const _handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Basic validation - name and email are required from session
    if (!formData.name.trim()) newErrors.name = 'Name is required. Please update your profile.'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    // Phone is optional since it comes from session

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payment/app-download/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paise
          productId: product.id,
          productName: product.name,
          customerDetails: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success || !orderData.orderId) {
        const errorMessage = typeof orderData.error === 'object'
          ? orderData.error?.message || JSON.stringify(orderData.error)
          : orderData.error || 'Failed to create order'
        throw new Error(errorMessage)
      }

      // Load Razorpay script
      await loadRazorpayScript()

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'PowerCA',
        description: product.name,
        image: '/logo.png',
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#7C3AED',
        },
        handler: async function (response: RazorpayPaymentResponse) {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payment/app-download/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerDetails: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
              },
              productDetails: {
                id: product.id,
                name: product.name,
                amount: total,
              }
            })
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.success) {
            // Redirect to success page with secure token only (no sensitive data in URL)
            router.push(`/app-download/success?token=${verifyData.successToken}`)
          } else {
            // Show the actual error message from the API
            const errorMessage = verifyData.error?.message ||
              verifyData.message ||
              'Payment verification failed. Please contact support.'
            setError(errorMessage)
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Checking authentication...</p>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="bg-gradient-to-b from-gray-50 to-white pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600">
              You&apos;re just one step away from downloading {product.name}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Billing Details
              </h2>

              <div className="space-y-8">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    disabled
                    readOnly
                    className="h-12 text-base border-0 bg-gray-50 text-gray-700 cursor-not-allowed shadow-md rounded-lg"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    readOnly
                    className="h-12 text-base border-0 bg-gray-50 text-gray-700 cursor-not-allowed shadow-md rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Download link will be sent to this email
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    disabled
                    readOnly
                    className="h-12 text-base border-0 bg-gray-50 text-gray-700 cursor-not-allowed shadow-md rounded-lg"
                  />
                </div>

              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Product Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className="font-semibold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-purple-600">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Trust Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secured by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AppCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AppCheckoutContent />
    </Suspense>
  )
}
