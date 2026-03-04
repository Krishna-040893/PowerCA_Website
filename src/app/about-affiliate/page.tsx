'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Handshake,
  TrendingUp,
  Briefcase,
  RefreshCw,
  Shield,
  Heart,
  Monitor,
  CheckCircle2,
  ArrowRight,
  Users,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Receipt,
  Database,
  Sparkles,
  IndianRupee,
  Rocket,
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

const heroSlides = [
  {
    num: '1',
    text: (
      <>
        If you already work closely with Chartered Accountants through Tally implementations, compliance services or consulting, you are sitting on a <strong className="text-gray-900">powerful untapped opportunity.</strong>
      </>
    ),
  },
  {
    num: '2',
    text: (
      <>
        Power CA is a specialized ERP built exclusively for CA firms to manage <strong className="text-gray-900">assignments, team workflows, compliance tracking, billing and performance</strong> — all in one system.
      </>
    ),
  },
  {
    num: '3',
    text: (
      <>
        By becoming a Power CA Affiliate Partner, you can <strong className="text-gray-900">monetize your existing CA relationships</strong> while we handle the technical execution.
      </>
    ),
  },
]

function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="max-w-3xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-orange-100/60 px-6 py-5 min-h-[90px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex items-start gap-3 text-left w-full"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
              {heroSlides[current].num}
            </span>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {heroSlides[current].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 bg-gradient-to-r from-orange-500 to-pink-500'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function AboutAffiliatePage() {
  const whyPartner = [
    {
      icon: IndianRupee,
      title: 'Monetize Your Existing CA Network',
      description:
        'You already have strong relationships with CA firms. Instead of offering only accounting software, now you can offer a complete Practice Management ERP solution and generate recurring commission income.',
      gradient: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50',
    },
    {
      icon: Briefcase,
      title: 'Add High-Value Software to Your Portfolio',
      description:
        'Position yourself not just as a Tally provider, but as a complete technology advisor for CA firms. Power CA complements Tally and enhances operational efficiency for your clients.',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
    },
    {
      icon: RefreshCw,
      title: 'Recurring Revenue Model',
      description:
        'Earn commission on every successful referral. As your referred clients continue using the software, you benefit from long-term earning potential.',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
    },
    {
      icon: Shield,
      title: 'Zero Operational Burden',
      description:
        'We manage product demos, client onboarding, training, and ongoing support. You simply introduce the opportunity — we handle the rest.',
      gradient: 'from-purple-500 to-violet-500',
      bg: 'bg-purple-50',
    },
    {
      icon: Heart,
      title: 'Increase Client Loyalty',
      description:
        'When you help your CA clients adopt both Tally and Power CA, you become a long-term technology partner instead of just a software vendor.',
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50',
    },
    {
      icon: Monitor,
      title: 'Flexible Deployment Options',
      description:
        'Offer clients:',
      listItems: ['On-premise deployment', 'Cloud-based access'],
      gradient: 'from-indigo-500 to-blue-500',
      bg: 'bg-indigo-50',
    },
  ]

  const steps = [
    {
      step: '01',
      title: 'Register as an Affiliate',
      description: 'Sign up through our affiliate registration form.',
      icon: ClipboardList,
    },
    {
      step: '02',
      title: 'Refer CA Firms',
      description: 'Introduce Power CA to firms in your network.',
      icon: Users,
    },
    {
      step: '03',
      title: 'We Demonstrate & Close',
      description: 'Our team conducts product demos and handles all technical discussions.',
      icon: BarChart3,
    },
    {
      step: '04',
      title: 'Earn Commission',
      description: 'Receive commission for every successful conversion.',
      icon: TrendingUp,
    },
  ]

  const whoCanJoin = [
    'Tally Partners',
    'Tally Solution Providers',
    'ERP Consultants',
    'Chartered Accountants',
    'CA Firms',
    'Tax Consultants',
    'Professional Network Builders',
    'Business Advisors',
    'Tax Book Sellers',
  ]

  const whyCAFirmsChoose = [
    { text: 'Track assignments and deadlines', icon: ClipboardList },
    { text: 'Manage team productivity', icon: Users },
    { text: 'Monitor compliance status', icon: Shield },
    { text: 'Streamline communication', icon: MessageSquare },
    { text: 'Improve billing and profitability', icon: Receipt },
    { text: 'Centralize client data', icon: Database },
  ]

  const whatMakesDifferent = [
    'Built exclusively for CA firms',
    'Designed around Indian compliance workflows',
    'Practical, easy-to-use interface',
    'Continuous product improvements',
    'Dedicated support team',
    'Proven and working for 10+ years',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-0 flex items-center justify-center overflow-hidden bg-white">
        {/* Background box with rounded corners like home page */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #fff1f2 100%)' }}>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-300/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-300/30 rounded-full blur-2xl" />
            <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-rose-200/25 rounded-full blur-2xl" />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg">
                <Handshake className="w-4 h-4 mr-2" />
                Affiliate Partner Program
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 leading-tight mb-6"
            >
              Partner with{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Power CA
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 font-medium"
            >
              Turn Your CA Network into a Recurring Revenue Stream
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-gray-500 mb-8 max-w-2xl mx-auto"
            >
              Best for Tally Partners, Tally Solution Providers &amp; Professional Network Builders
            </motion.p>

            {/* Auto-scrolling key points carousel */}
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-orange-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Partner with Power CA?
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Six compelling reasons to join our affiliate program
            </p>
          </motion.div>
          <motion.div
            {...staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {whyPartner.map((item, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="group bg-white rounded-2xl p-6 sm:p-8 border border-orange-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.gradient.includes('orange') ? '#f97316' : item.gradient.includes('blue') ? '#3b82f6' : item.gradient.includes('green') ? '#22c55e' : item.gradient.includes('purple') ? '#a855f7' : item.gradient.includes('pink') ? '#ec4899' : '#6366f1' }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.description}</p>
                {'listItems' in item && item.listItems && (
                  <ul className="mt-2 space-y-1">
                    {(item.listItems as string[]).map((li, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        {li}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who Can Join Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Who Can Become a Power CA Affiliate?
              </h2>
              <p className="text-gray-500 text-base sm:text-lg mb-8">
                If you work with CA firms, this program is built for you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whoCanJoin.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-transparent rounded-xl px-4 py-3 border border-orange-100/50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #fff1f2 100%)' }}>
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-200/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-200/30 rounded-full blur-2xl" />
                <div className="relative z-10">
                <Sparkles className="w-10 h-10 mb-6 text-orange-500 opacity-80" />
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
                  Build Recurring Income from Your Relationships
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                  Your CA network is valuable. Power CA helps you convert that network into a
                  predictable and recurring revenue stream — without increasing your workload.
                </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              How the Affiliate Program Works
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              Simple. Transparent. Scalable.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative text-center group"
              >
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-orange-500/20">
                    <item.icon className="w-9 h-9 text-white" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base">{item.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-gray-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CA Firms Choose Power CA */}
      <section className="py-8 sm:py-10 lg:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why CA Firms Choose Power CA
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              When you recommend Power CA, you are offering real operational transformation — not just another software.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4 lg:gap-5 max-w-5xl mx-auto">
            {/* Left column: 1, 2, 3 */}
            <motion.div {...staggerContainer} className="flex flex-col gap-4">
              {whyCAFirmsChoose.slice(0, 3).map((item, index) => (
                <motion.div
                  key={index}
                  {...staggerItem}
                  className="flex items-center gap-4 bg-orange-50 hover:bg-orange-100/80 rounded-2xl px-5 py-4 border border-orange-100 transition-colors group"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
            {/* Right column: 4, 5, 6 */}
            <motion.div {...staggerContainer} className="flex flex-col gap-4">
              {whyCAFirmsChoose.slice(3, 6).map((item, index) => (
                <motion.div
                  key={index + 3}
                  {...staggerItem}
                  className="flex items-center gap-4 bg-orange-50 hover:bg-orange-100/80 rounded-2xl px-5 py-4 border border-orange-100 transition-colors group"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 4}
                  </span>
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Makes Power CA Different */}
      <section className="py-8 sm:py-10 lg:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                What Makes Power CA Different?
              </h2>
            </motion.div>
            <motion.div
              {...staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
            >
              {whatMakesDifferent.map((item, index) => (
                <motion.div
                  key={index}
                  {...staggerItem}
                  className="flex items-start gap-3 bg-white rounded-xl px-5 py-4 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all"
                >
                  <Rocket className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-12 lg:py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 50%, #fff1f2 100%)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Ready to Start Earning?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
              Join the Power CA Affiliate Program today and turn your professional network into a sustainable revenue stream.
            </p>
            <Link
              href="/affiliate-register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base sm:text-lg"
            >
              Register as Affiliate
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
