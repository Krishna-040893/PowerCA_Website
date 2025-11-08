'use client'

import { Check, Calendar, Clock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PricingContent() {
  const { data: session } = useSession()
  const subscriptionStatus = useSubscription()
  const searchParams = useSearchParams()
  const [referralInfo, setReferralInfo] = useState<{ ref?: string; cus?: string } | null>(null)
  const [isValidReferral, setIsValidReferral] = useState(false)

  // Check if user is an affiliate
  const isAffiliate = session?.user?.role === 'Affiliate' || session?.user?.role === 'affiliate'

  useEffect(() => {
    // Detect referral parameters from URL
    const ref = searchParams.get('ref')
    const cus = searchParams.get('cus')

    if (ref || cus) {
      // Store referral info in localStorage to persist through login
      const referralData = { ref: ref || undefined, cus: cus || undefined }
      localStorage.setItem('affiliate_referral', JSON.stringify(referralData))
      setReferralInfo(referralData)
    } else {
      // Check if referral info exists in localStorage
      const stored = localStorage.getItem('affiliate_referral')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setReferralInfo(parsed)
        } catch {
          // Failed to parse stored referral - ignore and continue
        }
      }
    }
  }, [searchParams])

  // Verify if the logged-in user actually matches this referral
  useEffect(() => {
    const verifyReferral = async () => {
      if (!session?.user?.email || !referralInfo?.ref || !referralInfo?.cus) {
        setIsValidReferral(false)
        return
      }

      try {
        // Fetch user's actual referral info from database
        const response = await fetch('/api/user/referral-info')
        const data = await response.json()

        if (data.hasReferral && data.referralInfo) {
          // Check if the URL parameters match the user's actual referral
          const matchesRef = data.referralInfo.referralCode === referralInfo.ref
          const matchesCus = data.referralInfo.customerId === referralInfo.cus

          setIsValidReferral(matchesRef && matchesCus)
        } else {
          setIsValidReferral(false)
        }
      } catch {
        setIsValidReferral(false)
      }
    }

    verifyReferral()
  }, [session, referralInfo])

  const handleLaunchOfferPurchase = () => {
    if (!session) {
      // Build callback URL with referral params
      const params = new URLSearchParams()

      if (referralInfo?.ref) params.append('ref', referralInfo.ref)
      if (referralInfo?.cus) params.append('cus', referralInfo.cus)

      const checkoutUrl = params.toString() ? `/checkout?${params.toString()}` : '/checkout'

      // Redirect to login with callback URL to return to checkout
      window.location.href = `/login?callbackUrl=${encodeURIComponent(checkoutUrl)}`
      return
    }

    // Build checkout URL with referral params
    const params = new URLSearchParams()
    if (referralInfo?.ref) params.append('ref', referralInfo.ref)
    if (referralInfo?.cus) params.append('cus', referralInfo.cus)

    const checkoutUrl = params.toString() ? `/checkout?${params.toString()}` : '/checkout'

    // Redirect to checkout page for payment
    window.location.href = checkoutUrl
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Affiliate Referral Banner - Only show if user is logged in and referral is verified */}
      {session && isValidReferral && referralInfo?.ref && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-green-200">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🎁</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-700">
                    You're purchasing through an affiliate referral!
                  </p>
                  <p className="text-xs text-gray-600">
                    Referral Code: <span className="font-mono font-bold text-blue-600">{referralInfo.ref}</span>
                    {referralInfo.cus && (
                      <> • Customer ID: <span className="font-mono font-bold text-blue-600">{referralInfo.cus}</span></>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-12 sm:py-14 md:py-16 lg:py-20">
        <div
          className="absolute inset-0 rounded-2xl mx-3 sm:mx-4 md:mx-6 lg:mx-8"
          style={{
            backgroundImage: 'url("/images/pricing-hero-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium font-inter">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <path d="M6 3H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 13L14.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 13C15.667 13 15.667 3 9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Simple Plans, Clear Value
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 font-inter px-2">
              Choose Your Perfect
              <br />
              <span className="text-blue-600">Pricing Plan</span>
            </h1>

            {/* Description */}
            <div className="mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto px-2">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed font-inter">
                Pick a plan that grows with you. Our pricing is straightforward—no hidden charges, just the features you need to succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="relative py-8 sm:py-10 md:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">

            {/* Left Card - Launch Offer */}
            <div className="relative bg-[#306bea] rounded-2xl md:rounded-3xl p-6 md:p-12 text-white shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 overflow-hidden rounded-3xl">
                <div className="absolute top-16 left-16 w-96 h-96">
                  <div className="grid grid-cols-8 grid-rows-8 h-full gap-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-sm opacity-20" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-2xl md:text-3xl font-medium mb-3 md:mb-4">Power CA</h3>
                  <p className="text-[#f4f7fd] text-base md:text-lg px-2">
                    Special discount 50% for CAs only – Till 31st Oct 2025
                  </p>
                </div>

                {/* Plan Type */}
                <div className="flex justify-center mb-6 md:mb-8">
                  <div className="bg-[#f4f7fd] text-[#306bea] px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base">
                    First Year Plan
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 md:mb-8">
                  {/* Regular Price */}
                  <div className="text-center">
                    <p className="text-[#f4f7fd] text-xs md:text-sm mb-1 md:mb-2">REGULAR PRICE</p>
                    <div className="flex items-baseline justify-center gap-1 md:gap-2">
                      <span className="text-lg md:text-2xl">₹</span>
                      <span className="text-2xl md:text-4xl font-semibold line-through">1,00,000</span>
                    </div>
                    <p className="text-[#f4f7fd] text-xs md:text-sm line-through">+ Applicable Taxes</p>
                  </div>

                  {/* Arrow Icons */}
                  <div className="flex justify-center my-2">
                    <svg className="w-16 h-8 md:w-20 md:h-10 lg:w-[92px] lg:h-[52px]" viewBox="0 0 92 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g opacity="0.5">
                        <path d="M27.2997 26L17.333 16.0333L20.3663 13L33.3663 26L20.3663 39L17.333 35.9667L27.2997 26Z" fill="white"/>
                      </g>
                      <g opacity="0.75">
                        <path d="M47.2997 26L37.333 16.0333L40.3663 13L53.3663 26L40.3663 39L37.333 35.9667L47.2997 26Z" fill="white"/>
                      </g>
                      <path d="M67.2997 26L57.333 16.0333L60.3663 13L73.3663 26L60.3663 39L57.333 35.9667L67.2997 26Z" fill="white"/>
                    </svg>
                  </div>

                  {/* Launch Offer */}
                  <div className="text-center">
                    <p className="text-[#f4f7fd] text-xs md:text-sm mb-1 md:mb-2">LAUNCH OFFER</p>
                    <div className="flex items-baseline justify-center gap-1 md:gap-2">
                      <span className="text-lg md:text-2xl">₹</span>
                      <span className="text-2xl md:text-4xl font-semibold">50,000</span>
                    </div>
                    <p className="text-[#f4f7fd] text-xs md:text-sm">+ Applicable Taxes</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center mb-6 md:mb-8">
                  <p className="text-lg md:text-2xl font-medium px-2">Be an Early Bird to Enjoy the Offer</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {[
                    'Installation and Demo',
                    'Required training',
                    'Ongoing Support & Update'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-6">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-[#306bea]" />
                      </div>
                      <span className="text-lg font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={handleLaunchOfferPurchase}
                  disabled={subscriptionStatus.hasLaunchOffer || isAffiliate}
                  title={isAffiliate ? 'Affiliates cannot purchase directly' : subscriptionStatus.hasLaunchOffer ? '' : 'http://localhost:3000/checkout'}
                  className={`w-full py-4 rounded-full text-lg font-medium shadow-lg transition-colors ${
                    subscriptionStatus.hasLaunchOffer || isAffiliate
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-[#306bea] hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {isAffiliate ? 'Not Available for Affiliates' : subscriptionStatus.hasLaunchOffer ? 'Already Purchased' : 'Book Now'}
                </button>
                {isAffiliate && (
                  <p className="text-xs text-white/80 text-center mt-2">
                    As an affiliate, you can refer customers but cannot purchase directly
                  </p>
                )}
              </div>
            </div>

            {/* Right Card - Annual Subscription */}
            <div className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-12 border-2 border-[#001525]">
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-2xl md:text-3xl font-medium text-[#001525] mb-3 md:mb-4">Power CA</h3>
                  <p className="text-[#666d80] text-base md:text-lg max-w-sm mx-auto px-2">
                    Maximum support, minimum recurring cost for your Practice Administration
                  </p>
                </div>

                {/* Plan Type */}
                <div className="flex justify-center mb-6 md:mb-8">
                  <div className="bg-[rgba(48,107,234,0.1)] text-[#306bea] px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base">
                    Annual Subscription
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-4 mb-6 md:mb-8">
                  {/* Percentage */}
                  <div className="text-center">
                    <p className="text-[#666d80] text-xs md:text-sm mb-1 md:mb-2">Your Annual Turnover</p>
                    <div className="flex items-baseline justify-center gap-1 md:gap-2">
                      <span className="text-2xl md:text-4xl font-semibold text-[#001525]">0.20%</span>
                      <span className="text-sm md:text-lg font-medium text-[#001525]">Cost</span>
                    </div>
                    <p className="text-[#666d80] text-xs md:text-sm">+ Applicable Taxes</p>
                  </div>

                  {/* OR */}
                  <div className="text-center px-3 md:px-6">
                    <p className="text-xl md:text-3xl font-medium text-black">OR</p>
                  </div>

                  {/* Fixed Amount */}
                  <div className="text-center">
                    <p className="text-[#666d80] text-xs md:text-sm mb-1 md:mb-2">Minimum Of Cost</p>
                    <div className="flex items-baseline justify-center gap-1 md:gap-2">
                      <span className="text-lg md:text-2xl text-[#001525]">₹</span>
                      <span className="text-2xl md:text-4xl font-semibold text-[#001525]">10,000</span>
                    </div>
                    <p className="text-[#666d80] text-xs md:text-sm">+ Applicable Taxes</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {[
                    'Easy Implementation & Training',
                    'Ongoing Support & Update'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-6">
                      <div className="w-8 h-8 bg-[#001525] rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg text-[#666d80]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <div className="space-y-3">
                  {subscriptionStatus.isLoading ? (
                    <button className="w-full bg-gray-200 text-gray-400 py-4 rounded-full text-lg font-medium animate-pulse">
                      Loading...
                    </button>
                  ) : isAffiliate ? (
                    <button
                      disabled
                      title="Affiliates cannot purchase directly"
                      className="w-full bg-gray-300 text-gray-500 py-4 rounded-full text-lg font-medium cursor-not-allowed"
                    >
                      Not Available for Affiliates
                    </button>
                  ) : subscriptionStatus.canRenew ? (
                    <Link href="/dashboard/subscription/renew">
                      <button className="w-full bg-[#306bea] text-white py-4 rounded-full text-lg font-medium hover:bg-[#244b9b] transition-colors">
                        Renewal Now
                      </button>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-[#f4f7fd] text-[#b6c9f3] py-4 rounded-full text-lg font-medium cursor-not-allowed"
                    >
                      Renewal Now
                    </button>
                  )}

                  <div className="text-xs text-[#666d80] text-center space-y-1">
                    {isAffiliate ? (
                      <p>As an affiliate, you can refer customers but cannot purchase directly</p>
                    ) : !subscriptionStatus.hasLaunchOffer ? (
                      <p>Currently you don't have plan yet !</p>
                    ) : subscriptionStatus.canRenew ? (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <p>Ready for renewal!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <p>Renewal available in {subscriptionStatus.daysUntilRenewal} days</p>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <p>Launch Offer purchased on {subscriptionStatus.subscription ? new Date(subscriptionStatus.subscription.created_at).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pb-8 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[rgba(48,107,234,0.1)] border-2 border-[#b6c9f3] rounded-2xl md:rounded-full p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
            <p className="text-lg md:text-2xl font-medium text-[#001525] text-center md:text-left">
              Refer Power CA Pricing Policy Document
            </p>
            <button className="bg-[#306bea] text-white px-6 md:px-9 py-3 md:py-4 rounded-full text-base md:text-lg font-medium hover:bg-[#244b9b] transition-colors whitespace-nowrap">
              View PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PricingContent />
    </Suspense>
  )
}