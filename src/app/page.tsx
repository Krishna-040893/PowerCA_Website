import { Metadata } from 'next'
import Image from 'next/image'
import { ClientLogos } from '@/components/client-logos'
import { ProfessionRotator } from '@/components/home/profession-rotator'
import { BenefitsAccordion } from '@/components/home/benefits-accordion'
import { SectionHeader } from '@/components/home/section-header'
import TestimonialsSection from '@/components/testimonials-section'
import { FAQWithSchema, powerCAFAQs } from '@/components/sections/faq-with-schema'
import { OverviewCarousel } from '@/components/sections/overview-carousel'
import './testimonial-scroll.css'

// Enable static generation for homepage
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: 'PowerCA - Practice Management Software for CAs in India | Save 10+ Hours Weekly',
  description: 'Transform your CA practice with PowerCA. Complete practice management software for Chartered Accountants. Job card management, billing, compliance tracking. Free demo available.',
  keywords: 'CA practice management software, chartered accountant software India, CA office automation, tax practice management, CA firm management system, PowerCA, practice management for CAs',
  openGraph: {
    title: 'PowerCA - Practice Management Software for Chartered Accountants',
    description: 'Streamline your CA practice with PowerCA. Save 10+ hours weekly, ensure 100% compliance, and grow effortlessly.',
    images: ['/og-image.jpg'],
    url: 'https://powerca.in',
    siteName: 'PowerCA',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PowerCA - Practice Management Software for CAs',
    description: 'Complete practice management solution for Chartered Accountants in India.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://powerca.in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// The six highlighted modules, shown in the same card style as the modules page.
const featuredModules = [
  {
    iconSrc: '/images/job-card-icon.svg',
    alt: 'Job Card Management Module Icon - Track and manage all client jobs with intuitive dashboard for CA practices',
    title: 'Job Card Management',
    description: 'Comprehensive job management with intuitive dashboard, advanced search, and seamless edit functions for efficient workflow control.',
  },
  {
    iconSrc: '/images/costing-module-icon.svg',
    alt: 'Costing Module Icon - Track project costs and analyze profitability for CA practices',
    title: 'Costing Module',
    description: 'Track project costs and analyze profitability with detailed analytics.',
  },
  {
    iconSrc: '/images/crm-module-icon.svg',
    alt: 'CRM Module Icon - Client relationship management with lead tracking and engagement analytics',
    title: 'CRM Module',
    description: 'Build stronger client relationships with integrated CRM featuring lead tracking and engagement analytics.',
  },
  {
    iconSrc: '/images/clients-module-icon.svg',
    alt: 'Clients Module Icon - Centralized client profiles with documents and communication history',
    title: 'Clients Module',
    description: 'Centralized client management with detailed profiles, documents, and communication history.',
  },
  {
    iconSrc: '/images/financial-statements-icon.svg',
    alt: 'Financial Statements Module Icon - Generate balance sheets and P&L reports with real-time data',
    title: 'Financial Statements',
    description: 'Generate accurate financial statements, balance sheets, and P&L reports with real-time data.',
  },
  {
    iconSrc: '/images/billing-module-icon.svg',
    alt: 'Billing Module Icon - Automated invoicing with GST compliance and payment tracking',
    title: 'Billing Module',
    description: 'Streamline invoicing with automated billing, payment tracking, and GST compliance.',
  },
]

// What the client-server model gives a practice, listed beside the diagram.
const clientServerFeatures = [
  {
    title: 'Regulatory compliance',
    icon: '/images/regulatory-compliance-icon.png',
    alt: 'Regulatory Compliance Icon - Ensure tax and GST compliance for CA practices in India',
  },
  {
    title: 'Real Time Analysis',
    icon: '/images/real-time-analysis-icon.png',
    alt: 'Real-Time Analysis Icon - Live data analytics and reporting for CA firms',
  },
  {
    title: 'Data Security',
    icon: '/images/data-security-icon.png',
    alt: 'Data Security Icon - Secure client data protection with encryption for CA practices',
  },
  {
    title: '24/7 Dedicated Support',
    icon: '/images/247-dedicated-support-icon.png',
    alt: '24/7 Dedicated Support Icon - Round-the-clock technical support for PowerCA users',
  },
]

export default function Home() {
  // LocalBusiness Schema for SEO
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'PowerCA',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'description': 'Complete practice management software for Chartered Accountants in India',
    'url': 'https://powerca.in',
    'offers': {
      '@type': 'Offer',
      'price': '22000',
      'priceCurrency': 'INR',
      'priceValidUntil': '2025-12-31',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': 'PowerCA',
        'url': 'https://powerca.in'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '1500',
      'bestRating': '5',
      'worstRating': '1'
    },
    'creator': {
      '@type': 'Organization',
      'name': 'PowerCA',
      'url': 'https://powerca.in',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Mumbai',
        'addressRegion': 'Maharashtra',
        'addressCountry': 'IN'
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-1800-123-4567',
        'contactType': 'customer support',
        'availableLanguage': ['en', 'hi']
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="min-h-screen bg-[#F8FBFC]">
      {/* Hero Section */}
      <section className="relative py-7 sm:py-10 md:py-12 lg:py-[60px] flex items-center justify-center overflow-hidden bg-white">
        {/* Mosaic background, inset with rounded corners like the other sections. */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/images/hero-mosaic-bg.jpg"
              alt=""
              fill
              className="object-cover object-center"
              priority
              quality={90}
              sizes="100vw"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-6 xl:px-16 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Tagline pill */}
            <div className="mb-5 sm:mb-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/80 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.14em] text-gray-500 shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-sm">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Your Practice. Organized, Optimized, Empowered.</span>
                <span className="sm:hidden">Organized. Optimized. Empowered.</span>
              </span>
            </div>

            {/* Main Heading with SEO Keywords */}
            <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] font-semibold tracking-tight text-[#001525] leading-[1.1] mb-4 sm:mb-5 lg:mb-6 px-2 text-center">
              <span className="lg:whitespace-nowrap">Practice Management Software for</span>
              <br />
              <span className="mt-1 sm:mt-2 block">
                <ProfessionRotator />
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto max-w-5xl text-[15px] sm:text-[17px] leading-relaxed text-gray-500 font-inter mb-6 sm:mb-8 lg:mb-10 px-2">
              Power CA is a robust administrative tool designed to take control and bring efficiency to your practice.
              Empower your practice by seamlessly managing your tasks, billing, documentation and other functions.
              We cordially welcome you to explore further.
            </p>

            {/* Value Proposition */}
            <div className="mb-8 sm:mb-10 lg:mb-12 px-2">
              {/* Mobile Layout - Stacked */}
              <div className="md:hidden space-y-3 text-center">
                <div className="flex items-center justify-center text-[#001525] text-xs sm:text-sm font-medium">
                  <div className="w-4 sm:w-6 h-px bg-gray-300 mr-2"></div>
                  <span>Save 10+ hours weekly</span>
                  <div className="w-4 sm:w-6 h-px bg-gray-300 ml-2"></div>
                </div>
                <div className="flex items-center justify-center text-[#001525] text-xs sm:text-sm font-medium">
                  <div className="w-4 sm:w-6 h-px bg-gray-300 mr-2"></div>
                  <span>Ensure 100% compliance</span>
                  <div className="w-4 sm:w-6 h-px bg-gray-300 ml-2"></div>
                </div>
                <div className="flex items-center justify-center text-[#001525] text-xs sm:text-sm font-medium">
                  <div className="w-4 sm:w-6 h-px bg-gray-300 mr-2"></div>
                  <span>Grow effortlessly</span>
                  <div className="w-4 sm:w-6 h-px bg-gray-300 ml-2"></div>
                </div>
              </div>

              {/* Desktop Layout - Horizontal */}
              <div className="hidden md:flex items-center justify-center text-[#001525] text-sm md:text-base font-medium">
                <div className="flex items-center">
                  <div className="w-8 h-px bg-gray-300 mr-3"></div>
                  <span className="whitespace-nowrap">Save 10+ hours weekly</span>
                  <span className="mx-3 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#001525]" aria-hidden="true"></span>
                  <span className="whitespace-nowrap">Ensure 100% compliance</span>
                  <span className="mx-3 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#001525]" aria-hidden="true"></span>
                  <span className="whitespace-nowrap">Grow effortlessly</span>
                  <div className="w-8 h-px bg-gray-300 ml-3"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-2">
              <a
                href="/book-demo"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-b from-white to-gray-100 px-6 py-3 text-sm sm:text-base font-medium text-[#001525] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(16,24,40,0.45)] w-full sm:w-auto sm:min-w-[200px] font-inter"
              >
                <span>Book Your Demo</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/docs/PowercaPromoters.pdf"
                download="PowercaPromoters.pdf"
                className="group inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#001525]/45 bg-white/60 backdrop-blur-sm px-6 py-3 text-sm sm:text-base font-medium text-[#001525] transition-all duration-200 hover:border-[#001525]/70 hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001525]/30 w-full sm:w-auto sm:min-w-[200px] font-inter"
              >
                <span>Promoter&apos;s Perspective</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <ClientLogos />


      {/* Streamline Your Practice - Text Only Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden bg-white">
        <div className="relative rounded-2xl overflow-hidden bg-white">
          <Image
            src="/images/streamline-bg.jpg"
            alt=""
            fill
            className="object-cover absolute inset-0"
            loading="lazy"
            quality={85}
            sizes="100vw"
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 py-7 sm:py-10 md:py-12 lg:py-[60px] relative z-10">
          <SectionHeader
            title="Streamline"
            emphasis="Your Practice"
            description="Power CA helps you organize and streamline your office functional areas like task management, client management, staff management and billing, and manage all information related to your practice in an accessible in-house application."
            cta={{ href: '/register', label: 'Register Now' }}
          />

          {/* Modules Workflow Image */}
          <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center">
            <div className="relative max-w-4xl w-full">
              <Image
                src="/images/power-ca-modules-workflow.png"
                alt="PowerCA Complete Module Workflow - Job Cards, Billing, Compliance Management for CA Firms"
                width={1200}
                height={800}
                className="w-full h-auto object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                quality={85}
              />
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <SectionHeader
              title="Important Power CA"
              emphasis="Modules"
              description="Discover the full potential of Power CA through its modules, designed to streamline operations, increase productivity, and empower your practice."
              cta={{ href: '/modules', label: 'All Modules' }}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {featuredModules.map((module) => (
              <div
                key={module.title}
                className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]"
              >
                <div className="mb-6 sm:mb-7 flex h-11 w-11 items-center justify-center rounded-[6px] bg-blue-50">
                  <Image
                    src={module.iconSrc}
                    alt={module.alt}
                    width={32}
                    height={32}
                    className="h-6 w-6 object-contain"
                    loading="lazy"
                  />
                </div>

                <h3 className="mb-2 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">
                  {module.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-500 font-inter">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start Using Power CA Today Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden bg-white">
        <div className="relative rounded-2xl overflow-hidden py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
          <Image
            src="/images/start-using-bg.jpg"
            alt=""
            fill
            className="object-cover absolute inset-0"
            loading="lazy"
            quality={85}
            sizes="100vw"
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
            {/* Full Width Header Section */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <SectionHeader
                title="Start using"
                emphasis="Power CA today"
                trailing="!"
                description="From the first demo to a fully configured office — each step is guided, so your practice is live without a long onboarding project."
                cta={{ href: '/pricing', label: 'Pricing Plan' }}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 items-start">
              {/* Left Content - 5 Steps - Wider */}
              <div className="lg:col-span-2">
                {/* Step 1 */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-start pb-2 sm:pb-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Image
                      src="/images/step-1-icon.png"
                      alt="Step 1 Icon - Book your PowerCA demo for CA practice management software"
                      width={56}
                      height={56}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                      loading="lazy"
                      sizes="56px"
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-11 md:col-span-3">
                    <h3 className="text-base sm:text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Schedule a<br/><span className="text-blue-600">Demo</span>
                    </h3>
                  </div>
                  <div className="col-span-12 sm:col-span-12 md:col-span-8 mt-2 md:mt-0">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Book a demo to test out the application for yourself.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-2 sm:my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 2 */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-start py-2 sm:py-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Image
                      src="/images/step-2-icon.png"
                      alt="Step 2 Icon - Select PowerCA package based on your CA firm size and users"
                      width={56}
                      height={56}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                      loading="lazy"
                      sizes="56px"
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-11 md:col-span-3">
                    <h3 className="text-base sm:text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Purchase A <span className="text-blue-600">Plan</span>
                    </h3>
                  </div>
                  <div className="col-span-12 sm:col-span-12 md:col-span-8 mt-2 md:mt-0">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Check out our Pricing Page through the button on the right and purchase the application based on your users.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-2 sm:my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 3 */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-start py-2 sm:py-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Image
                      src="/images/step-3-icon.png"
                      alt="Step 3 Icon - Install PowerCA and activate your license with support team assistance"
                      width={56}
                      height={56}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                      loading="lazy"
                      sizes="56px"
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-11 md:col-span-3">
                    <h3 className="text-base sm:text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Install Power CA and<br/><span className="text-blue-600">Activate Your License</span>
                    </h3>
                  </div>
                  <div className="col-span-12 sm:col-span-12 md:col-span-8 mt-2 md:mt-0">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Our Support team will get in touch with you to help you install and activate your license once the payment is complete.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-2 sm:my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 4 */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-start py-2 sm:py-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Image
                      src="/images/step-4-icon.png"
                      alt="Step 4 Icon - Import your existing CA firm data into PowerCA system"
                      width={56}
                      height={56}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                      loading="lazy"
                      sizes="56px"
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-11 md:col-span-3">
                    <h3 className="text-base sm:text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Import Your<br/><span className="text-blue-600">Data</span>
                    </h3>
                  </div>
                  <div className="col-span-12 sm:col-span-12 md:col-span-8 mt-2 md:mt-0">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Using our default data import functionality, import all your tasks, billing, employees and client data.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-2 sm:my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 5 */}
                <div className="grid grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-start pt-2 sm:pt-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Image
                      src="/images/step-5-icon.png"
                      alt="Step 5 Icon - Receive support and training for your CA firm staff"
                      width={56}
                      height={56}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                      loading="lazy"
                      sizes="56px"
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-11 md:col-span-3">
                    <h3 className="text-base sm:text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Support and<br/><span className="text-blue-600">Training</span>
                    </h3>
                  </div>
                  <div className="col-span-12 sm:col-span-12 md:col-span-8 mt-2 md:mt-0">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      Our Support team will help you set up the application and provide necessary training for your staff.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Professional Image */}
              <div className="lg:col-span-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
                <div className="w-full max-w-lg">
                  <Image
                    src="/images/start-using-power-ca-today.jpg"
                    alt="Professional Chartered Accountant using PowerCA practice management software on laptop"
                    width={500}
                    height={600}
                    className="w-full h-auto shadow-lg rounded-2xl"
                    loading="lazy"
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <SectionHeader
            title="Benefits of"
            emphasis="PowerCA"
            description="Discover how PowerCA streamlines audit-firm operations, automates administrative tasks, and enhances service quality with built-in best practices, digital workflows, and powerful reporting tools."
          />

          {/* Benefits Accordion Component */}
          <div className="mt-6 sm:mt-8">
            <BenefitsAccordion />
          </div>
        </div>
      </section>

      {/* PowerCA Overview Carousel Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden bg-white">
        <div className="relative rounded-2xl overflow-hidden py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
          <Image
            src="/images/glance-bg.jpg"
            alt=""
            fill
            className="object-cover absolute inset-0"
            loading="lazy"
            quality={85}
            sizes="100vw"
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
            <div className="mb-8 sm:mb-12">
              <SectionHeader
                title="PowerCA at a"
                emphasis="Glance"
                description="Browse the posters covering each part of PowerCA and see how the modules fit into your day-to-day practice."
              />
            </div>
          </div>

          <div className="px-3 sm:px-4 lg:px-5 relative z-10">
            <OverviewCarousel />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <TestimonialsSection />
        </div>
      </section>

      {/* Client-Server Background Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden bg-white">
        <div className="relative rounded-2xl overflow-hidden py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
          <Image
            src="/images/client-server-bg.jpg"
            alt=""
            fill
            className="object-cover absolute inset-0"
            loading="lazy"
            quality={85}
            sizes="100vw"
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
            <SectionHeader
              title="Client - Server"
              emphasis="Model"
              description="Efficient communication, centralized data management, and seamless interaction."
              cta={{ href: '/book-demo', label: 'Book Demo' }}
            />

            {/* Three Content Grid - Equal Spans */}
            <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 mt-8 sm:mt-12 lg:mt-16 items-center">
              {/* Left Content - Description */}
              <div className="lg:col-span-4">
                <p className="text-[15px] sm:text-[17px] leading-relaxed text-[#001525] font-inter">
                  Our Power CA software product operates on a client-server model, wherein the system is divided into two main components: the client and the server.
                </p>

                <div className="mt-5 space-y-4 sm:space-y-5">
                  <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
                    The server hosts the core functionalities and data, managing requests from clients and executing operations. Clients, which can be desktop applications interact with the server to access these functionalities. Through communication over a network using protocols like HTTP or TCP/IP, SMTP, clients send requests to the server, which responds accordingly, managing data integrity, security, and concurrency.
                  </p>

                  <p className="text-[15px] leading-relaxed text-gray-500 font-inter">
                    Our software ensures scalability and robust security measures, providing users with efficient access to centralized data and functionalities while maintaining a secure and reliable environment for collaborative use.
                  </p>
                </div>
              </div>

              {/* Center Content - Features List */}
              <div className="lg:col-span-4">
                <div className="space-y-3 sm:space-y-4">
                  {clientServerFeatures.map((feature) => (
                    <div
                      key={feature.title}
                      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/90 px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] backdrop-blur-sm transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-blue-50">
                        <Image
                          src={feature.icon}
                          alt={feature.alt}
                          width={40}
                          height={40}
                          className="h-6 w-6 object-contain"
                          loading="lazy"
                          sizes="40px"
                        />
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold leading-snug text-[#001525] font-inter">
                        {feature.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Server Network Diagram */}
              <div className="lg:col-span-4 flex justify-center mt-6 lg:mt-0">
                <div className="max-w-lg w-full rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-20px_rgba(16,24,40,0.20)]">
                  <Image
                    src="/images/server-network-diagram.png"
                    alt="PowerCA Client-Server Network Architecture Diagram - Secure cloud-based practice management system for CA firms"
                    width={600}
                    height={600}
                    className="w-full h-auto"
                    loading="lazy"
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <FAQWithSchema
        title="Frequently Asked Questions About"
        titleEmphasis="PowerCA"
        description="Get answers to common questions about PowerCA practice management software"
        faqs={powerCAFAQs}
        className="bg-white"
      />
    </div>
    </>
  )
}