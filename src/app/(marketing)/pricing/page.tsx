'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'

interface Subscription {
  id: string
  plan_type: string
  status: string
  created_at: string
}

function PricingContent() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'onetime' | 'installment'>('onetime')
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null) // Track which plan button is loading
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
    <div className="min-h-screen bg-white">
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

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[2.5rem] 2xl:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 lg:mb-10 font-inter px-2">
              Choose Your Perfect
              <br />
              <span className="text-blue-600">Pricing Plan</span>
            </h1>

            {/* Description */}
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
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

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

          {/* Show single subscribed plan if user has subscription */}
          {!loadingSubscription && activeSubscription && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* Show the active plan card */}
                {(activeSubscription.plan_type === 'monthly') && (
                  <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg bg-[#306bea] text-white border-2 border-[#306bea]">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        Active Plan
                      </span>
                    </div>
                    <div className="relative z-10 flex flex-col">
                      <div className="text-center mb-6 mt-4">
                        <h3 className="text-lg md:text-xl font-semibold text-white">Monthly Subscription</h3>
                      </div>
                      <div className="p-4 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl text-white">₹</span>
                          <span className="font-bold text-4xl md:text-5xl text-white">100</span>
                        </div>
                        <p className="text-lg font-semibold mt-3 text-white">/user/monthly</p>
                        <p className="text-sm mt-1 text-white/70">+ Applicable Taxes</p>
                      </div>
                      <div className="space-y-3 mb-6">
                        {['On Installation and Demo', 'Ongoing Support', 'Per user'].map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-base text-white/90">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => window.location.href = '/account'}
                        className="w-full py-3.5 rounded-full text-lg font-medium shadow-lg bg-white text-[#306bea] hover:bg-gray-50 transition-colors"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                )}

                {(activeSubscription.plan_type === 'annual') && (
                  <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg bg-[#306bea] text-white border-2 border-[#306bea]">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        Active Plan
                      </span>
                    </div>
                    <div className="relative z-10 flex flex-col">
                      <div className="text-center mb-6 mt-4">
                        <h3 className="text-lg md:text-xl font-semibold text-white">Annual Subscription</h3>
                      </div>
                      <div className="p-4 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl text-white">₹</span>
                          <span className="font-bold text-4xl md:text-5xl text-white">1,000</span>
                        </div>
                        <p className="text-lg font-semibold mt-3 text-white">/user/annual</p>
                        <p className="text-sm mt-1 text-white/70">+ Applicable Taxes</p>
                      </div>
                      <div className="space-y-3 mb-6">
                        {['On Installation and Demo', 'Ongoing Support', 'Per user'].map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-base text-white/90">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => window.location.href = '/account'}
                        className="w-full py-3.5 rounded-full text-lg font-medium shadow-lg bg-white text-[#306bea] hover:bg-gray-50 transition-colors"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                )}

                {(activeSubscription.plan_type === 'onetime' || activeSubscription.plan_type === 'installment') && (
                  <div className="relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg bg-[#306bea] text-white border-2 border-[#306bea]">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                        Active Plan
                      </span>
                    </div>
                    <div className="relative z-10 flex flex-col">
                      <div className="text-center mb-6 mt-4">
                        <h3 className="text-lg md:text-xl font-semibold text-white">
                          {activeSubscription.plan_type === 'onetime' ? 'One Time Payment' : 'Installment Plan'}
                        </h3>
                      </div>
                      <div className="p-4 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-2xl text-white">₹</span>
                          <span className="font-bold text-4xl md:text-5xl text-white">
                            {activeSubscription.plan_type === 'onetime' ? '1,00,000' : '10,000'}
                          </span>
                        </div>
                        <p className="text-lg font-semibold mt-3 text-white">
                          {activeSubscription.plan_type === 'onetime' ? 'Lifetime License' : '(10 Months)'}
                        </p>
                        <p className="text-sm mt-1 text-white/70">+ Applicable Taxes</p>
                      </div>
                      <div className="space-y-3 mb-6">
                        {['On Installation and Demo', 'Ongoing Support', 'Upto 20 users'].map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-base text-white/90">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => window.location.href = '/account'}
                        className="w-full py-3.5 rounded-full text-lg font-medium shadow-lg bg-white text-[#306bea] hover:bg-gray-50 transition-colors"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-6">

            {/* Card 1 - Monthly Subscription (Lowest Price) */}
            <div
              onClick={() => setActiveCard('monthly')}
              className={`relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg cursor-pointer transition-all duration-300 h-full flex flex-col ${
                activeCard === 'monthly'
                  ? 'bg-[#306bea] text-white border-2 border-[#306bea]'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Fixed height for alignment */}
                <div className="text-center mb-6 h-[70px]">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'monthly' ? 'text-white' : 'text-[#001525]'}`}>Monthly License</h3>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${activeCard === 'monthly' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>Monthly Subscription</span>
                </div>

                {/* Pricing Section Wrapper - Fixed height for alignment */}
                <div className="h-[160px] flex flex-col justify-center">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-2xl ${activeCard === 'monthly' ? 'text-white' : 'text-[#306bea]'}`}>₹</span>
                      <span className={`font-bold text-4xl md:text-5xl ${activeCard === 'monthly' ? 'text-white' : 'text-[#001525]'}`}>100</span>
                    </div>
                    <p className={`text-lg font-semibold mt-3 ${activeCard === 'monthly' ? 'text-white' : 'text-[#306bea]'}`}>/user/monthly</p>
                    <p className={`text-sm mt-1 ${activeCard === 'monthly' ? 'text-white/70' : 'text-gray-400'}`}>+ Applicable Taxes</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {['On Installation and Demo', 'Ongoing Support', 'Per user'].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 ${activeCard === 'monthly' ? 'text-white' : 'text-[#306bea]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-base ${activeCard === 'monthly' ? 'text-white/90' : 'text-[#666d80]'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Order Now Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOrderClick('monthly', 100); }}
                      disabled={loadingPlan === 'monthly'}
                      className={`w-full py-3.5 rounded-full text-lg font-medium shadow-lg transition-colors ${
                        loadingPlan === 'monthly'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : activeCard === 'monthly'
                            ? 'bg-white text-[#306bea] hover:bg-gray-50'
                            : 'bg-[#306bea] text-white hover:bg-[#244b9b]'
                      } cursor-pointer`}
                    >
                      {loadingPlan === 'monthly' ? 'Please wait...' : 'Order Now'}
                    </button>
                    {!session && (
                      <p className={`text-sm text-center mt-2 ${activeCard === 'monthly' ? 'text-white/80' : 'text-gray-500'}`}>
                        *Please signin to order
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card 2 - Annual Subscription */}
            <div
              onClick={() => setActiveCard('annual')}
              className={`relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg cursor-pointer transition-all duration-300 h-full flex flex-col ${
                activeCard === 'annual'
                  ? 'bg-[#306bea] text-white border-2 border-[#306bea]'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Fixed height for alignment */}
                <div className="text-center mb-6 h-[70px]">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'annual' ? 'text-white' : 'text-[#001525]'}`}>Annual License</h3>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${activeCard === 'annual' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>Annual Subscription</span>
                </div>

                {/* Pricing Section Wrapper - Fixed height for alignment */}
                <div className="h-[160px] flex flex-col justify-center">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-2xl ${activeCard === 'annual' ? 'text-white' : 'text-[#306bea]'}`}>₹</span>
                      <span className={`font-bold text-4xl md:text-5xl ${activeCard === 'annual' ? 'text-white' : 'text-[#001525]'}`}>1,000</span>
                    </div>
                    <p className={`text-lg font-semibold mt-3 ${activeCard === 'annual' ? 'text-white' : 'text-[#306bea]'}`}>/user/annual</p>
                    <p className={`text-sm mt-1 ${activeCard === 'annual' ? 'text-white/70' : 'text-gray-400'}`}>+ Applicable Taxes</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {['On Installation and Demo', 'Ongoing Support', 'Per user'].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 ${activeCard === 'annual' ? 'text-white' : 'text-[#306bea]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-base ${activeCard === 'annual' ? 'text-white/90' : 'text-[#666d80]'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Order Now Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOrderClick('annual', 1000); }}
                      disabled={loadingPlan === 'annual'}
                      className={`w-full py-3.5 rounded-full text-lg font-medium shadow-lg transition-colors ${
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

            {/* Card 3 - One Time / Installment with Tabs (Highest Price) */}
            <div
              onClick={() => setActiveCard('lifetime')}
              className={`relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg cursor-pointer transition-all duration-300 h-full flex flex-col ${
                activeCard === 'lifetime'
                  ? 'bg-[#306bea] text-white border-2 border-[#306bea]'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {/* Heading Tag */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  Perpetual License
                </span>
              </div>
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

              <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Fixed height for alignment */}
                <div className="text-center mb-6 h-[70px] flex flex-col justify-center">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'lifetime' ? 'text-white' : 'text-[#001525]'}`}>One Time Payment</h3>
                </div>

                {/* Pricing Section Wrapper - Fixed height for alignment */}
                <div className="h-[160px] flex flex-col justify-center">
                  {/* Tabs */}
                  <div className={`flex rounded-full p-1 mb-3 ${
                    activeCard === 'lifetime' ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveTab('onetime'); }}
                      className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                        activeTab === 'onetime'
                          ? activeCard === 'lifetime'
                            ? 'bg-white text-[#306bea]'
                            : 'bg-[#306bea] text-white'
                          : activeCard === 'lifetime'
                            ? 'text-white hover:bg-white/10'
                            : 'text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveTab('installment'); }}
                      className={`flex-1 py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                        activeTab === 'installment'
                          ? activeCard === 'lifetime'
                            ? 'bg-white text-[#306bea]'
                            : 'bg-[#306bea] text-white'
                          : activeCard === 'lifetime'
                            ? 'text-white hover:bg-white/10'
                            : 'text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      Installment
                    </button>
                  </div>

                  {/* Pricing Content */}
                  <div className="text-center">
                    {activeTab === 'onetime' ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-2xl ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`}>₹</span>
                          <span className={`font-bold text-4xl md:text-5xl ${activeCard === 'lifetime' ? 'text-white' : 'text-[#001525]'}`}>1,00,000</span>
                        </div>
                        {/* <p className={`text-sm font-semibold mt-2 ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`}>One-Time Payment</p> */}
                        <p className={`text-xs mt-0.5 ${activeCard === 'lifetime' ? 'text-white/70' : 'text-gray-400'}`}>+ Applicable Taxes</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-2xl ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`}>₹</span>
                          <span className={`font-bold text-4xl md:text-5xl ${activeCard === 'lifetime' ? 'text-white' : 'text-[#001525]'}`}>10,000</span>
                        </div>
                        <p className={`text-sm font-semibold mt-2 ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`}>(10 Months)</p>
                        <p className={`text-xs mt-0.5 ${activeCard === 'lifetime' ? 'text-white/70' : 'text-gray-400'}`}>+ Applicable Taxes</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {['On Installation and Demo', 'Ongoing Support', 'Upto 20 users'].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 ${activeCard === 'lifetime' ? 'text-white' : 'text-[#306bea]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-base ${activeCard === 'lifetime' ? 'text-white/90' : 'text-[#666d80]'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Order Now Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentPlanType = activeTab === 'onetime' ? 'onetime' : 'installment';
                        const planPrice = activeTab === 'onetime' ? 100000 : 10000;
                        handleOrderClick(currentPlanType, planPrice);
                      }}
                      disabled={loadingPlan === 'onetime' || loadingPlan === 'installment'}
                      className={`w-full py-3.5 rounded-full text-lg font-medium shadow-lg transition-colors ${
                        loadingPlan === 'onetime' || loadingPlan === 'installment'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : activeCard === 'lifetime'
                            ? 'bg-white text-[#306bea] hover:bg-gray-50'
                            : 'bg-[#306bea] text-white hover:bg-[#244b9b]'
                      } cursor-pointer`}
                    >
                      {(loadingPlan === 'onetime' || loadingPlan === 'installment') ? 'Please wait...' : 'Order Now'}
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
              className={`relative rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg cursor-pointer transition-all duration-300 h-full flex flex-col ${
                activeCard === 'enterprise'
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-2 border-purple-500'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {/* Enterprise Tag */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  Enterprise
                </span>
              </div>

              <div className="relative z-10 flex flex-col flex-1">
                {/* Header - Fixed height for alignment */}
                <div className="text-center mb-6 h-[70px]">
                  <h3 className={`text-xl md:text-2xl font-semibold ${activeCard === 'enterprise' ? 'text-white' : 'text-[#001525]'}`}>Large Practitioner</h3>
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${activeCard === 'enterprise' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>20+ Users</span>
                </div>

                {/* Pricing Section - Fixed height for alignment */}
                <div className="h-[160px] flex flex-col justify-center">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`font-bold text-3xl md:text-3xl ${activeCard === 'enterprise' ? 'text-white' : 'text-[#001525]'}`}>Custom Pricing</span>
                    </div>
                    <p className={`text-sm mt-3 ${activeCard === 'enterprise' ? 'text-white/70' : 'text-gray-400'}`}>Tailored for your needs</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {['Priority Support 24/7', 'Custom Integrations', 'Unlimited Users'].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 ${activeCard === 'enterprise' ? 'text-white' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-base ${activeCard === 'enterprise' ? 'text-white/90' : 'text-[#666d80]'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Contact TBS Button - Hidden for affiliates */}
                {!isAffiliate && (
                  <div className="mt-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowEnterpriseModal(true); }}
                      className={`w-full py-3.5 rounded-full text-lg font-medium shadow-lg transition-colors ${
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

      {/* Bottom CTA */}
      {/* <div className="pb-12 md:pb-24">
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
      </div> */}

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