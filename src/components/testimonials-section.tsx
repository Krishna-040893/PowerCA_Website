'use client'

import { useState } from 'react'

interface Testimonial {
  name: string
  title: string
  company: string
  content: string
  initial: string
}

const testimonialSets: Testimonial[][] = [
  [
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
  ],
  [
    {
      name: "Rajesh Kumar",
      title: "Managing Partner",
      company: "Kumar & Associates",
      content: "PowerCA has transformed our client management process. The automated reminders and deadline tracking have helped us never miss a compliance date. Our firm's productivity has increased by 40%.",
      initial: "R"
    },
    {
      name: "Priya Sharma",
      title: "Senior CA",
      company: "Sharma Tax Consultancy",
      content: "The billing module is exceptional. GST calculations are automated and accurate. We've reduced our billing time by 60% and improved cash flow with automated payment reminders.",
      initial: "P"
    },
    {
      name: "Ankit Mehta",
      title: "Tax Partner",
      company: "Mehta Financial Services",
      content: "Document management has never been easier. Our team can collaborate seamlessly, and clients appreciate the transparency. PowerCA is essential for modern CA practices.",
      initial: "A"
    }
  ],
  [
    {
      name: "Neha Gupta",
      title: "Director",
      company: "Gupta Chartered Accountants",
      content: "The affiliate system has opened new revenue streams for our practice. Commission tracking is transparent and payments are timely. It's been a game-changer for our business growth.",
      initial: "N"
    },
    {
      name: "Sanjay Patel",
      title: "Managing Director",
      company: "Patel & Co",
      content: "Task management across our team of 15 CAs is now effortless. Project tracking, time logging, and team assignments are all centralized. Our operational efficiency has improved dramatically.",
      initial: "S"
    },
    {
      name: "Kavya Reddy",
      title: "Principal CA",
      company: "Reddy Associates",
      content: "The admin dashboard provides real-time insights into our practice performance. From revenue tracking to client satisfaction metrics, everything is at our fingertips.",
      initial: "K"
    }
  ]
]

// Flatten all testimonials for mobile view
const allTestimonials = testimonialSets.flat()

export default function TestimonialsSection() {
  const [currentSet, setCurrentSet] = useState(0)
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0)

  const nextSet = () => {
    setCurrentSet((prev) => (prev + 1) % testimonialSets.length)
  }

  const prevSet = () => {
    setCurrentSet((prev) => (prev - 1 + testimonialSets.length) % testimonialSets.length)
  }

  const goToSet = (index: number) => {
    setCurrentSet(index)
  }

  // Mobile navigation functions
  const nextMobile = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % allTestimonials.length)
  }

  const prevMobile = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + allTestimonials.length) % allTestimonials.length)
  }

  const goToMobile = (index: number) => {
    setCurrentMobileIndex(index)
  }

  return (
    <div>
      {/* Desktop/Tablet Header - Hidden on Mobile */}
      <div className="hidden sm:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center mb-8 sm:mb-12 lg:mb-16">
        {/* Left Content - Title */}
        <div className="lg:col-span-5">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold font-inter leading-tight" style={{ color: '#001525' }}>
            What Practicing Chartered Accountants Say!
          </h2>
        </div>

        {/* Center Content - Description */}
        <div className="lg:col-span-5">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
            Don't just take our word for it. Here's what our clients have to say about PowerCA.
          </p>
        </div>

        {/* Right Content - Navigation Buttons */}
        <div className="lg:col-span-2 flex justify-start lg:justify-end gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Show previous testimonial set"
            title="Show previous testimonial set"
            onClick={prevSet}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Show next testimonial set"
            title="Show next testimonial set"
            onClick={nextSet}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
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
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
        {testimonialSets[currentSet].map((testimonial, index) => (
          <div key={`${currentSet}-${index}`} className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-gray-100 shadow-sm">
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
              {allTestimonials[currentMobileIndex].initial}
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900">{allTestimonials[currentMobileIndex].name}</h3>
              <p className="text-gray-500 text-xs">{allTestimonials[currentMobileIndex].title}, {allTestimonials[currentMobileIndex].company}</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed text-sm">
            {allTestimonials[currentMobileIndex].content}
          </p>
        </div>
      </div>

      {/* Mobile Navigation - Pagination Left, Arrows Right */}
      <div className="sm:hidden flex justify-between items-center">
        {/* Pagination Dots - Left */}
        <div className="flex gap-1.5" role="tablist" aria-label="Testimonial navigation">
          {allTestimonials.map((_, index) => (
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

      {/* Desktop/Tablet Pagination Dots - Centered */}
      <div className="hidden sm:flex justify-center gap-2" role="tablist" aria-label="Testimonial groups">
        {testimonialSets.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSet(index)}
            aria-label={`Show testimonial set ${index + 1}`}
            aria-pressed={index === currentSet}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
              index === currentSet ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}