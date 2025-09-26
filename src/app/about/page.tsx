'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useState, useEffect, useRef  } from 'react'

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
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
    { name: 'Karthikeyan R', role: 'Manager', category: 'manager', image: '/images/karthikeyan-profile.png', initials: 'KR' },
    { name: 'thirunavukkarasu M', role: 'Manager', category: 'manager', image: null, initials: 'TM' },
    { name: 'Sangeetha P', role: 'Developer', category: 'developers', image: null, initials: 'SP' },
    { name: 'Mansur Ali B', role: 'Developer', category: 'developers', image: null, initials: 'MA' },
    { name: 'John Doe', role: 'CEO', category: 'ceo', image: null, initials: 'JD' },
    { name: 'Jane Smith', role: 'Partner', category: 'partners', image: null, initials: 'JS' },
    { name: 'Mike Wilson', role: 'Admin', category: 'admin', image: null, initials: 'MW' },
    { name: 'Sarah Connor', role: 'Tester', category: 'testing', image: null, initials: 'SC' },
    { name: 'Alex Johnson', role: 'Designer', category: 'designers', image: null, initials: 'AJ' },
    { name: 'Lisa Brown', role: 'Partner', category: 'partners', image: null, initials: 'LB' }
  ]

  // Filter categories
  const filterCategories = [
    { value: 'all', label: 'All' },
    { value: 'ceo', label: 'CEO' },
    { value: 'partners', label: 'Partners' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'developers', label: 'Developers' },
    { value: 'testing', label: 'Testing' },
    { value: 'designers', label: 'Designers' }
  ]

  // Filter members based on selected category
  const filteredMembers = selectedFilter === 'all'
    ? allTeamMembers
    : allTeamMembers.filter(member => member.category === selectedFilter)

  const membersPerSlide = 4
  const totalSlides = Math.max(1, filteredMembers.length - membersPerSlide + 1)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const getVisibleMembers = () => {
    return filteredMembers.slice(currentSlide, currentSlide + membersPerSlide)
  }

  const handleFilterChange = (category: string) => {
    setSelectedFilter(category)
    setCurrentSlide(0) // Reset to first slide when filter changes
    setIsFilterOpen(false)
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-[60px] flex items-center justify-center overflow-hidden bg-white">
        {/* Background image with 48px padding */}
        <div className="absolute inset-0 px-12">
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

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center px-6 py-3 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Efficiency. Accuracy. PowerCA.
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-8">
              Explore Power CA –
              <br />
              <span className="text-blue-600">Built by a Team of Passionate Experts</span>
            </h1>

            {/* Description */}
            <div className="mb-12 max-w-5xl mx-auto">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-4">
                Power CA is created by experienced professionals to simplify practice management and deliver reliable, efficient tools for your day-to-day work.
              </p>
            </div>

            {/* Call to Action Button */}
            <div className="flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Visit Our Main Site</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Elevate your practice to the next level with PowerCA */}
      <section className="pt-20 pb-8 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-12 items-start">
            {/* Left Content - Title */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold leading-tight font-inter text-4xl md:text-5xl text-gray-900">
                Elevate your practice to the next level with PowerCA
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-1">
              <p className="text-lg text-gray-600 leading-relaxed">
                Power CA was developed by CA Arul Maniam as a passion project to streamline the administrative tasks for his CA firm.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-1 flex items-start justify-start lg:justify-end">
              <button className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                All Modules
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="pt-8 pb-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left - Image */}
            <div className="lg:col-span-2 ">
              <Image
                src="/images/about-mask-group.png"
                alt="PowerCA Team"
                width={500}
                height={300}
                className="w-full h-auto max-w-full sm:max-w-md rounded-lg shadow-lg"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
            </div>

            {/* Right - Text */}
              <div className="lg:col-span-3">
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                The concept for this software was envisioned over two decades ago, inspired by the need to bring structure and efficiency to professional audit practices. For years the idea matured through research, real-world experience, and continuous refinement. Advancements in technology have now made it possible to deliver the full vision as a robust, cloud-ready solution. In 2025, we proudly launch it for practicing professionals, turning a long-standing dream into a practical, modern reality.
              </p>

              {/* Testimonial Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <blockquote className="text-blue-700 text-lg font-medium mb-4">
                  "Power CA has helped me streamline my practice, increasing its efficiency and productivity."
                </blockquote>
                <div className="flex items-center">
                  <div>
                    <p className="text-gray-900 font-semibold text-base">CA Arul Maniam</p>
                    <p className="text-gray-600 text-sm">Practicing Chartered Accountant</p>
                  </div>
                </div>
              </div>

              {/* Contact Sales Team */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact our sales team</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/karthikeyan-profile.png"
                      alt="Karthikeyan R"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-lg">
                      Karthikeyan R - <span className="text-gray-600 font-normal">Manager</span>
                    </p>
                    <p className="text-gray-700 text-base">+91 98423 24635</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Members */}
      <section className="relative py-16 bg-white overflow-hidden">
        {/* Background image with 48px padding */}
        <div className="absolute inset-0 px-12">
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

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center mb-16">
              {/* Left - Title */}
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">
                  Our Team Members
                </h2>
              </div>

              {/* Center - Description */}
              <div className="lg:col-span-4">
                <p className="text-lg text-gray-500 leading-relaxed">
                  Efficient Communication, Centralized Data Management, and Seamless Interaction.
                </p>
              </div>

              {/* Right - Filter Button */}
              <div className="lg:col-span-3 flex justify-start lg:justify-end relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {filterCategories.find(cat => cat.value === selectedFilter)?.label || 'Filter'}
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    {filterCategories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleFilterChange(category.value)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
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

          {/* Header with Navigation */}
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-semibold text-gray-900">All Members</h3>
            <div className="flex space-x-3">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`w-12 h-12 rounded-full border border-gray-300 bg-white flex items-center justify-center transition-colors ${
                  currentSlide === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide >= totalSlides - 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  currentSlide >= totalSlides - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Team Members Carousel */}
          <div className="relative overflow-hidden mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getVisibleMembers().map((member, index) => {
                const gradients = [
                  'from-purple-100 to-pink-100',
                  'from-green-100 to-teal-100',
                  'from-blue-100 to-indigo-100',
                  'from-yellow-100 to-orange-100'
                ]
                return (
                  <div
                    key={`${currentSlide}-${index}`}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-500 ease-in-out transform"
                    style={{
                      animation: 'slideInFromRight 0.5s ease-out'
                    }}
                  >
                    <div className={`w-full h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={200}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-gray-600 text-lg font-medium">{member.initials}</div>
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
                    <p className="text-gray-500 text-sm">{member.role}</p>
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

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission, Vision & Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left - Title */}
            <div className="lg:col-span-4">
              <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
                Our Mission, Vision & Values
              </h2>
            </div>

            {/* Center - Description */}
            <div className="lg:col-span-5">
              <p className="text-lg text-gray-500 leading-relaxed mb-4">
                We are driven by a clear purpose, a bold vision for the future, and guiding values that shape every decision we make.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                Our mission defines what we do today, our vision paints the picture of tomorrow, and our core values keep us true to our principles as we innovate and grow.
              </p>
            </div>

            {/* Right - All Modules Button */}
            <div className="lg:col-span-3 flex justify-start lg:justify-end">
              <button className="inline-flex items-center justify-center pl-6 pr-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                All Modules
              </button>
            </div>
          </div>

          {/* Mission, Vision & Values Cards */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {/* Mission Card */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Image
                  src="/images/mission-icon.svg"
                  alt="Mission Icon"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                Develop a comprehensive and efficient practice management solution that streamlines operations, ensures compliance with regulations, prioritizes data security and privacy, promotes integration and collaboration, provides analytics and business intelligence, offers a user-friendly interface, and commits to continuous improvement and innovation in professional practice.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Image
                  src="/images/vision-icon.svg"
                  alt="Vision Icon"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                Create a revolutionizing application, transforming the way professionals manage their practice by delivering a comprehensive, user-friendly, and innovative solution that optimizes processes, ensures regulatory compliance, enables secure data management, promotes seamless collaboration, and empowers data-driven decision-making for sustainable growth and success of professionals.
              </p>
            </div>

            {/* Values Card */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-lg transition-shadow" style={{ borderColor: '#B6C9F3' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Image
                  src="/images/values-icon.svg"
                  alt="Values Icon"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
              <div className="text-gray-600 leading-relaxed">
                <p className="mb-3">Our values are</p>
                <ul className="space-y-2">
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