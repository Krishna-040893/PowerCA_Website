'use client'

import { useRef } from 'react'
import { TestimonialsCarousel, TestimonialsCarouselRef } from './testimonials-carousel'

export function TestimonialsSection() {
  const testimonialsRef = useRef<TestimonialsCarouselRef>(null)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-16">
          {/* Left Content - Title */}
          <div className="lg:col-span-5">
            <h2 className="text-4xl md:text-5xl font-semibold font-inter leading-tight text-gray-900">
              What Practicing Chartered Accountants Say
            </h2>
          </div>

          {/* Center Content - Description */}
          <div className="lg:col-span-5">
            <p className="text-lg text-gray-600 leading-relaxed">
              Don't just take our word for it. Here's what our clients have to say about Power CA.
            </p>
          </div>

          {/* Right Content - Navigation Arrows */}
          <div className="lg:col-span-2 flex justify-end space-x-3">
            <button
              onClick={() => testimonialsRef.current?.prevTestimonial()}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-all duration-200 bg-white"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => testimonialsRef.current?.nextTestimonial()}
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-sm"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Testimonial Carousel Component */}
        <div className="max-w-full">
          <TestimonialsCarousel ref={testimonialsRef} />
        </div>
      </div>
    </section>
  )
}