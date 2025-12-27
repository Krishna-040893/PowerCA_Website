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

  // Verify if the logged-in user has a valid referral
  useEffect(() => {
    const verifyReferral = async () => {
      if (!session?.user?.email) {
        setIsValidReferral(false)
        return
      }

      try {
        // Fetch user's actual referral info from database
        const response = await fetch('/api/user/referral-info')
        const data = await response.json()

        if (data.hasReferral && data.referralInfo) {
          // User has a valid referral in the database
          setIsValidReferral(true)
          // Update referralInfo state with database values if not already set from URL
          if (!referralInfo?.ref || !referralInfo?.cus) {
            const dbReferralInfo = {
              ref: data.referralInfo.referralCode,
              cus: data.referralInfo.customerId
            }
            setReferralInfo(dbReferralInfo)
            // Also update localStorage
            localStorage.setItem('affiliate_referral', JSON.stringify(dbReferralInfo))
          }
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
    // Store referral info in localStorage if present
    if (referralInfo?.ref || referralInfo?.cus) {
      localStorage.setItem('affiliate_referral', JSON.stringify({
        ref: referralInfo.ref,
        cus: referralInfo.cus,
        timestamp: Date.now()
      }))
    }

    if (!session) {
      // Redirect to login with callback URL to return to account page with billing tab
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/account?tab=billing')}`
      return
    }

    // Redirect to account page (billing tab) for address management
    window.location.href = '/account?tab=billing'
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
      <section className="relative py-8 sm:py-10 md:py-12 lg:py-14">
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

            {/* Main Heading - Optimized for Laptop */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[2.5rem] 2xl:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 lg:mb-10 font-inter px-2">
              Choose Your Perfect
              <br />
              <span className="text-blue-600">Pricing Plan</span>
            </h1>

            {/* Description - Optimized for Laptop */}
            <div className="mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto px-2">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-xl text-gray-600 leading-relaxed font-inter">
                Pick a plan that grows with you. Our pricing is straightforward—no hidden charges, just the features you need to succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <div className="relative py-8 sm:py-10 md:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">

            {/* Left Card - Launch Offer */}
            <div className="relative bg-[#306bea] rounded-2xl md:rounded-3xl p-6 md:p-12 text-white shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 overflow-hidden rounded-3xl pointer-events-none">
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
                  <h3 className="text-2xl md:text-3xl font-medium mb-2 md:mb-3">Power CA</h3>
                  <p className="text-[#f4f7fd] text-sm md:text-base italic px-2">
                    Be an Early Bird to Enjoy the Offer
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
                    <p className="text-[#f4f7fd] text-xs md:text-sm opacity-0">-</p>
                  </div>
                </div>

                {/* Service Package Card - Timeline Design */}
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
                  {/* Header */}
                  <div className="mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[#001525] text-lg md:text-xl font-semibold">Payment Terms</h4>
                      {/* <span className="text-gray-400 text-base md:text-lg font-medium">₹50,000</span> */}
                    </div>
                    {/* <p className="text-gray-500 text-sm mt-1">Flexible Payment Structure</p> */}
                    <p className="text-gray-400 text-xs mt-2">A structured two-installment payment plan, consisting of an initial payment at the time of purchase and the remaining balance payable within three months.</p>
                  </div>

                  {/* Payment Timeline - Shows both payment steps as enabled */}
                  <div className="relative pl-6">
                    {/* Timeline vertical line */}
                    <div className="absolute left-[9px] top-[28px] bottom-[28px] w-0.5 bg-[#306bea]"></div>

                    {/* First Payment - Initial Payment */}
                    <div className="relative flex items-start justify-between mb-8">
                      {/* Timeline circle */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-[#306bea] bg-[#306bea] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-[#001525] text-base md:text-lg">On Installation & Support</p>
                        <p className="text-xs mt-0.5 text-gray-500">
                          Payable at the time of purchase
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[#306bea] text-base">₹</span>
                          <span className="font-bold text-[#306bea] text-2xl md:text-3xl">25,000</span>
                        </div>
                        <p className="text-xs text-gray-400">+ Applicable Taxes</p>
                      </div>
                    </div>

                    {/* Second Payment - Final Settlement (also enabled) */}
                    <div className="relative flex items-start justify-between">
                      {/* Timeline circle */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-[#306bea] bg-[#306bea] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-[#001525] text-base md:text-lg">Final Settlement</p>
                        <p className="text-xs mt-0.5 text-gray-500">
                          Payable within 3 months
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[#306bea] text-base">₹</span>
                          <span className="font-bold text-[#306bea] text-2xl md:text-3xl">25,000</span>
                        </div>
                        <p className="text-xs text-gray-400">+ Applicable Taxes</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {/* <div className="mt-6 space-y-3">
                    {[
                      'Complete software installation & demo',
                      'Comprehensive hands-on training',
                      'Ongoing support & regular updates'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#306bea] flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm">{feature}</p>
                      </div>
                    ))}
                  </div> */}
                </div>

                {/* Button - Always show Order Now, redirects to Account page for per-address management */}
                <button
                  onClick={handleLaunchOfferPurchase}
                  disabled={isAffiliate}
                  title={isAffiliate ? 'Affiliates cannot purchase directly' : 'View billing addresses and payment options'}
                  className={`w-full py-4 rounded-full text-lg font-medium shadow-lg transition-colors ${
                    isAffiliate
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-[#306bea] hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  {isAffiliate ? 'Not Available for Affiliates' : 'Order Now'}
                </button>
                {!session && (
                  <p className="text-sm text-white/90 text-center mt-3">
                    *Please signin or signup to order
                  </p>
                )}
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
                <div className="text-center mb-6 md:mb-8">
                  <p className="text-[#666d80] text-base md:text-lg">
                    An annual fee of{' '}
                    <span className="text-2xl md:text-4xl font-bold text-[#001525]">₹1,000</span>
                    {' '}per user.
                  </p>
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
      <div className="pb-12 md:pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="bg-white border-2 border-[#e5e7eb] rounded-3xl p-5 md:p-6 max-w-2xl mx-auto shadow-md hover:shadow-lg transition-shadow flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none">
                  <path d="M6 4C6 2.89543 6.89543 2 8 2H18L26 10V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z" fill="#DC2626"/>
                  <path d="M18 2L26 10H20C18.8954 10 18 9.10457 18 8V2Z" fill="#FCA5A5"/>
                  <text x="16" y="22" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">PDF</text>
                </svg>
              </div>
              <div>
                <p className="text-[#001525] font-semibold text-sm md:text-base">Power CA Pricing Policy</p>
                <p className="text-gray-500 text-xs md:text-sm">View complete pricing details</p>
              </div>
            </div>
            <a
              href="/docs/PowerCA_Pricing_Agreement.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#306bea] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-sm font-semibold hover:bg-[#244b9b] transition-all hover:scale-105 whitespace-nowrap shadow-sm inline-block"
            >
              View
            </a>
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