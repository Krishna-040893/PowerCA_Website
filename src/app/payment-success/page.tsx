'use client'

import {useEffect, useState, Suspense  } from 'react'
import {useRouter, useSearchParams  } from 'next/navigation'
import {Button  } from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Download, Mail, AlertCircle  } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import {trackPurchase  } from '@/components/google-analytics'
import {trackGTMPurchase  } from '@/components/google-tag-manager'

function PaymentSuccessContent() {
  const _router = useRouter()
  const searchParams = useSearchParams()
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    // Check if it's a test payment
    const testParam = searchParams.get('test')
    const planParam = searchParams.get('plan') || 'early-bird'

    if (testParam === 'true') {
      setIsTestMode(true)
    } else {
      // Track successful purchase in Google Analytics and GTM (only for real payments)
      trackPurchase(19999, planParam)

      // Track in Google Tag Manager for enhanced ecommerce
      trackGTMPurchase({
        transaction_id: `order_${Date.now()}`,
        value: 19999,
        currency: 'INR',
        items: [{
          item_id: planParam,
          item_name: 'PowerCA Early Bird Offer',
          price: 19999,
          quantity: 1
        }]
      })
    }

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Test Mode Banner */}
        {isTestMode && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">🧪 Test Payment Successful</p>
              <p className="text-sm text-yellow-700">
                This was a test payment. No real money was charged. All systems processed the payment as if it were real.
              </p>
            </div>
          </div>
        )}
        <Card className="shadow-xl border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            </div>
            <CardTitle className="text-3xl text-green-800">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Welcome to PowerCA Family
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">PowerCA Implementation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">{isTestMode ? '₹1 (Test)' : '₹22,000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">First Year:</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">Check your email</p>
                    <p className="text-sm text-gray-600">
                      We've sent your receipt and login credentials to your email
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">Account setup</p>
                    <p className="text-sm text-gray-600">
                      Our team will contact you within 24 hours to begin setup
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <Download className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">Download invoice</p>
                    <p className="text-sm text-gray-600">
                      Your GST invoice is ready for download
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Our support team is available 24/7.
                Call us at <a href="tel:+919876543210" className="underline">+91 98765 43210</a> or
                email <a href="mailto:support@powerca.in" className="underline">support@powerca.in</a>
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              className="w-full bg-primary-600 hover:bg-primary-700"
              asChild
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.print()}
            >
              <Download className="mr-2 w-4 h-4" />
              Download Invoice
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}