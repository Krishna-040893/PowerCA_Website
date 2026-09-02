'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { PageHero } from '@/components/layout/page-hero'

interface Subscription {
  id: string
  plan_type: string
  status: string
  created_at: string
}

function PricingContent() {
  const { data: session } = useSession()
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [loadingPlan, _setLoadingPlan] = useState<string | null>(null) // Track which plan button is loading
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  // Enterprise inquiry modal state
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false)
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    phone: '',
    firmName: '',
    userCount: '',
    message: ''
  })
  const [enterpriseLoading, setEnterpriseLoading] = useState(false)
  const [enterpriseSuccess, setEnterpriseSuccess] = useState(false)
  const [enterpriseError, setEnterpriseError] = useState('')

  // Check if user is an affiliate
  const isAffiliate = session?.user?.role === 'Affiliate' || session?.user?.role === 'affiliate'

  // Check if user has active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (session?.user) {
        try {
          setLoadingSubscription(true)
          const response = await fetch('/api/subscriptions/status')
          const data = await response.json()

          if (data.subscriptions && data.subscriptions.length > 0) {
            // Find active subscription
            const active = data.subscriptions.find(
              (sub: Subscription) => sub.status === 'active' || sub.status === 'paid'
            )
            setActiveSubscription(active || null)
          }
        } catch (error) {
          console.error('Error checking subscription:', error)
        } finally {
          setLoadingSubscription(false)
        }
      } else {
        setLoadingSubscription(false)
      }
    }
    checkSubscription()
  }, [session])

  const handleOrderClick = async (planType: string, planPrice: number) => {
    if (!session) {
      // Not logged in - redirect to login, then to billing page with plan info
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/account?tab=billing&paymentType=${planType}&planPrice=${planPrice}`)}`
      return
    }

    // Always go to billing page to select/add address first
    // Store plan info and redirect to billing tab
    window.location.href = `/account?tab=billing&paymentType=${planType}&planPrice=${planPrice}`
  }

  // Handle enterprise inquiry form submission
  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnterpriseLoading(true)
    setEnterpriseError('')

    try {
      const response = await fetch('/api/enterprise-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enterpriseForm)
      })

      const data = await response.json()

      if (data.success) {
        setEnterpriseSuccess(true)
        setEnterpriseForm({
          name: '',
          email: '',
          phone: '',
          firmName: '',
          userCount: '',
          message: ''
        })
        // Close modal after 3 seconds
        setTimeout(() => {
          setShowEnterpriseModal(false)
          setEnterpriseSuccess(false)
        }, 3000)
      } else {
        setEnterpriseError(data.error || 'Failed to submit inquiry')
      }
    } catch (error) {
      console.error('Enterprise inquiry error:', error)
      setEnterpriseError('Something went wrong. Please try again.')
    } finally {
      setEnterpriseLoading(false)
    }
  }

  // Pre-fill form when user is logged in
  useEffect(() => {
    if (session?.user) {
      setEnterpriseForm(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
        phone: session.user?.phone || '',
        firmName: session.user?.firmName || ''
      }))
    }
  }, [session])

  return (
    <div className="min-h-screen bg-[#F8FBFC]">
      {/* Hero Section */}
      <PageHero
        backgroundImage="/images/pricing-hero-bg.jpg"
        badge={{
          icon: (
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 13L14.5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 13C15.667 13 15.667 3 9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          label: 'Simple Plans, Clear Value',
        }}
        title="Choose Your Perfect"
        accent="Pricing Plan"
        description="Pick a plan that grows with you. Our pricing is straightforward—no hidden charges, just the features you need to succeed."
      />

      {/* Pricing Cards */}
      <div className="relative py-7 sm:py-10 md:py-12 lg:py-[60px]">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

          {/* Loading state */}
          {loadingSubscription && session && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#306bea]"></div>
            </div>
          )}

          {/* User has active subscription - show only their plan */}
          {!loadingSubscription && activeSubscription && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">You have an active {activeSubscription.plan_type} subscription</span>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your current plan is active. You can manage your subscription from your account dashboard.
              </p>
            </div>
          )}

          {/* Show all plans if no active subscription */}
          {!loadingSubscription && !activeSubscription && (
          <>
          {/* Affiliate Notice */}
          {isAffiliate && (
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-xl">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">As an affiliate partner, you are not eligible to purchase these plans.</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">

            {/* Card 1 - Server Installation & Configuration */}
            <div
              className="relative rounded-2xl h-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-gray-100 overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-20px_rgba(16,24,40,0.20)]"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-blue-200/30 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-100/20 rounded-full blur-xl"></div>

              {/* Marketing Highlight */}
              <div className="relative py-3.5 text-center overflow-hidden w-full px-6 md:px-8 bg-amber-100 border-b border-amber-200 h-[100px] flex flex-col justify-center">
                <div className="absolute top-0 bottom-0 w-[30%] animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                <p className="relative text-base text-amber-700 font-semibold">Base Server cost</p>
                <p className="relative mt-1"><span className="text-base font-bold text-amber-700">MRP:</span> <span className="font-extrabold text-3xl text-amber-800 line-through">₹50,000</span></p>
              </div>

              <div className="relative z-10 flex flex-col flex-1 justify-center items-center pt-0 px-6 pb-6 md:pt-0 md:px-8 md:pb-8">
                {/* Special Offer Text */}
                <p className="text-base md:text-lg font-semibold text-[#001525] mb-5 text-center">
                  Special <span className="text-[#306bea] font-extrabold bg-blue-100 px-1.5 py-0.5 rounded">2026-2027</span> New Year Offer for <span className="text-[#306bea] font-extrabold bg-blue-100 px-1.5 py-0.5 rounded">CAs</span>
                </p>

                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#306bea] to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-semibold text-[#001525] leading-tight text-center mb-2">Server Installation & Configuration</h3>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#306bea]/10 text-[#306bea] border border-[#306bea]/20 mb-6">One Time Charge</span>

                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl text-[#306bea]">₹</span>
                    <span className="font-bold text-4xl md:text-5xl text-[#001525]">5,000</span>
                  </div>
                  <p className="text-sm mt-3 text-gray-400">+ Applicable Taxes</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Annual Subscription */}
            <div
              onClick={() => setActiveCard('annual')}
              className={`relative rounded-2xl cursor-pointer transition-all duration-300 h-full flex flex-col overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-20px_rgba(16,24,40,0.20)] hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_24px_48px_-20px_rgba(16,24,40,0.28)] ${
                activeCard === 'annual'
                  ? 'bg-[#306bea] text-white border border-[#306bea]'
                  : 'bg-white border border-gray-100'
              }`}
            >
              {/* Marketing Highlight */}
              <div className={`relative py-3.5 text-center overflow-hidden w-full px-6 md:px-8 h-[100px] flex flex-col justify-center ${activeCard === 'annual' ? 'bg-white/15 border-b border-white/20' : 'bg-emerald-100 border-b border-emerald-200'}`}>
                <div className={`absolute top-0 bottom-0 w-[30%] animate-shimmer bg-gradient-to-r from-transparent ${activeCard === 'annual' ? 'via-white/20' : 'via-white/60'} to-transparent`}></div>
                <p className={`relative font-semibold text-base ${activeCard === 'annual' ? 'text-white' : 'text-emerald-700'}`}>Great Opportunity for Prop. Firms</p>
              </div>

              <div className="relative z-10 flex flex-col flex-1 p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'annual' ? 'text-white' : 'text-[#001525]'}`}>Annual License</h3>
                </div>

                {/* Pricing Section Wrapper */}
                <div className="flex flex-col justify-center">
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`line-through text-4xl md:text-[2.75rem] font-bold ${activeCard === 'annual' ? 'text-white/50' : 'text-gray-400'}`}>₹3,000</span>
                      <span className={`text-[2.1875rem] md:text-[2.5rem] font-bold ${activeCard === 'annual' ? 'text-white' : 'text-[#001525]'}`}>₹1,500</span>
                    </div>
                    <p className={`text-lg font-semibold mt-3 ${activeCard === 'annual' ? 'text-white' : 'text-[#306bea]'}`}>/user/annual</p>
                    <p className={`text-sm mt-1 ${activeCard === 'annual' ? 'text-white/70' : 'text-gray-400'}`}>+ Applicable Taxes</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6 mt-10">
                  {['Minimum 5 users', 'Add users according to the per-user cost', 'Onsite support available via affiliates, subject to their terms'].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activeCard === 'annual' ? 'text-white' : 'text-[#306bea]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-[15px] leading-relaxed ${activeCard === 'annual' ? 'text-white/90' : 'text-gray-500'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Order Now Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOrderClick('annual', 1500); }}
                      disabled={loadingPlan === 'annual'}
                      className={`w-full h-12 rounded-full text-base font-medium shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-colors ${
                        loadingPlan === 'annual'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : activeCard === 'annual'
                            ? 'bg-white text-[#306bea] hover:bg-gray-50'
                            : 'bg-[#306bea] text-white hover:bg-[#244b9b]'
                      } cursor-pointer`}
                    >
                      {loadingPlan === 'annual' ? 'Please wait...' : 'Order Now'}
                    </button>
                    {!session && (
                      <p className={`text-sm text-center mt-2 ${activeCard === 'annual' ? 'text-white/80' : 'text-gray-500'}`}>
                        *Please signin to order
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card 3 - One Time Payment (5 Year Plan) */}
            <div
              onClick={() => setActiveCard('lifetime')}
              className={`relative rounded-2xl cursor-pointer transition-all duration-300 h-full flex flex-col overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-20px_rgba(16,24,40,0.20)] hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_24px_48px_-20px_rgba(16,24,40,0.28)] ${
                activeCard === 'lifetime'
                  ? 'bg-[#306bea] text-white border border-[#306bea]'
                  : 'bg-white border border-gray-100'
              }`}
            >
              {/* Background Pattern - Only show when active */}
              {activeCard === 'lifetime' && (
                <div className="absolute inset-0 opacity-10 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute top-8 left-8 w-48 h-48">
                    <div className="grid grid-cols-6 grid-rows-6 h-full gap-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-sm opacity-20" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Marketing Highlight */}
              <div className={`relative py-3.5 text-center overflow-hidden w-full px-6 md:px-8 h-[100px] flex flex-col justify-center ${activeCard === 'lifetime' ? 'bg-white/15 border-b border-white/20' : 'bg-violet-100 border-b border-violet-200'}`}>
                <div className={`absolute top-0 bottom-0 w-[30%] animate-shimmer bg-gradient-to-r from-transparent ${activeCard === 'lifetime' ? 'via-white/20' : 'via-white/60'} to-transparent`}></div>
                <p className={`relative font-semibold text-base leading-tight ${activeCard === 'lifetime' ? 'text-white' : 'text-violet-700'}`}>Economical & Inflation Protector</p>
                <p className={`relative text-sm mt-0.5 ${activeCard === 'lifetime' ? 'text-white/80' : 'text-violet-600'}`}>Assured Support for 2 Years</p>
              </div>

              <div className="relative z-10 flex flex-col flex-1 p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'lifetime' ? 'text-white' : 'text-[#001525]'}`}>2 Year Plan</h3>
                </div>

                {/* Pricing Section Wrapper */}
                <div className="flex flex-col justify-center">
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`line-through text-4xl md:text-[2.75rem] font-bold ${activeCard === 'lifetime' ? 'text-white/50' : 'text-gray-400'}`}>₹6,000</span>
                      <span className={`text-[2.1875rem] md:text-[2.5rem] font-bold ${activeCard === 'lifetime' ? 'text-white' : 'text-[#001525]'}`}>₹3,000</span>
                    </div>
                    <p className={`text-lg font-semibold mt-3 ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`}>/user/2 year</p>
                    <p className={`text-sm mt-1 ${activeCard === 'lifetime' ? 'text-white/70' : 'text-gray-400'}`}>+ Applicable Taxes</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6 mt-10">
                  {['Minimum 5 users', 'Add users according to the per-user cost', 'Onsite support available via affiliates, subject to their terms'].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-[15px] leading-relaxed ${activeCard === 'lifetime' ? 'text-white/90' : 'text-gray-500'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Order Now Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick('onetime', 3000);
                      }}
                      disabled={loadingPlan === 'onetime'}
                      className={`w-full h-12 rounded-full text-base font-medium shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-colors ${
                        loadingPlan === 'onetime'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : activeCard === 'lifetime'
                            ? 'bg-white text-[#306bea] hover:bg-gray-50'
                            : 'bg-[#306bea] text-white hover:bg-[#244b9b]'
                      } cursor-pointer`}
                    >
                      {loadingPlan === 'onetime' ? 'Please wait...' : 'Order Now'}
                    </button>
                    {!session && (
                      <p className={`text-sm text-center mt-2 ${activeCard === 'lifetime' ? 'text-white/80' : 'text-gray-500'}`}>
                        *Please signin to order
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card 4 - Large Practitioner / Enterprise */}
            <div
              onClick={() => setActiveCard('enterprise')}
              className={`relative rounded-2xl cursor-pointer transition-all duration-300 h-full flex flex-col overflow-hidden shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-20px_rgba(16,24,40,0.20)] hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_24px_48px_-20px_rgba(16,24,40,0.28)] ${
                activeCard === 'enterprise'
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-2 border-purple-500'
                  : 'bg-white border border-gray-100'
              }`}
            >
              {/* Marketing Highlight */}
              <div className={`relative py-3.5 text-center overflow-hidden w-full px-6 md:px-8 h-[100px] flex flex-col justify-center ${activeCard === 'enterprise' ? 'bg-white/15 border-b border-white/20' : 'bg-rose-100 border-b border-rose-200'}`}>
                <div className={`absolute top-0 bottom-0 w-[30%] animate-shimmer bg-gradient-to-r from-transparent ${activeCard === 'enterprise' ? 'via-white/20' : 'via-white/60'} to-transparent`}></div>
                <p className={`relative font-semibold text-base ${activeCard === 'enterprise' ? 'text-white' : 'text-rose-700'}`}>Customizable & Scalable</p>
                <p className={`relative text-sm mt-0.5 ${activeCard === 'enterprise' ? 'text-white/80' : 'text-rose-600'}`}>Your Extended IT Arm</p>
              </div>

              <div className="relative z-10 flex flex-col flex-1 p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-3">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'enterprise' ? 'text-white' : 'text-[#001525]'}`}>Large Practitioner</h3>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${activeCard === 'enterprise' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>20+ Users</span>
                </div>

                {/* Pricing Section */}
                <div className="h-[130px] flex flex-col justify-center">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`font-bold text-3xl md:text-3xl ${activeCard === 'enterprise' ? 'text-white' : 'text-[#001525]'}`}>Custom Pricing</span>
                    </div>
                    <p className={`text-sm mt-3 ${activeCard === 'enterprise' ? 'text-white/70' : 'text-gray-400'}`}>Tailored for your needs</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {['Priority Support 24/7', 'Customization', 'Unlimited Users'].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${activeCard === 'enterprise' ? 'text-white' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-[15px] leading-relaxed ${activeCard === 'enterprise' ? 'text-white/90' : 'text-gray-500'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Contact TBS Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowEnterpriseModal(true); }}
                      className={`w-full h-12 rounded-full text-base font-medium shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-colors ${
                        activeCard === 'enterprise'
                          ? 'bg-white text-purple-600 hover:bg-gray-50'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                      } cursor-pointer`}
                    >
                      Contact TBS
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          </>
          )}
        </div>
      </div>

      {/* Enterprise Inquiry Modal */}
      {showEnterpriseModal && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-28 px-4 pb-8 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowEnterpriseModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 rounded-t-2xl relative">
              <h3 className="text-xl font-bold text-white">Enterprise Inquiry</h3>
              <p className="text-white/80 text-sm mt-1">Get custom pricing for 20+ users</p>

              {/* Close Button - Inside Header */}
              <button
                onClick={() => setShowEnterpriseModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {enterpriseSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Submitted!</h4>
                  <p className="text-gray-600">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                  {enterpriseError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {enterpriseError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={enterpriseForm.name}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={enterpriseForm.email}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="Your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={enterpriseForm.phone}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Firm Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={enterpriseForm.firmName}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, firmName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="Firm name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Number of Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="20"
                      value={enterpriseForm.userCount}
                      onChange={(e) => setEnterpriseForm(prev => ({ ...prev, userCount: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      placeholder="Enter number of users (20+)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={enterpriseForm.message}
                      onChange={(e) => setEnterpriseForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enterpriseLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {enterpriseLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
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
