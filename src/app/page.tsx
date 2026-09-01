import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ClientLogos } from '@/components/client-logos'
import { ProfessionRotator } from '@/components/home/profession-rotator'
import { BenefitsAccordion } from '@/components/home/benefits-accordion'
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
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-3 sm:py-4 md:py-5 lg:py-8 flex items-center justify-center overflow-hidden bg-white">
        {/* Optimized background image using next/image */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/images/hero-mosaic-bg.jpg"
              alt="PowerCA Practice Management Software Dashboard for Chartered Accountants"
              fill
              className="object-cover object-center"
              priority
              quality={90}
              sizes="100vw"
            />
            {/* Optional overlay for better text readability */}
            <div className="absolute inset-0 bg-white/10"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-6 xl:px-16 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Your Practice. Organized, Optimized, Empowered.</span>
                <span className="sm:hidden">Organized. Optimized. Empowered.</span>
              </span>
            </div>

            {/* Main Heading with SEO Keywords - Optimized for Laptop */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[2.75rem] 2xl:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 lg:mb-8 xl:mb-10 px-2 text-center">
              <span className="lg:whitespace-nowrap">Practice Management Software for</span>
              <br />
              <span className="mt-2 sm:mt-4 block">
                <ProfessionRotator />
              </span>
            </h1>

            {/* Description - Optimized for Laptop */}
            <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto px-2">
              Power CA is a robust administrative tool designed to take control and bring efficiency to your practice.
              Empower your practice by seamlessly managing your tasks, billing, documentation and other functions.
              We cordially welcome you to explore further.
            </p>

            {/* Value Proposition */}
            <div className="mb-8 sm:mb-10 lg:mb-12 px-2">
              {/* Mobile Layout - Stacked */}
              <div className="md:hidden space-y-3 text-center">
                <div className="flex items-center justify-center text-gray-500 text-xs sm:text-sm">
                  <div className="w-4 sm:w-6 h-px bg-gray-300 mr-2"></div>
                  <span>Save 10+ hours weekly</span>
                  <div className="w-4 sm:w-6 h-px bg-gray-300 ml-2"></div>
                </div>
                <div className="flex items-center justify-center text-gray-500 text-xs sm:text-sm">
                  <div className="w-4 sm:w-6 h-px bg-gray-300 mr-2"></div>
                  <span>Ensure 100% compliance</span>
                  <div className="w-4 sm:w-6 h-px bg-gray-300 ml-2"></div>
                </div>
                <div className="flex items-center justify-center text-gray-500 text-xs sm:text-sm">
                  <div className="w-4 sm:w-6 h-px bg-gray-300 mr-2"></div>
                  <span>Grow effortlessly</span>
                  <div className="w-4 sm:w-6 h-px bg-gray-300 ml-2"></div>
                </div>
              </div>

              {/* Desktop Layout - Horizontal */}
              <div className="hidden md:flex items-center justify-center text-gray-500 text-sm md:text-base">
                <div className="flex items-center">
                  <div className="w-8 h-px bg-gray-300 mr-3"></div>
                  <span className="whitespace-nowrap">Save 10+ hours weekly</span>
                  <span className="mx-3 text-gray-400" aria-hidden="true">|</span>
                  <span className="whitespace-nowrap">Ensure 100% compliance</span>
                  <span className="mx-3 text-gray-400" aria-hidden="true">|</span>
                  <span className="whitespace-nowrap">Grow effortlessly</span>
                  <div className="w-8 h-px bg-gray-300 ml-3"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-2">
              <a
                href="/book-demo"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto sm:min-w-[200px] text-sm sm:text-base"
              >
                <span>Book Your Demo</span>
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/docs/PowercaPromoters.pdf"
                download="PowercaPromoters.pdf"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto sm:min-w-[200px] text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Promoter's Perspective</span>
                <span className="sm:hidden">Promoter's Perspective</span>
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden">
          <Image
            src="/images/streamline-bg.jpg"
            alt="Streamline background"
            fill
            className="object-cover absolute inset-0"
            loading="lazy"
            quality={85}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 py-10 sm:py-12 md:py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 xl:gap-0 2xl:gap-12 items-start">
            {/* Left Content - Title - Optimized for Laptop */}
            <div className="lg:col-span-1">
              <h2 className="font-semibold leading-normal text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] text-gray-900 font-inter">
                Streamline Your Practice
              </h2>
            </div>

            {/* Center Content - Description - Optimized for Laptop */}
            <div className="lg:col-span-2">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-600 leading-relaxed font-inter">
                Power CA helps you organize and streamline your office functional areas like task management, client management, staff management, billing
                and manage all information related to your practice in an accessible in-house application.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-1 flex items-start justify-start lg:justify-end">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-inter text-sm sm:text-base w-full sm:w-auto"
              >
                Register Now
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Modules Workflow Image */}
          <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-center">
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
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-0 xl:gap-0 2xl:gap-12 items-center mb-8 sm:mb-12 lg:mb-16">
            {/* Left Content - Title - Optimized for Laptop */}
            <div className="lg:col-span-2 flex items-center lg:pr-0 xl:pr-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] font-semibold font-inter leading-normal" style={{ color: '#001525' }}>
                Important Power CA
                <br />
                Modules
              </h2>
            </div>

            {/* Center Content - Description - Optimized for Laptop */}
            <div className="lg:col-span-2 flex items-center">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-600 leading-relaxed">
                Discover the full potential of Power CA through its modules, designed to
                streamline operations, increase productivity, and empower your practice.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-1 flex items-center justify-start lg:justify-end">
              <Link
                href="/modules"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer text-sm sm:text-base w-full sm:w-auto"
              >
                All Modules
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Job Card Management - Featured Card */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-2xl text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105" style={{ backgroundColor: '#155dfc' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/job-card-icon.svg"
                  alt="Job Card Management Module Icon - Track and manage all client jobs with intuitive dashboard for CA practices"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-lg xl:text-lg 2xl:text-xl font-bold mb-2 sm:mb-3 lg:mb-4 font-inter text-white">Job Card Management</h3>
              <p className="text-blue-100 text-sm sm:text-base lg:text-sm xl:text-sm 2xl:text-base">Comprehensive job management with intuitive dashboard, advanced search, and seamless edit functions for efficient workflow control.</p>
            </div>

            {/* Costing Module */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/costing-module-icon.svg"
                  alt="Costing Module Icon - Track project costs and analyze profitability for CA practices"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-lg xl:text-lg 2xl:text-xl font-bold mb-2 sm:mb-3 lg:mb-4 font-inter" style={{ color: '#001525' }}>Costing Module</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-sm xl:text-sm 2xl:text-base">Track project costs and analyze profitability with detailed analytics.</p>
            </div>

            {/* CRM Module */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/crm-module-icon.svg"
                  alt="CRM Module Icon - Client relationship management with lead tracking and engagement analytics"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 font-inter" style={{ color: '#001525' }}>CRM Module</h3>
              <p className="text-gray-600 text-sm sm:text-base">Build stronger client relationships with integrated CRM featuring lead tracking and engagement analytics.</p>
            </div>

            {/* Clients Module */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/clients-module-icon.svg"
                  alt="Clients Module Icon - Centralized client profiles with documents and communication history"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 font-inter" style={{ color: '#001525' }}>Clients Module</h3>
              <p className="text-gray-600 text-sm sm:text-base">Centralized client management with detailed profiles, documents, and communication history.</p>
            </div>

            {/* Financial Statements */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/financial-statements-icon.svg"
                  alt="Financial Statements Module Icon - Generate balance sheets and P&L reports with real-time data"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 font-inter" style={{ color: '#001525' }}>Financial Statements</h3>
              <p className="text-gray-600 text-sm sm:text-base">Generate accurate financial statements, balance sheets, and P&L reports with real-time data.</p>
            </div>

            {/* Billing Module */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/billing-module-icon.svg"
                  alt="Billing Module Icon - Automated invoicing with GST compliance and payment tracking"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 font-inter" style={{ color: '#001525' }}>Billing Module</h3>
              <p className="text-gray-600 text-sm sm:text-base">Streamline invoicing with automated billing, payment tracking, and GST compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Start Using Power CA Today Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden py-10 sm:py-12 md:py-16 lg:py-20" style={{
          backgroundImage: 'url(/images/start-using-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
            {/* Full Width Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
              <h2 className="font-semibold font-inter text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px]" style={{ color: '#001525', lineHeight: '1.1' }}>
                Start using Power CA today!
              </h2>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-white font-medium rounded-full hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer text-sm sm:text-base whitespace-nowrap w-full sm:w-auto justify-center"
                style={{ backgroundColor: '#155dfc' }}
              >
                Pricing Plan
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
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
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Left Content - Title */}
            <div className="lg:col-span-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] font-semibold font-inter leading-normal" style={{ color: '#001525' }}>
                Benefits of PowerCA
              </h2>
            </div>

            {/* Right Content - Description */}
            <div className="lg:col-span-6">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-600 leading-relaxed">
                Discover how PowerCA streamlines audit-firm operations, automates administrative tasks, and enhances service quality with built-in best practices, digital workflows, and powerful reporting tools.
              </p>
            </div>
          </div>

          {/* Benefits Accordion Component */}
          <div className="mt-6 sm:mt-8">
            <BenefitsAccordion />
          </div>
        </div>
      </section>

      {/* PowerCA Overview Carousel Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden py-10 sm:py-12 md:py-16 lg:py-20" style={{
          backgroundImage: 'url(/images/glance-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] font-semibold font-inter leading-normal text-center" style={{ color: '#001525' }}>
                PowerCA at a Glance
              </h2>
            </div>
          </div>

          <div className="px-3 sm:px-4 lg:px-5 relative z-10">
            <OverviewCarousel />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <TestimonialsSection />
        </div>
      </section>

      {/* Client-Server Background Section */}
      <section className="px-3 sm:px-4 md:px-6 lg:px-6 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden py-10 sm:py-12 md:py-14 lg:py-16" style={{
          backgroundImage: 'url(/images/client-server-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
            <div className="grid lg:grid-cols-12 gap-1 sm:gap-2 lg:gap-0 xl:gap-0 2xl:gap-8 items-center">
              {/* Left Content - Title */}
              <div className="lg:col-span-4 flex items-center lg:pr-0 xl:pr-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] font-semibold font-inter leading-normal" style={{ color: '#001525' }}>
                  Client - Server Model
                </h2>
              </div>

              {/* Center Content - Description */}
              <div className="lg:col-span-5 flex items-center">
                <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-600 leading-relaxed">
                  Efficient Communication, Centralized Data Management, and Seamless Interaction.
                </p>
              </div>

              {/* Right Content - Book Demo Button */}
              <div className="lg:col-span-3 flex items-center justify-start lg:justify-end">
                <Link
                  href="/book-demo"
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  Book Demo
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Three Content Grid - Equal Spans */}
            <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-8 mt-8 sm:mt-12 lg:mt-16">
              {/* Left Content - Description */}
              <div className="lg:col-span-4">
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Our Power CA software product operates on a client-server model, wherein the system is divided into two main components: the client and the server.
                  </p>

                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    The server hosts the core functionalities and data, managing requests from clients and executing operations. Clients, which can be desktop applications interact with the server to access these functionalities. Through communication over a network using protocols like HTTP or TCP/IP, SMTP, clients send requests to the server, which responds accordingly, managing data integrity, security, and concurrency.
                  </p>

                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Our software ensures scalability and robust security measures, providing users with efficient access to centralized data and functionalities while maintaining a secure and reliable environment for collaborative use.
                  </p>
                </div>
              </div>

              {/* Center Content - Features List */}
              <div className="lg:col-span-4 py-2 sm:py-4">
                <div className="space-y-4 sm:space-y-6">
                  {/* Regulatory compliance */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/regulatory-compliance-icon.png"
                        alt="Regulatory Compliance Icon - Ensure tax and GST compliance for CA practices in India"
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        loading="lazy"
                        sizes="40px"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Regulatory compliance</h3>
                  </div>

                  {/* Dashed Line */}
                  <div className="border-t-2 border-dashed" style={{ borderColor: '#B6C9F3' }}></div>

                  {/* Real Time Analysis */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/real-time-analysis-icon.png"
                        alt="Real-Time Analysis Icon - Live data analytics and reporting for CA firms"
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        loading="lazy"
                        sizes="40px"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Real Time Analysis</h3>
                  </div>

                  {/* Dashed Line */}
                  <div className="border-t-2 border-dashed" style={{ borderColor: '#B6C9F3' }}></div>

                  {/* Data Security */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/data-security-icon.png"
                        alt="Data Security Icon - Secure client data protection with encryption for CA practices"
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        loading="lazy"
                        sizes="40px"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Data Security</h3>
                  </div>

                  {/* Dashed Line */}
                  <div className="border-t-2 border-dashed" style={{ borderColor: '#B6C9F3' }}></div>

                  {/* 24/7 Dedicated Support */}
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/247-dedicated-support-icon.png"
                        alt="24/7 Dedicated Support Icon - Round-the-clock technical support for PowerCA users"
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        loading="lazy"
                        sizes="40px"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">24/7 Dedicated Support</h3>
                  </div>
                </div>
              </div>

              {/* Right Content - Server Network Diagram */}
              <div className="lg:col-span-4 flex justify-center mt-6 lg:mt-0">
                <div className="max-w-lg w-full">
                  <Image
                    src="/images/server-network-diagram.png"
                    alt="PowerCA Client-Server Network Architecture Diagram - Secure cloud-based practice management system for CA firms"
                    width={600}
                    height={600}
                    className="w-full h-auto rounded-2xl"
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
        title="Frequently Asked Questions About PowerCA"
        description="Get answers to common questions about PowerCA practice management software"
        faqs={powerCAFAQs}
        className="bg-white"
      />
    </div>
    </>
  )
}