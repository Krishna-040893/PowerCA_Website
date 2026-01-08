'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import {
  Download,
  CheckCircle,
  Monitor,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

// Application products data
const appProducts = [
  {
    id: 'powerca-demo-version',
    name: 'Demo Version',
    description: 'Access is limited to one month and is intended solely for training content.',
    price: 2000,
    features: [
      'Complete Client Management',
      'Jobcard',
      'Billing & Invoicing',
      'Payroll',
      'Attendance',
      'Financial Statement',
      'User Management'
    ],
    systemRequirements: {
      os: 'Windows 10/11 (64-bit)',
      ram: '4 GB minimum (8 GB recommended)',
      storage: '500 MB available space',
      processor: 'Intel Core i3 or equivalent'
    },
    icon: Monitor,
    popular: true,
    version: '2.5.0',
    releaseDate: 'December 2025'
  }
]

export default function AppDownloadPage() {
  const [selectedProduct, setSelectedProduct] = useState(appProducts[0])
  const [purchaseCount, setPurchaseCount] = useState(0)
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status } = useSession()
  const subscriptionStatus = useSubscription()

  // Check if user is an affiliate
  const isAffiliate = session?.user?.role === 'affiliate' || session?.user?.role === 'Affiliate'

  // Check if user has paid for any plan
  const hasPaidPricing = subscriptionStatus.hasAnyPaidPlan

  // Fix hydration error - wait for client mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check user's purchase count
  useEffect(() => {
    async function checkPurchaseStatus() {
      if (status === 'loading') return

      if (!session?.user) {
        setIsCheckingPurchase(false)
        return
      }

      try {
        const response = await fetch('/api/user/app-downloads')
        const data = await response.json()

        if (data.success && data.downloads) {
          setPurchaseCount(data.downloads.length)
        }
      } catch (error) {
        console.error('Error checking purchase status:', error)
      } finally {
        setIsCheckingPurchase(false)
      }
    }

    checkPurchaseStatus()
  }, [session, status])

  const handleBuyNow = (productId: string) => {
    // Wait for session to load
    if (status === 'loading') return

    // Check if user is logged in
    if (!session) {
      // Redirect to login with callback to this page
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/app-download')}`
      return
    }
    // User is logged in, redirect to checkout with product info
    window.location.href = `/app-checkout?product=${productId}`
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Background Image - Same as Pricing Page */}
        <div
          className="absolute inset-0 rounded-2xl mx-3 sm:mx-4 md:mx-6 lg:mx-6"
          style={{
            backgroundImage: 'url("/images/pricing-hero-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium font-inter">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Demo Version
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[2.5rem] 2xl:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 lg:mb-10 font-inter px-2">
              Download Demo Version
            </h1>

            {/* Description */}
            <div className="mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto px-2">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-xl text-gray-600 leading-relaxed font-inter">
                The demo version is available for a one-month period and is intended solely for training purposes. During this time, users will have access to demo content to understand how the application works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Card Section */}
      <section className="py-8 sm:py-10 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {appProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 ${
                  product.popular ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                {/* Popular Badge */}
                {product.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-bl-2xl font-semibold text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 p-6 sm:p-8 lg:p-12">
                  {/* Left Column - Product Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <product.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h2>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{product.description}</p>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Purchase Count Badge */}
                    {isMounted && purchaseCount > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            <span className="text-blue-800 font-medium">
                              Purchased: {purchaseCount} {purchaseCount === 1 ? 'time' : 'times'}
                            </span>
                          </div>
                          <Link
                            href="/account?tab=downloads"
                            className="text-sm text-blue-600 hover:underline font-medium"
                          >
                            View Downloads →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Buy Button */}
                    {isCheckingPurchase || subscriptionStatus.isLoading ? (
                      <Button
                        disabled
                        size="lg"
                        className="w-full bg-gray-400 text-white py-6 text-lg font-semibold rounded-xl"
                      >
                        Checking...
                      </Button>
                    ) : isMounted && isAffiliate ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-800 font-medium">
                              Demo Version Not Available for Affiliates
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                              As an affiliate partner, you are not eligible to purchase the demo version.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : isMounted && session && !hasPaidPricing ? (
                      <div className="space-y-3">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <p className="text-amber-800 text-sm">
                              Demo Version access will be available after completing the payment.
                            </p>
                          </div>
                        </div>
                        <Link href="/pricing">
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Go to Pricing
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Sign in/Sign up prompt for non-logged in users */}
                        {isMounted && !session && (
                          <p className="text-center text-gray-600 text-sm">
                            * Please Sign In or Sign Up to continue
                          </p>
                        )}
                        <Button
                          onClick={() => handleBuyNow(product.id)}
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Pay & Get Download Link
                        </Button>
                      </div>
                    )}

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        Secure Payment
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Instant Download
                      </span>
                    </div>
                  </div>

                  {/* Right Column - Features */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Included - Demo Content of</h3>
                    <ul className="space-y-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* System Requirements */}
                    {/* <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">System Requirements</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>OS:</strong> {product.systemRequirements.os}</p>
                        <p><strong>RAM:</strong> {product.systemRequirements.ram}</p>
                        <p><strong>Storage:</strong> {product.systemRequirements.storage}</p>
                        <p><strong>Processor:</strong> {product.systemRequirements.processor}</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
