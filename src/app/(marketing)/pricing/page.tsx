"use client"

import { useRouter } from "next/navigation"
import { Rocket, Check, Smartphone, AlertCircle, X } from "lucide-react"
import { loadScript } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PAYMENT_CONFIG, isTestMode } from '@/lib/payment-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gst: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    // Check for affiliate code in URL or session
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('ref') || urlParams.get('affiliate')
    if (code) {
      setAffiliateCode(code)
      // Store in session storage for later use
      sessionStorage.setItem('affiliateCode', code)
      checkAffiliateCanRefer(code)
    } else {
      // Check session storage
      const storedCode = sessionStorage.getItem('affiliateCode')
      if (storedCode) {
        setAffiliateCode(storedCode)
        checkAffiliateCanRefer(storedCode)
      }
    }
  }, [])

  const checkAffiliateCanRefer = async (code: string) => {
    try {
      const response = await fetch(`/api/affiliate/check-referral-limit?code=${code}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.canRefer) {
          alert('This affiliate has already completed their one allowed referral. Please proceed without a referral code.')
          setAffiliateCode(null)
          sessionStorage.removeItem('affiliateCode')
        }
      }
    } catch (error) {
      console.error('Error checking affiliate referral status:', error)
    }
  }

  const handleBookNow = () => {
    // Show customer details dialog
    setShowDetailsDialog(true)
    // Pre-fill with session data if available
    if (session?.user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }))
    }
  }

  const handleProceedPayment = async () => {
    // Validate required fields
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      alert('Please fill in all required fields')
      return
    }

    setShowDetailsDialog(false)
    setLoading(true)

    try {
      // Check if in test mode
      if (isTestMode()) {
        console.log('🧪 TEST MODE: Simulating payment flow')

        // Show test mode alert
        const confirmTest = confirm(
          '🧪 TEST MODE ACTIVE\n\n' +
          'This will simulate a successful payment without charging any real money.\n\n' +
          'The following will happen:\n' +
          '• Order will be created\n' +
          '• Payment will be marked as successful\n' +
          '• Invoice email will be sent\n' +
          '• Referral will be tracked (if applicable)\n\n' +
          'Continue with test payment?'
        )

        if (!confirmTest) {
          setLoading(false)
          return
        }

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, PAYMENT_CONFIG.TEST_PAYMENT_DELAY))

        // Create test order
        const testOrderId = PAYMENT_CONFIG.generateTestOrderId()
        const testPaymentId = PAYMENT_CONFIG.generateTestPaymentId()

        // Call verify endpoint directly with test data
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: testOrderId,
            paymentId: testPaymentId,
            signature: 'test_signature',
            planId: 'early-bird',
            affiliateCode: affiliateCode,
            isTestPayment: true,
            customerDetails: {
              name: customerDetails.name,
              email: customerDetails.email,
              phone: customerDetails.phone,
              company: customerDetails.company || 'N/A',
              gst: customerDetails.gst,
              address: customerDetails.address,
              city: customerDetails.city,
              state: customerDetails.state,
              pincode: customerDetails.pincode
            },
            productDetails: {
              name: 'PowerCA Early Bird Offer',
              amount: 1
            }
          })
        })

        const verifyData = await verifyResponse.json()

        if (verifyResponse.ok && verifyData.success) {
          // Track affiliate referral if applicable
          if (affiliateCode) {
            await fetch('/api/affiliate/track-referral', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                affiliateCode: affiliateCode,
                planId: 'early-bird',
                amount: 1,
                paymentId: testPaymentId
              })
            })
          }

          alert('✅ TEST PAYMENT SUCCESSFUL!\n\nCheck your email for the invoice.')
          router.push('/payment-success?plan=early-bird&test=true')
        } else {
          alert('Test payment verification failed. Please check the console.')
        }

        setLoading(false)
        return
      }

      // PRODUCTION MODE - Real Razorpay payment
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

      if (!res) {
        alert('Razorpay SDK failed to load. Please check your connection.')
        setLoading(false)
        return
      }

      // Create order for the early bird offer
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 100, // ₹1 in paise (100 paise = ₹1) for testing
          planId: 'early-bird',
          affiliateCode: affiliateCode,
          customerDetails: customerDetails
        })
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PowerCA',
        description: 'Early Bird Offer - Special 50% Discount for CAs',
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: 'early-bird',
              affiliateCode: affiliateCode,
              customerDetails: customerDetails,
              productDetails: {
                name: 'PowerCA Early Bird Offer',
                amount: 1
              }
            })
          })

          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok && verifyData.success) {
            // Track affiliate referral if applicable
            if (affiliateCode) {
              await fetch('/api/affiliate/track-referral', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  affiliateCode: affiliateCode,
                  planId: 'early-bird',
                  amount: 1, // ₹1 in rupees for commission calculation
                  paymentId: response.razorpay_payment_id
                })
              })
            }

            // Redirect to success page
            router.push('/payment-success?plan=early-bird')
          } else {
            alert('Payment verification failed. Please contact support.')
            router.push('/payment-failed')
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: {
          color: '#2563eb'
        }
      }

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error)
        router.push('/payment-failed')
      })

    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Test Mode Banner */}
        {isTestMode() && (
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">🧪 Test Mode Active</p>
              <p className="text-sm text-yellow-700">
                Payments will be simulated without charging real money. Perfect for testing the complete flow including email, invoice generation, and referral tracking.
              </p>
            </div>
          </div>
        )}

        {/* Cards Container */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">

          {/* Early Bird Offer Card */}
          <div className="w-full lg:w-[420px] bg-gradient-to-b from-cyan-50 to-cyan-100 rounded-3xl shadow-xl p-8 border border-cyan-200">
            {/* Header Badge */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white text-center py-3 px-4 rounded-xl font-semibold">
                Be an Early Bird to Enjoy the Offer
              </div>
            </div>

            {/* Rocket Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-24 h-24 bg-blue-200 rounded-full opacity-30"></div>
                </div>
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 relative z-10"
                >
                  {/* Rocket body */}
                  <path
                    d="M50 20 L60 40 L60 60 L50 70 L40 60 L40 40 Z"
                    fill="#3B82F6"
                    stroke="#1E40AF"
                    strokeWidth="2"
                  />
                  {/* Rocket fins */}
                  <path
                    d="M40 50 L30 60 L30 50 Z"
                    fill="#60A5FA"
                    stroke="#1E40AF"
                    strokeWidth="1"
                  />
                  <path
                    d="M60 50 L70 60 L70 50 Z"
                    fill="#60A5FA"
                    stroke="#1E40AF"
                    strokeWidth="1"
                  />
                  {/* Rocket window */}
                  <circle
                    cx="50"
                    cy="35"
                    r="6"
                    fill="#DBEAFE"
                    stroke="#1E40AF"
                    strokeWidth="1"
                  />
                  {/* Rocket flames */}
                  <path
                    d="M45 70 L50 80 L55 70"
                    fill="#EF4444"
                    opacity="0.8"
                  />
                  {/* Orbital ring */}
                  <ellipse
                    cx="50"
                    cy="45"
                    rx="35"
                    ry="8"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>

            {/* PowerCA Title */}
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              PowerCA
            </h2>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-red-500 line-through">
                  ₹1,00,000
                </span>
                <span className="text-sm text-gray-500 line-through">+GST</span>
              </div>

              <div className="mt-4 mb-2">
                <p className="text-blue-600 font-semibold text-lg">
                  Special discount 50% for CAs only –
                </p>
                <p className="text-blue-600 font-semibold text-lg">
                  Till 31st Oct 2025
                </p>
              </div>

              <div className="mt-6">
                <div className="text-4xl font-bold text-gray-800">
                  ₹1
                </div>
                <p className="text-sm text-red-600 mt-1">
                  (Testing Price - Tax Applicable)
                </p>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>
          </div>

          {/* Annual Subscription Card */}
          <div className="w-full lg:w-[420px] bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            {/* Phone Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-20 h-20"
                  >
                    {/* Phone/tablet outline */}
                    <rect
                      x="25"
                      y="15"
                      width="50"
                      height="70"
                      rx="5"
                      fill="#E0E7FF"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                    {/* Screen */}
                    <rect
                      x="30"
                      y="25"
                      width="40"
                      height="50"
                      fill="#DBEAFE"
                    />
                    {/* Check mark on screen */}
                    <path
                      d="M40 50 L48 58 L60 42"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Home button */}
                    <circle
                      cx="50"
                      cy="80"
                      r="2"
                      fill="#3B82F6"
                    />
                    {/* WiFi/signal waves */}
                    <path
                      d="M75 25 Q80 25 80 30"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M75 20 Q85 20 85 30"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M75 15 Q90 15 90 30"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* PowerCA Title */}
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
              PowerCA
            </h2>

            {/* Subscription Type */}
            <p className="text-xl font-semibold text-center text-blue-600 mb-6">
              Annual Subscription
            </p>

            {/* Description */}
            <p className="text-center text-gray-600 mb-8 leading-relaxed">
              Maximum support, minimum recurring cost for<br />
              your Practice Administration
            </p>

            {/* Annual Fee Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-center text-gray-800">
                <span className="font-semibold">Annual Fees is</span>{" "}
                <span className="text-2xl font-bold text-blue-600">0.25%</span>{" "}
                <span className="font-semibold">of your</span>
              </p>
              <p className="text-center text-gray-800 font-semibold mt-1">
                turnover
              </p>
            </div>

            {/* Renewal Info */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Check className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                On completion of every year from date of installation
              </p>
            </div>
          </div>
        </div>

        {/* Affiliate Code Display */}
        {affiliateCode && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <Check className="w-4 h-4 mr-2" />
              Affiliate discount applied: {affiliateCode}
            </div>
          </div>
        )}

        {/* Customer Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Information</DialogTitle>
              <DialogDescription>
                Please provide your details to proceed with the payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={customerDetails.company}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst">GST Number</Label>
                <Input
                  id="gst"
                  value={customerDetails.gst}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, gst: e.target.value }))}
                  placeholder="GST Number (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={customerDetails.state}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={customerDetails.pincode}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="Pincode"
                />
              </div>

              {isTestMode() && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>🧪 Test Mode:</strong> This information will be used for testing only.
                    No real payment will be processed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedPayment}
                disabled={!customerDetails.name || !customerDetails.email || !customerDetails.phone}
              >
                Proceed to Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}