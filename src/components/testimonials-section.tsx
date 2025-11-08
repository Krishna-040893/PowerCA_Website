'use client'

import { useState } from 'react'

interface Testimonial {
  name: string
  title: string
  company: string
  content: string
  initial: string
}

const testimonials: Testimonial[] = [
  {
    name: "Krishna",
    title: "Founder",
    company: "Krishna Biz Solution",
    content: "Power CA helps monitor all my jobs, helps plan for due dates, keeps track of my billables and receivables. Using Power CA has made me more efficient and helped my practice grow.",
    initial: "K"
  },
  {
    name: "Chitra",
    title: "Admin",
    company: "TSMA UDT",
    content: "Through CRM and other modules, we are able to access all the client records when needed. When data is at your fingertips, time saved is invaluable.",
    initial: "C"
  },
  {
    name: "Gayathri",
    title: "Admin",
    company: "TSMA CBE",
    content: "We are able to efficiently track all data related to tasks including time taken for the task. This enables us to share invoices on time and track our billables. Our clients also appreciate our level of transparency.",
    initial: "G"
  }
]

export default function TestimonialsSection() {
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)

  // Mobile navigation functions
  const nextMobile = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevMobile = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToMobile = (index: number) => {
    setCurrentMobileIndex(index)
  }

  return (
    <div>
      {/* Desktop/Tablet Header - Hidden on Mobile */}
      <div className="hidden sm:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center mb-8 sm:mb-12 lg:mb-16">
        {/* Left Content - Title */}
        <div className="lg:col-span-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold font-inter leading-tight" style={{ color: '#001525' }}>
            What Practicing Chartered Accountants Say!
          </h2>
        </div>

        {/* Right Content - Description */}
        <div className="lg:col-span-6">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
            Don't just take our word for it. Here's what our clients have to say about PowerCA.
          </p>
        </div>
      </div>

      {/* Mobile Header - Only on Mobile */}
      <div className="sm:hidden mb-6">
        <h2 className="text-2xl font-semibold font-inter leading-tight mb-3" style={{ color: '#001525' }}>
          What Practicing Chartered Accountants Say!
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Don't just take our word for it. Here's what our clients have to say about PowerCA.
        </p>
      </div>

      {/* Desktop/Tablet Testimonial Cards - Hidden on Mobile */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 mr-3 sm:mr-4 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                {testimonial.initial}
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900">{testimonial.name}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">{testimonial.title}, {testimonial.company}</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {testimonial.content}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile Single Testimonial Card - Only on Mobile */}
      <div className="sm:hidden mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-white font-semibold text-sm">
              {testimonials[currentMobileIndex].initial}
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900">{testimonials[currentMobileIndex].name}</h3>
              <p className="text-gray-500 text-xs">{testimonials[currentMobileIndex].title}, {testimonials[currentMobileIndex].company}</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            {testimonials[currentMobileIndex].content}
          </p>
        </div>
      </div>

      {/* Mobile Navigation - Pagination Left, Arrows Right */}
      <div className="sm:hidden flex justify-between items-center">
        {/* Pagination Dots - Left */}
        <div className="flex gap-1.5" role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToMobile(index)}
              aria-label={`Show testimonial ${index + 1}`}
              aria-pressed={index === currentMobileIndex}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentMobileIndex ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons - Right */}
        <div className="flex gap-3">
          <button
            type="button"
            aria-label="Show previous testimonial"
            title="Show previous testimonial"
            onClick={prevMobile}
            className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Show next testimonial"
            title="Show next testimonial"
            onClick={nextMobile}
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}