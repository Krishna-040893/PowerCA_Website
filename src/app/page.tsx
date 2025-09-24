"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ClientLogos } from "@/components/client-logos"
import "./testimonial-scroll.css"

export default function Home() {
  const [openBenefit, setOpenBenefit] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [currentProfession, setCurrentProfession] = useState(0)

  const professionalTitles = [
    "Chartered Accountants",
    "Company Secretaries",
    "Cost Accountants",
    "All Practice Professionals"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProfession((prev) => (prev + 1) % professionalTitles.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const benefits = [
    {
      number: "1.",
      title: "Organized Digital Workflows",
      description: "Replace manual registers with easily retrievable digital data. Job Masters, Job Cards, Checklists, and Job Plans bring discipline and efficiency to daily routines."
    },
    {
      number: "2.",
      title: "Knowledge-Driven Templates",
      description: "Convert auditor expertise into reusable, practice-oriented templates so every staff member works at peak efficiency."
    },
    {
      number: "3.",
      title: "Built-In Best Practices",
      description: "Adopt proven methods from leading audit firms—targets, weekly reviews, wrap-up checklists, service requests, and detailed job notes—for quality service and proper documentation."
    },
    {
      number: "4.",
      title: "Higher Service Value",
      description: "Present complete Job Reports to clients to improve billability and acceptance. Costing tools flag loss-making assignments and guide internal course correction."
    },
    {
      number: "5.",
      title: "Culture of Accountability",
      description: "Work diaries, task and client notes, reminders, attendance logs, and approvals foster documentation discipline and a professional work culture."
    }
  ]

  const toggleBenefit = (index: number) => {
    setOpenBenefit(openBenefit === index ? -1 : index)
  }

  const testimonials = [
    {
      name: "Rajesh Sharma",
      role: "CA & Managing Partner",
      initial: "RS",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      content: "PowerCA has transformed our practice management completely. The workflow automation and client management features have saved us hours of manual work every day."
    },
    {
      name: "Priya Kapoor",
      role: "Chartered Accountant",
      initial: "PK",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      content: "The billing module is fantastic! It handles all our GST requirements automatically and the client portal keeps everyone informed about project status."
    },
    {
      name: "Amit Mehta",
      role: "Senior Partner",
      initial: "AM",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      content: "PowerCA's reporting capabilities are impressive. We can generate comprehensive financial reports and track our practice performance in real-time."
    },
    {
      name: "Suresh Kumar",
      role: "Senior CA",
      initial: "SK",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      content: "The implementation was smooth and the support team was incredibly helpful throughout the transition. Our efficiency has improved by 40% since switching to PowerCA."
    },
    {
      name: "Neha Khanna",
      role: "Practice Manager",
      initial: "NK",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      content: "Client communication has never been easier. The portal keeps everyone updated and the automated notifications save us so much time on follow-ups."
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-[100px] flex items-center justify-center overflow-hidden bg-white">
        {/* Container with padding for the background image */}
        <div className="absolute inset-0 px-12">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: 'url(/images/hero-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Optional overlay for better text readability */}
            <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Practice Management Solution for Professionals
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
              Practice Management Solution for
              <br />
              <div className="relative h-20 overflow-hidden">
                <span
                  key={currentProfession}
                  className="absolute inset-0 text-blue-600 animate-slideDown"
                  style={{
                    animation: 'slideDown 0.6s ease-out forwards',
                    animationDelay: '0s'
                  }}
                >
                  {professionalTitles[currentProfession]}
                </span>
              </div>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
              Power CA is a robust administrative tool designed to take control and bring efficiency to your practice.
              Empower your practice by seamlessly managing your tasks, billing, documentation and other functions.
              We cordially welcome you to explore further.
            </p>

            {/* Value Proposition */}
            <div className="mb-12">
              <div className="flex items-center justify-center text-gray-500 text-sm md:text-base">
                <div className="flex items-center">
                  <div className="w-8 h-px bg-gray-300 mr-3"></div>
                  <span className="whitespace-nowrap">Save 10+ hours weekly</span>
                  <span className="mx-3 text-gray-400">•</span>
                  <span className="whitespace-nowrap">Ensure 100% compliance</span>
                  <span className="mx-3 text-gray-400">•</span>
                  <span className="whitespace-nowrap">Grow effortlessly</span>
                  <div className="w-8 h-px bg-gray-300 ml-3"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/book-demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px]"
              >
                <span>Book Your Demo</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/promoter-perspective"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
              >
                Promoter's Perspective
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <ClientLogos />

      
      {/* Streamline Your Practice - Text Only Section */}
      <section className="px-12 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden" style={{
          backgroundImage: 'url(/images/streamline-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="container mx-auto px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-4 gap-12 items-start">
            {/* Left Content - Title */}
            <div className="lg:col-span-1">
              <h2 className="font-semibold leading-tight font-inter" style={{ fontSize: '48px', width: '458px', color: '#001525' }}>
                Streamline your practice
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-2 lg:ml-30">
              <p className="text-lg text-gray-600 leading-relaxed">
                Power CA helps you organize and streamline your office functional areas like task management, client management, staff management, billing
                and manage all information related to your practice in an accessible in-house application.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-1 flex justify-start lg:justify-end">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Register Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Modules Workflow Image */}
          <div className="mt-16 flex justify-center">
            <div className="relative max-w-4xl w-full">
              <Image
                src="/images/power-ca-modules-workflow.png"
                alt="Power CA Modules Workflow"
                width={1200}
                height={800}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-start mb-16">
            {/* Left Content - Title */}
            <div className="lg:col-span-2">
              <h2 className="text-4xl md:text-5xl font-semibold font-inter leading-tight" style={{ color: '#001525' }}>
                Important Power CA
                <br />
                Modules
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-2 flex items-center">
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover the full potential of Power CA through its modules, designed to
                streamline operations, increase productivity, and empower your practice.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-1 flex items-center justify-start lg:justify-end">
              <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                All Modules
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Job Card Management - Featured Card */}
            <div className="group p-8 rounded-2xl text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105" style={{ backgroundColor: '#155dfc' }}>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/job-card-icon.svg"
                  alt="Job Card Management"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 font-inter text-white">Job Card Management</h3>
              <p className="text-blue-100">Comprehensive job management with intuitive dashboard, advanced search, and seamless edit functions for efficient workflow control.</p>
            </div>

            {/* Costing Module */}
            <div className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/costing-module-icon.svg"
                  alt="Costing Module"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 font-inter" style={{ color: '#001525' }}>Costing Module</h3>
              <p className="text-gray-600">Track project costs and analyze profitability with detailed analytics.</p>
            </div>

            {/* CRM Module */}
            <div className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/crm-module-icon.svg"
                  alt="CRM Module"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 font-inter" style={{ color: '#001525' }}>CRM Module</h3>
              <p className="text-gray-600">Build stronger client relationships with integrated CRM featuring lead tracking and engagement analytics.</p>
            </div>

            {/* Clients Module */}
            <div className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/clients-module-icon.svg"
                  alt="Clients Module"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 font-inter" style={{ color: '#001525' }}>Clients Module</h3>
              <p className="text-gray-600">Centralized client management with detailed profiles, documents, and communication history.</p>
            </div>

            {/* Financial Statements */}
            <div className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/financial-statements-icon.svg"
                  alt="Financial Statements"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 font-inter" style={{ color: '#001525' }}>Financial Statements</h3>
              <p className="text-gray-600">Generate accurate financial statements, balance sheets, and P&L reports with real-time data.</p>
            </div>

            {/* Billing Module */}
            <div className="group p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image
                  src="/images/billing-module-icon.svg"
                  alt="Billing Module"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3 font-inter" style={{ color: '#001525' }}>Billing Module</h3>
              <p className="text-gray-600">Streamline invoicing with automated billing, payment tracking, and GST compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Start Using Power CA Today Section */}
      <section className="px-12 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden py-20" style={{
          backgroundImage: 'url(/images/start-using-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Full Width Header Section */}
            <div className="flex justify-between items-center mb-16">
              <h2 className="font-semibold font-inter" style={{ color: '#001525', fontSize: '48px', lineHeight: '1.1' }}>
                Start using Power CA today!
              </h2>
              <button className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-full hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg" style={{ backgroundColor: '#155dfc' }}>
                Pricing Plan
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-16 items-start">
              {/* Left Content - 5 Steps - Wider */}
              <div className="lg:col-span-2">
                {/* Step 1 */}
                <div className="grid grid-cols-12 gap-4 items-start pb-3">
                  <div className="col-span-1">
                    <Image
                      src="/images/step-1-icon.png"
                      alt="Step 1"
                      width={56}
                      height={56}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Schedule a<br/><span className="text-blue-600">Demo</span>
                    </h3>
                  </div>
                  <div className="col-span-8">
                    <p className="text-gray-600 leading-relaxed">
                      Book a demo to test out the application for yourself.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 2 */}
                <div className="grid grid-cols-12 gap-4 items-start py-3">
                  <div className="col-span-1">
                    <Image
                      src="/images/step-2-icon.png"
                      alt="Step 2"
                      width={56}
                      height={56}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Purchase A <span className="text-blue-600">Plan</span>
                    </h3>
                  </div>
                  <div className="col-span-8">
                    <p className="text-gray-600 leading-relaxed">
                      Check out our Pricing Page through the button on the right and purchase the application based on your users.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 3 */}
                <div className="grid grid-cols-12 gap-4 items-start py-3">
                  <div className="col-span-1">
                    <Image
                      src="/images/step-3-icon.png"
                      alt="Step 3"
                      width={56}
                      height={56}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Install Power CA and<br/><span className="text-blue-600">Activate Your License</span>
                    </h3>
                  </div>
                  <div className="col-span-8">
                    <p className="text-gray-600 leading-relaxed">
                      Our Support team will get in touch with you to help you install and activate your license once the payment is complete.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 4 */}
                <div className="grid grid-cols-12 gap-4 items-start py-3">
                  <div className="col-span-1">
                    <Image
                      src="/images/step-4-icon.png"
                      alt="Step 4"
                      width={56}
                      height={56}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Import Your<br/><span className="text-blue-600">Data</span>
                    </h3>
                  </div>
                  <div className="col-span-8">
                    <p className="text-gray-600 leading-relaxed">
                      Using our default data import functionality, import all your tasks, billing, employees and client data.
                    </p>
                  </div>
                </div>

                {/* Dashed Line */}
                <div className="my-3" style={{
                  borderTop: '2px dashed #B6C9F3',
                  borderImage: 'repeating-linear-gradient(to right, #B6C9F3 0, #B6C9F3 8px, transparent 8px, transparent 16px) 1'
                }}></div>

                {/* Step 5 */}
                <div className="grid grid-cols-12 gap-4 items-start pt-3">
                  <div className="col-span-1">
                    <Image
                      src="/images/step-5-icon.png"
                      alt="Step 5"
                      width={56}
                      height={56}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-lg font-bold font-inter" style={{ color: '#001525' }}>
                      Support and<br/><span className="text-blue-600">Training</span>
                    </h3>
                  </div>
                  <div className="col-span-8">
                    <p className="text-gray-600 leading-relaxed">
                      Our Support team will help you set up the application and provide necessary training for your staff.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Professional Image */}
              <div className="lg:col-span-1 flex justify-center lg:justify-end">
                <div className="w-full max-w-lg">
                  <Image
                    src="/images/start-using-power-ca-today.jpg"
                    alt="Professional using Power CA"
                    width={500}
                    height={600}
                    className="w-full h-auto shadow-lg"
                    style={{ borderRadius: '16px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center mb-16">
            {/* Left Content - Title */}
            <div className="lg:col-span-6">
              <h2 className="text-4xl md:text-5xl font-semibold font-inter leading-tight" style={{ color: '#001525' }}>
                What Practicing Chartered
                <br />
                Accountants Say
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-4">
              <p className="text-lg text-gray-600 leading-relaxed">
                Don't just take our word for it. Here's what our clients have to say about PowerCA.
              </p>
            </div>

            {/* Right Content - Navigation Arrows */}
            <div className="lg:col-span-2 flex justify-end space-x-4">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#144fed] hover:text-[#144fed] transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full text-white flex items-center justify-center transition-colors duration-200"
                style={{ backgroundColor: '#144fed' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0f3cc9'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#144fed'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Testimonial Cards - Carousel */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(currentTestimonial, currentTestimonial + 3).concat(
              currentTestimonial + 3 > testimonials.length
                ? testimonials.slice(0, (currentTestimonial + 3) - testimonials.length)
                : []
            ).map((testimonial, index) => (
              <div key={`${currentTestimonial}-${index}`} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center mr-4`}>
                    <span className={`${testimonial.textColor} font-semibold text-lg`}>{testimonial.initial}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentTestimonial ? 'bg-[#144fed]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Client-Server Background Section */}
      <section className="px-12 relative overflow-hidden">
        <div className="relative rounded-2xl overflow-hidden py-16" style={{
          backgroundImage: 'url(/images/client-server-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Content - Title */}
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-semibold font-inter leading-tight" style={{ color: '#001525' }}>
                  Client - Server Model
                </h2>
              </div>

              {/* Center Content - Description */}
              <div className="lg:col-span-5">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Efficient Communication, Centralized Data Management, and Seamless Interaction.
                </p>
              </div>

              {/* Right Content - Book Demo Button */}
              <div className="lg:col-span-2 flex justify-end">
                <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                  Book Your Demo
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Three Content Grid - Equal Spans */}
            <div className="grid lg:grid-cols-12 gap-8 mt-16">
              {/* Left Content - Description */}
              <div className="lg:col-span-4">
                <div className="space-y-6">
                  <p className="text-gray-700 leading-relaxed">
                    Our Power CA software product operates on a client-server model, wherein the system is divided into two main components: the client and the server.
                  </p>

                  <p className="text-gray-700 leading-relaxed">
                    The server hosts the core functionalities and data, managing requests from clients and executing operations. Clients, which can be desktop applications interact with the server to access these functionalities. Through communication over a network using protocols like HTTP or TCP/IP, SMTP, clients send requests to the server, which responds accordingly, managing data integrity, security, and concurrency.
                  </p>

                  <p className="text-gray-700 leading-relaxed">
                    Our software ensures scalability and robust security measures, providing users with efficient access to centralized data and functionalities while maintaining a secure and reliable environment for collaborative use.
                  </p>
                </div>
              </div>

              {/* Center Content - Features List */}
              <div className="lg:col-span-4 py-4">
                <div className="space-y-6">
                  {/* Regulatory compliance */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/regulatory-compliance-icon.png"
                        alt="Regulatory compliance"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Regulatory compliance</h3>
                  </div>

                  {/* Dashed Line */}
                  <div className="border-t-2 border-dashed" style={{ borderColor: '#B6C9F3' }}></div>

                  {/* Real Time Analysis */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/real-time-analysis-icon.png"
                        alt="Real Time Analysis"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Real Time Analysis</h3>
                  </div>

                  {/* Dashed Line */}
                  <div className="border-t-2 border-dashed" style={{ borderColor: '#B6C9F3' }}></div>

                  {/* Data Security */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/data-security-icon.png"
                        alt="Data Security"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Data Security</h3>
                  </div>

                  {/* Dashed Line */}
                  <div className="border-t-2 border-dashed" style={{ borderColor: '#B6C9F3' }}></div>

                  {/* 24/7 Dedicated Support */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/images/247-dedicated-support-icon.png"
                        alt="24/7 Dedicated Support"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">24/7 Dedicated Support</h3>
                  </div>
                </div>
              </div>

              {/* Right Content - Server Network Diagram */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="max-w-lg">
                  <Image
                    src="/images/server-network-diagram.png"
                    alt="Server Network Diagram"
                    width={600}
                    height={600}
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content - Title */}
            <div className="lg:col-span-6">
              <h2 className="text-4xl md:text-5xl font-semibold font-inter leading-tight" style={{ color: '#001525' }}>
                Benefits of PowerCA
              </h2>
            </div>

            {/* Right Content - Description */}
            <div className="lg:col-span-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover how PowerCA streamlines audit-firm operations, automates administrative tasks, and enhances service quality with built-in best practices, digital workflows, and powerful reporting tools.
              </p>
            </div>
          </div>

          {/* Benefits Accordion */}
          <div className="mt-8 space-y-4">
            {benefits.map((benefit, index) => {
              const isOpen = openBenefit === index
              return (
                <div
                  key={index}
                  className={`rounded-2xl border-2 transition-all duration-500 overflow-hidden transform ${
                    isOpen
                      ? 'border-[#144fed] shadow-2xl scale-[1.02]'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                  style={isOpen ? { background: '#144fed' } : {}}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleBenefit(index)}
                    className="w-full px-8 py-6 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
                  >
                    {/* Left Content - Number and Title */}
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border`}
                      style={{
                        backgroundColor: 'white',
                        color: '#144fed',
                        borderColor: '#144fed'
                      }}>
                        {benefit.number.replace('.', '')}
                      </div>
                      <h3 className={`text-xl font-bold text-left transition-all duration-300 ${isOpen ? 'text-white' : 'text-gray-900'}`}>
                        {benefit.title}
                      </h3>
                    </div>

                    {/* Right Content - Toggle Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border"
                      style={{
                        backgroundColor: 'white',
                        borderColor: '#144fed'
                      }}>
                        <svg
                          className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                          fill="none"
                          stroke="#144fed"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <div className={`transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}>
                    {isOpen && (
                      <div className="px-8 pb-8 -mt-2">
                        <div className="w-full">
                          <p className="text-white leading-relaxed text-lg">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}