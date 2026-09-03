'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'

const testimonials = [
  {
    name: 'Krishna',
    role: 'Proprietor, Krishna Biz Solutions',
    initial: 'K',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    content: 'Power CA helps monitor all my jobs, helps plan for due dates, keeps track of my billables and receivables. Using Power CA has made me more efficient and helped my practice grow.'
  },
  {
    name: 'Chitra',
    role: 'Admin, TSMA',
    initial: 'C',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    content: 'Through CRM and other modules, we are able to access all the client records when needed. When data is at your fingertips, time saved is invaluable.'
  },
  {
    name: 'Gayathri',
    role: 'Admin, TSMA',
    initial: 'G',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    content: 'We were able to efficiently track all data related to tasks including time taken for the task. This enables us to share invoices on time and track our billables. Our clients also appreciate our level of transparency.'
  },
  {
    name: 'Rajesh',
    role: 'Partner, R&Associates',
    initial: 'R',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    content: 'Power CA has transformed our practice management. The job card system and billing integration have increased our efficiency by 40%. Highly recommended for CA firms.'
  },
  {
    name: 'Priya',
    role: 'CA, Priya & Co.',
    initial: 'P',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    content: 'The compliance tracking and deadline management features are game-changers. We never miss a filing deadline anymore, and our clients appreciate the transparency.'
  },
  {
    name: 'Suresh',
    role: 'Managing Partner, Suresh Associates',
    initial: 'S',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    content: 'Power CA\'s document management and staff collaboration features have streamlined our entire workflow. Our team productivity has increased significantly.'
  }
]

export interface TestimonialsCarouselRef {
  nextTestimonial: () => void
  prevTestimonial: () => void
  currentTestimonial: number
  totalTestimonials: number
}

export const TestimonialsCarousel = forwardRef<TestimonialsCarouselRef, object>((props, ref) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  useImperativeHandle(ref, () => ({
    nextTestimonial,
    prevTestimonial,
    currentTestimonial,
    totalTestimonials: testimonials.length
  }))

  // Show 3 testimonials at once
  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentTestimonial + i) % testimonials.length
      visible.push(testimonials[index])
    }
    return visible
  }

  const visibleTestimonials = getVisibleTestimonials()

  return (
    <div className="relative">
      {/* Testimonial Cards - Grid of 3 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {visibleTestimonials.map((testimonial, index) => (
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
      <div className="flex justify-center space-x-2">
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
  )
})

TestimonialsCarousel.displayName = 'TestimonialsCarousel'