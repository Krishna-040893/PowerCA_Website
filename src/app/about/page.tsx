'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState, useEffect, useRef  } from 'react'

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Team members data - flat array of all members
  const allTeamMembers = [
    { name: 'Arul Maniam TS', role: 'Founder', category: 'founder', image: '/images/team/arul-maniam-ca.jpg', initials: 'AM' },
    { name: 'Karthikeyan R', role: 'Manager', category: 'manager', image: '/images/team/karthikeyan-r.jpg', initials: 'KR' },
    { name: 'Thirunavukkarasu M', role: 'Manager', category: 'manager', image: '/images/team/thirunavukkarasu.jpg', initials: 'TM' },
    { name: 'Jagadeeswari M', role: 'Admin', category: 'admin', image: null, initials: 'JM' },
    { name: 'Mansur Ali B', role: 'Developer', category: 'developers', image: '/images/team/mansur-ali-b.jpg', initials: 'MA' },
    { name: 'Maheshwari R', role: 'Developer', category: 'developers', image: '/images/team/maheshwari-r.jpg', initials: 'MW' },
    { name: 'Vanithamani D', role: 'Developer', category: 'developers', image: '/images/team/vanithamani-d.jpg', initials: 'VD' },
    { name: 'Karthikeyan G', role: 'Web Designer', category: 'webdesigner', image: '/images/team/karthikeyan-g.jpg', initials: 'KG' },
    { name: 'Nikila R', role: 'Web Designer', category: 'webdesigner', image: null, initials: 'NR' },
    { name: 'Ramajayanthi G', role: 'Customer Support', category: 'customersupport', image: null, initials: 'RG' },
    { name: 'Kaleeswari K', role: 'Testing', category: 'testing', image: null, initials: 'KK' },
    { name: 'Satheeshkumar K', role: 'DBA', category: 'dba', image: null, initials: 'SK' }
  ]

  // Filter categories
  const filterCategories = [
    { value: 'all', label: 'All' },
    { value: 'founder', label: 'Founder' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'webdesigner', label: 'Web Designer' },
    { value: 'testing', label: 'Testing' },
    { value: 'customersupport', label: 'Coustomer Support' },
    { value: 'dba', label: 'DBA' }
  ]

  // Filter members based on selected category
  const filteredMembers = selectedFilter === 'all'
    ? allTeamMembers
    : allTeamMembers.filter(member => member.category === selectedFilter)

  // Desktop: 5 members per slide
  const membersPerSlide = 5
  const totalSlides = Math.max(1, filteredMembers.length - membersPerSlide + 1)

  // Mobile: 2 members per slide
  const membersPerMobileSlide = 2
  const totalMobileSlides = Math.ceil(filteredMembers.length / membersPerMobileSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const nextMobileSlide = () => {
    setCurrentMobileSlide((prev) => (prev + 1) % totalMobileSlides)
  }

  const prevMobileSlide = () => {
    setCurrentMobileSlide((prev) => (prev - 1 + totalMobileSlides) % totalMobileSlides)
  }

  const goToMobileSlide = (index: number) => {
    setCurrentMobileSlide(index)
  }

  const getVisibleMembers = () => {
    return filteredMembers.slice(currentSlide, currentSlide + membersPerSlide)
  }

  const getVisibleMobileMembers = () => {
    const startIndex = currentMobileSlide * membersPerMobileSlide
    return filteredMembers.slice(startIndex, startIndex + membersPerMobileSlide)
  }

  const handleFilterChange = (category: string) => {
    setSelectedFilter(category)
    setCurrentSlide(0) // Reset to first slide when filter changes
    setCurrentMobileSlide(0) // Reset mobile slide too
    setIsFilterOpen(false)
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-14 md:py-16 lg:py-[60px] flex items-center justify-center overflow-hidden bg-white">
        {/* Background image with responsive padding */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-12">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: `url('/images/about-hero-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Efficiency. Accuracy. PowerCA.
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 px-2">
              Explore Power CA –
              <br />
              <span className="text-blue-600">Built by a Team of Passionate Experts</span>
            </h1>

            {/* Description */}
            <div className="mb-8 sm:mb-10 lg:mb-12 max-w-5xl mx-auto">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mb-4 px-2">
                Power CA is created by experienced professionals to simplify practice management and deliver reliable, efficient tools for your day-to-day work.
              </p>
            </div>

            {/* Call to Action Button */}
            <div className="flex justify-center px-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
              >
                <span>Visit Our Main Site</span>
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Elevate your practice to the next level with PowerCA */}
      <section className="pt-10 sm:pt-12 md:pt-16 lg:pt-20 pb-6 sm:pb-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Left Content - Title */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold leading-normal font-inter text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-gray-900">
                Elevate your practice to the next level with PowerCA
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-1">
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Power CA was developed by CA Arul Maniam as a passion project to streamline the administrative tasks for his CA firm.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-1 flex items-start justify-start lg:justify-end">
              <Link
                href="/modules"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
              >
                All Modules
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="pt-6 sm:pt-8 pb-10 sm:pb-12 md:pb-16 lg:pb-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 items-center">
            {/* Left - Image */}
            <div className="lg:col-span-2">
              <Image
                src="/images/about-mask-group.png"
                alt="PowerCA Team"
                width={500}
                height={300}
                className="w-full h-auto max-w-full sm:max-w-md rounded-2xl shadow-lg"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
            </div>

            {/* Right - Text */}
              <div className="lg:col-span-3">
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
                The concept for this software was envisioned over two decades ago, inspired by the need to bring structure and efficiency to professional audit practices. For years the idea matured through research, real-world experience, and continuous refinement. Advancements in technology have now made it possible to deliver the full vision as a robust, cloud-ready solution. In 2025, we proudly launch it for practicing professionals, turning a long-standing dream into a practical, modern reality.
              </p>

              {/* Testimonial Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
                <blockquote className="text-blue-700 text-base sm:text-lg font-medium mb-3 sm:mb-4">
                  "Power CA has helped me streamline my practice, increasing its efficiency and productivity."
                </blockquote>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold text-sm sm:text-base">CA Arul Maniam</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Practicing Chartered Accountant</p>
                  </div>
                </div>
              </div>

              {/* Contact Sales Team */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Contact our sales team</h3>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/karthikeyan-profile.png"
                      alt="Karthikeyan R"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-base sm:text-lg">
                      Karthikeyan R - <span className="text-gray-600 font-normal">Manager</span>
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">+91 98423 24635</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Members */}
      <section className="relative py-10 sm:py-12 md:py-14 lg:py-16 bg-white overflow-hidden">
        {/* Background image with responsive padding */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-12">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: `url('/images/team-members-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header - Responsive Layout */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            {/* Title and Description - Stacked until xl breakpoint */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Left - Title */}
              <div className="pl-4 sm:pl-8 lg:pl-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-tight">
                  Our Team Members
                </h2>
              </div>

              {/* Right - Description */}
              <div className="xl:flex xl:items-start pl-4 sm:pl-0">
                <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
                  Efficient Communication, Centralized Data Management, and Seamless Interaction.
                </p>
              </div>
            </div>

            {/* Filter Button - Right-aligned with spacing */}
            <div className="flex justify-end relative pr-4 sm:pr-8 lg:pr-12" ref={filterRef}>
              <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                >
                  {filterCategories.find(cat => cat.value === selectedFilter)?.label || 'Filter'}
                  <svg
                    className={`ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full sm:w-56 lg:w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                    {filterCategories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleFilterChange(category.value)}
                        className={`w-full text-left px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${
                          selectedFilter === category.value
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          {/* Team Members Carousel - Mobile View (Hidden on SM and up) */}
          <div className="sm:hidden relative overflow-hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {getVisibleMobileMembers().map((member, index) => {
                const gradients = [
                  'from-purple-100 to-pink-100',
                  'from-green-100 to-teal-100',
                  'from-blue-100 to-indigo-100',
                  'from-yellow-100 to-orange-100'
                ]
                return (
                  <div
                    key={`mobile-${currentMobileSlide}-${index}`}
                    className="bg-white rounded-2xl p-3 border border-gray-200 hover:shadow-lg transition-all duration-500 ease-in-out transform flex flex-col"
                    style={{
                      animation: 'slideInFromRight 0.5s ease-out'
                    }}
                  >
                    <div className={`w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-gray-600 text-xl font-medium">{member.initials}</div>
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-gray-500 text-xs">{member.role}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team Members Carousel - Desktop View (Hidden on mobile) */}
          <div className="hidden sm:block relative overflow-hidden mb-6 sm:mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {getVisibleMembers().map((member, index) => {
                const gradients = [
                  'from-purple-100 to-pink-100',
                  'from-green-100 to-teal-100',
                  'from-blue-100 to-indigo-100',
                  'from-yellow-100 to-orange-100'
                ]
                return (
                  <div
                    key={`desktop-${currentSlide}-${index}`}
                    className="bg-white rounded-2xl p-2 sm:p-3 md:p-4 border border-gray-200 hover:shadow-lg transition-all duration-500 ease-in-out transform"
                    style={{
                      animation: 'slideInFromRight 0.5s ease-out'
                    }}
                  >
                    <div className={`w-full aspect-square rounded-xl overflow-hidden mb-2 sm:mb-3 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-gray-600 text-xl sm:text-2xl font-medium">{member.initials}</div>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-gray-500 text-xs">{member.role}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add keyframe animation styles */}
          <style jsx>{`
            @keyframes slideInFromRight {
              0% {
                opacity: 0;
                transform: translateX(30px);
              }
              100% {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>

          {/* Mobile Carousel Controls - Pagination Left, Arrows Right */}
          <div className="sm:hidden flex justify-between items-center">
            {/* Pagination Dots - Left */}
            <div className="flex gap-1.5" role="tablist" aria-label="Team member navigation">
              {Array.from({ length: totalMobileSlides }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToMobileSlide(index)}
                  aria-label={`Show team member slide ${index + 1}`}
                  aria-pressed={index === currentMobileSlide}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMobileSlide ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons - Right */}
            <div className="flex gap-3">
              <button
                type="button"
                aria-label="Show previous team members"
                title="Show previous team members"
                onClick={prevMobileSlide}
                className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Show next team members"
                title="Show next team members"
                onClick={nextMobileSlide}
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Carousel Controls - Centered Pagination with Arrows */}
          <div className="hidden sm:grid mt-6 sm:mt-8 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
            <div />
            <div className="flex justify-center space-x-1.5 sm:space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600'
                      : 'w-2 h-2 sm:w-2 sm:h-2 bg-gray-300 opacity-80'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pr-4 sm:pr-8 lg:pr-12">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 bg-white flex items-center justify-center transition-colors ${
                  currentSlide === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlide >= totalSlides - 1}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                  currentSlide >= totalSlides - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission, Vision & Values Section */}
      <section className="py-10 sm:py-12 md:py-14 lg:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Left - Title */}
            <div className="lg:col-span-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-900 leading-normal">
                Our Mission, Vision & Values
              </h2>
            </div>

            {/* Center - Description */}
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed mb-3 sm:mb-4">
                We are driven by a clear purpose, a bold vision for the future, and guiding values that shape every decision we make.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed">
                Our mission defines what we do today, our vision paints the picture of tomorrow, and our core values keep us true to our principles as we innovate and grow.
              </p>
            </div>

            {/* Right - All Modules Button */}
            <div className="lg:col-span-3 flex justify-start lg:justify-end">
              <Link
                href="/modules"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
              >
                All Modules
              </Link>
            </div>
          </div>

          {/* Mission, Vision & Values Cards */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Mission Card */}
            <div className="bg-white border rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-5 lg:mb-6">
                <Image
                  src="/images/mission-icon.svg"
                  alt="Mission Icon"
                  width={32}
                  height={32}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Our Mission</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-justify">
                Develop a comprehensive and efficient practice management solution that streamlines operations, ensures compliance with regulations, prioritizes data security and privacy, promotes integration and collaboration, provides analytics and business intelligence, offers a user-friendly interface, and commits to continuous improvement and innovation in professional practice.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white border rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-5 lg:mb-6">
                <Image
                  src="/images/vision-icon.svg"
                  alt="Vision Icon"
                  width={32}
                  height={32}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Our Vision</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-justify">
                Create a revolutionizing application, transforming the way professionals manage their practice by delivering a comprehensive, user-friendly, and innovative solution that optimizes processes, ensures regulatory compliance, enables secure data management, promotes seamless collaboration, and empowers data-driven decision-making for sustainable growth and success of professionals.
              </p>
            </div>

            {/* Values Card */}
            <div className="bg-white border rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-5 lg:mb-6">
                <Image
                  src="/images/values-icon.svg"
                  alt="Values Icon"
                  width={32}
                  height={32}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Our Values</h3>
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                <p className="mb-2 sm:mb-3">Our values are</p>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li>• Customer centricity,</li>
                  <li>• Innovation,</li>
                  <li>• Integrity,</li>
                  <li>• Collaboration,</li>
                  <li>• Quality excellence,</li>
                  <li>• Adaptability,</li>
                  <li>• Empowerment,</li>
                  <li>• Social responsibility, and</li>
                  <li>• making a positive impact on the professional community.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
