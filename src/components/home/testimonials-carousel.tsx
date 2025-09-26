'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    name: 'Krishna',
    role: 'Proprietor, Krishna Biz Solutions',
    initial: 'K',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    content: 'Power CA helps monitor all my jobs, helps plan for due dates, keeps track of my billables and receivables. Using PowerCA has made me more efficient and helped my practice grow.'
  },
  {
    name: 'Chitra',
    role: 'Admin, ISMA UDT',
    initial: 'C',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    content: 'Through CRM and other modules, we are able to access all the client records when needed. When data is at your fingertips, time saved is invaluable.'
  },
  {
    name: 'Gayathri',
    role: 'Admin, TGMA CBE',
    initial: 'G',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    content: 'We were able to efficiently track all data related to tasks including time taken for the task. This enables us to share invoices on time and track our billables. Our clients also appreciate our level of transparency.'
  }
]

export function TestimonialsCarousel() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentTestimonial]

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
          "{current.content}"
        </p>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${current.bgColor} rounded-full flex items-center justify-center`}>
            <span className={`text-xl font-semibold ${current.textColor}`}>{current.initial}</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{current.name}</div>
            <div className="text-sm text-gray-500">{current.role}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={prevTestimonial}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={nextTestimonial}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}