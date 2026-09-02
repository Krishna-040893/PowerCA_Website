'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHero } from '@/components/layout/page-hero'
import { SectionHeader } from '@/components/home/section-header'
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
      <div className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm border border-emerald-100/60 px-6 py-5 min-h-[90px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex items-start gap-3 text-left w-full"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
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
                ? 'w-8 bg-gradient-to-r from-emerald-500 to-teal-500'
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
    },
    {
      icon: Briefcase,
      title: 'Add High-Value Software to Your Portfolio',
      description:
        'Position yourself not just as a Tally provider, but as a complete technology advisor for CA firms. Power CA complements Tally and enhances operational efficiency for your clients.',
    },
    {
      icon: RefreshCw,
      title: 'Recurring Revenue Model',
      description:
        'Earn commission on every successful referral. As your referred clients continue using the software, you benefit from long-term earning potential.',
    },
    {
      icon: Shield,
      title: 'Zero Operational Burden',
      description:
        'We manage product demos, client onboarding, training, and ongoing support. You simply introduce the opportunity — we handle the rest.',
    },
    {
      icon: Heart,
      title: 'Increase Client Loyalty',
      description:
        'When you help your CA clients adopt both Tally and Power CA, you become a long-term technology partner instead of just a software vendor.',
    },
    {
      icon: Monitor,
      title: 'Flexible Deployment Options',
      description:
        'Offer clients:',
      listItems: ['On-premise deployment', 'Cloud-based access'],
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
      <PageHero
        backgroundStyle={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #ccfbf1 100%)' }}
        backgroundOverlay={
          <>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-300/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-300/30 rounded-full blur-2xl" />
            <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-green-200/25 rounded-full blur-2xl" />
          </>
        }
        badge={{
          icon: <Handshake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          label: 'Affiliate Partner Program',
        }}
        title={
          <>
            Partner with <span className="text-emerald-600">Power CA</span>
          </>
        }
        description="Turn your CA network into a recurring revenue stream — best for Tally Partners, Tally Solution Providers & professional network builders."
      >
        {/* Auto-scrolling key points carousel */}
        <HeroCarousel />

        <div className="mt-8 flex justify-center">
          <Link
            href="/affiliate-register"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm sm:text-base font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(5,150,105,0.55)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(5,150,105,0.65)] font-inter"
          >
            Become an Affiliate Partner
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </PageHero>

      {/* Why Partner Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-emerald-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-4">
              Why Partner with <span className="font-semibold">Power CA?</span>
            </h2>
            <p className="text-[15px] sm:text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Six compelling reasons to join our affiliate program
            </p>
          </motion.div>
          <motion.div
            {...staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
          >
            {whyPartner.map((item, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]"
              >
                {/* Soft neutral chip so the icons read as one set rather than
                    competing with the card's own border. */}
                <div className="mb-6 sm:mb-7 flex h-11 w-11 items-center justify-center rounded-[6px] bg-emerald-50">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                </div>

                <h3 className="mb-2 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">
                  {item.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-500 font-inter">{item.description}</p>

                {'listItems' in item && item.listItems && (
                  <ul className="mt-2 space-y-1">
                    {(item.listItems as string[]).map((li, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500 font-inter">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="mb-8 sm:mb-10">
            <SectionHeader
              title="Who Can Become a"
              emphasis="Power CA Affiliate?"
              description="If you work with CA firms, this program is built for you."
            />
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div {...fadeInUp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whoCanJoin.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl px-4 py-3 border border-emerald-100/50"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
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
              <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #ccfbf1 100%)' }}>
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-200/30 rounded-full blur-2xl" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-200/30 rounded-full blur-2xl" />
                <div className="relative z-10">
                <Sparkles className="w-10 h-10 mb-6 text-emerald-500 opacity-80" />
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
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-white font-inter mb-4">
              How the <span className="font-semibold">Affiliate Program Works</span>
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
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                    <item.icon className="w-9 h-9 text-white" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base">{item.description}</p>
                {/* Connector sits on the icon's centre line, starting clear of
                    this tile and stopping clear of the next: half a column plus
                    the grid gap, less the 40px icon radius and 8px of breathing
                    room at each end. */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+48px)] w-[calc(100%-64px)] border-t-2 border-dashed border-gray-700 pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CA Firms Choose Power CA */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-4">
              Why CA Firms <span className="font-semibold">Choose Power CA</span>
            </h2>
            <p className="text-[15px] sm:text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
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
                  className="flex items-center gap-4 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl px-5 py-4 border border-emerald-100 transition-colors group"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold">
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
                  className="flex items-center gap-4 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl px-5 py-4 border border-emerald-100 transition-colors group"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center text-sm font-bold">
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
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-4">
                What Makes <span className="font-semibold">Power CA Different?</span>
              </h2>
            </motion.div>
            <motion.div
              {...staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
            >
              {whatMakesDifferent.map((item, index) => (
                <motion.div
                  key={index}
                  {...staggerItem}
                  className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-emerald-50">
                      <Rocket className="h-6 w-6 text-emerald-600" />
                    </div>

                    <h3 className="text-sm sm:text-base font-medium leading-snug text-[#001525] font-inter">
                      {item}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #ccfbf1 100%)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-6">
              Ready to <span className="font-semibold">Start Earning?</span>
            </h2>
            <p className="text-[15px] sm:text-[17px] text-gray-500 mb-10 leading-relaxed">
              Join the Power CA Affiliate Program today and turn your professional network into a sustainable revenue stream.
            </p>
            <Link
              href="/affiliate-register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm sm:text-base font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(5,150,105,0.55)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(5,150,105,0.65)] font-inter"
            >
              Register as Affiliate
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
