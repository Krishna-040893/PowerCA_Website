'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/home/section-header'

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
      {/* Shared centred header, same as the other homepage sections. */}
      <div className="mb-6 sm:mb-12 lg:mb-16">
        <SectionHeader
          title="What Practicing Chartered"
          emphasis="Accountants Say"
          trailing="!"
          description="Don't just take our word for it. Here's what our clients have to say about PowerCA."
        />
      </div>

      {/* Desktop/Tablet Testimonial Cards - Hidden on Mobile */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 mr-3 sm:mr-4 flex items-center justify-center text-blue-600 font-semibold text-sm sm:text-base">
                {testimonial.initial}
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-[#001525] font-inter">{testimonial.name}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">{testimonial.title}, {testimonial.company}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 font-inter">
              {testimonial.content}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile Single Testimonial Card - Only on Mobile */}
      <div className="sm:hidden mb-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 mr-3 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {testimonials[currentMobileIndex].initial}
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#001525] font-inter">{testimonials[currentMobileIndex].name}</h3>
              <p className="text-gray-500 text-xs">{testimonials[currentMobileIndex].title}, {testimonials[currentMobileIndex].company}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-500 font-inter">
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