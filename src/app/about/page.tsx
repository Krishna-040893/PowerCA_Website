'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  // Team data organized by departments
  const teamDepartments = [
    {
      title: 'Leadership',
      members: [
        { name: 'Arul Maniam TS', role: 'Founder & CEO', gender: 'male' },
        { name: 'Karthikeyan R', role: 'Manager', gender: 'male' },
        { name: 'Thirunavukkarasu M', role: 'Manager', gender: 'male' }
      ]
    },
    {
      title: 'Development',
      members: [
        { name: 'Mansur Ali B', role: 'Developer', gender: 'male' },
        { name: 'Maheshwari R', role: 'Developer', gender: 'female' },
        { name: 'Vanithamani D', role: 'Developer', gender: 'female' }
      ]
    },
    {
      title: 'Design & Support',
      members: [
        { name: 'Karthikeyan G', role: 'Web Designer', gender: 'male' },
        { name: 'Nikila R', role: 'Web Designer', gender: 'female' },
        { name: 'Ramajayanthi G', role: 'Customer Support', gender: 'female' }
      ]
    },
    {
      title: 'Operations',
      members: [
        { name: 'Jagadeeswari M', role: 'Admin', gender: 'female' },
        { name: 'Kaleeswari K', role: 'QA Testing', gender: 'female' },
        { name: 'Satheeshkumar K', role: 'Database Admin', gender: 'male' }
      ]
    }
  ]
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-3 sm:py-4 md:py-5 lg:py-8 flex items-center justify-center overflow-hidden bg-white">
        {/* Background image with responsive padding */}
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[2.75rem] 2xl:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8 px-2">
              Explore Power CA –
              <br />
              <span className="text-blue-600">Built by a Team of Passionate Experts</span>
            </h1>

            {/* Description */}
            <div className="mb-8 sm:mb-10 lg:mb-12 max-w-5xl mx-auto">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-xl text-gray-600 leading-relaxed mb-4 px-2">
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
      <section className="pt-4 sm:pt-5 md:pt-6 lg:pt-8 pb-6 sm:pb-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="grid lg:grid-cols-8 gap-6 sm:gap-8 lg:gap-4 xl:gap-6 2xl:gap-12 items-start">
            {/* Left Content - Title */}
            <div className="lg:col-span-3">
              <h2 className="font-semibold leading-normal font-inter text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] text-gray-900">
                Elevate your practice to the next level with PowerCA
              </h2>
            </div>

            {/* Center Content - Description */}
            <div className="lg:col-span-3">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-600 leading-relaxed">
                Power CA was developed by CA Arul Maniam as a passion project to streamline the administrative tasks for his CA firm.
              </p>
            </div>

            {/* Right Content - Button */}
            <div className="lg:col-span-2 flex items-start justify-start lg:justify-end">
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
      <section className="pt-6 sm:pt-4 pb-10 sm:pb-12 md:pb-16 lg:pb-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-6 xl:gap-8 2xl:gap-12 items-center">
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
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8">
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
        <div className="absolute inset-0 px-3 sm:px-4 md:px-6 lg:px-6">
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] font-semibold text-gray-900 leading-tight mb-4">
              Our Team Members
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              A dedicated team of professionals working together to deliver excellence in practice management solutions.
            </p>
          </div>

          {/* Team Grid by Department - 4 columns on large screens */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {teamDepartments.map((department, deptIndex) => (
              <div
                key={deptIndex}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Department Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-5 py-3">
                  <h3 className="text-white font-semibold text-sm sm:text-base">{department.title}</h3>
                </div>

                {/* Members List */}
                <div className="divide-y divide-gray-100">
                  {department.members.map((member, memberIndex) => (
                    <div
                      key={memberIndex}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      {/* Gender Avatar - Vector Illustration */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {member.gender === 'female' ? (
                          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
                            {/* Background */}
                            <circle cx="32" cy="32" r="32" fill="#FDF2F8"/>
                            {/* Hair */}
                            <path d="M16 28C16 18 22 10 32 10C42 10 48 18 48 28C48 30 47.5 32 47 34C46 36 44 38 44 42V46C44 48 43 50 41 50H23C21 50 20 48 20 46V42C20 38 18 36 17 34C16.5 32 16 30 16 28Z" fill="#5C3D2E"/>
                            {/* Face */}
                            <ellipse cx="32" cy="32" rx="12" ry="14" fill="#FDBCB4"/>
                            {/* Hair bangs */}
                            <path d="M20 24C20 20 24 14 32 14C40 14 44 20 44 24C44 26 42 28 40 28C38 28 36 24 32 24C28 24 26 28 24 28C22 28 20 26 20 24Z" fill="#5C3D2E"/>
                            {/* Eyes */}
                            <ellipse cx="27" cy="30" rx="2" ry="2.5" fill="#3D3D3D"/>
                            <ellipse cx="37" cy="30" rx="2" ry="2.5" fill="#3D3D3D"/>
                            {/* Smile */}
                            <path d="M28 38C28 38 30 41 32 41C34 41 36 38 36 38" stroke="#E57373" strokeWidth="1.5" strokeLinecap="round"/>
                            {/* Blush */}
                            <ellipse cx="24" cy="35" rx="2.5" ry="1.5" fill="#FFCDD2" opacity="0.6"/>
                            <ellipse cx="40" cy="35" rx="2.5" ry="1.5" fill="#FFCDD2" opacity="0.6"/>
                            {/* Body/Shoulders */}
                            <path d="M18 58C18 50 24 46 32 46C40 46 46 50 46 58V64H18V58Z" fill="#EC4899"/>
                          </svg>
                        ) : (
                          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
                            {/* Background */}
                            <circle cx="32" cy="32" r="32" fill="#EFF6FF"/>
                            {/* Hair */}
                            <path d="M18 26C18 18 24 12 32 12C40 12 46 18 46 26C46 28 45 30 44 30C43 30 42 28 42 26C42 20 38 16 32 16C26 16 22 20 22 26C22 28 21 30 20 30C19 30 18 28 18 26Z" fill="#4A3728"/>
                            {/* Face */}
                            <ellipse cx="32" cy="32" rx="12" ry="13" fill="#FDBCB4"/>
                            {/* Short hair top */}
                            <path d="M20 24C20 18 25 14 32 14C39 14 44 18 44 24C44 26 42 26 40 24C38 22 35 20 32 20C29 20 26 22 24 24C22 26 20 26 20 24Z" fill="#4A3728"/>
                            {/* Eyes */}
                            <ellipse cx="27" cy="30" rx="2" ry="2.5" fill="#3D3D3D"/>
                            <ellipse cx="37" cy="30" rx="2" ry="2.5" fill="#3D3D3D"/>
                            {/* Eyebrows */}
                            <path d="M24 26L29 25" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M35 25L40 26" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round"/>
                            {/* Smile */}
                            <path d="M28 38C28 38 30 40 32 40C34 40 36 38 36 38" stroke="#D4A59A" strokeWidth="1.5" strokeLinecap="round"/>
                            {/* Body/Shoulders */}
                            <path d="M18 58C18 50 24 46 32 46C40 46 46 50 46 58V64H18V58Z" fill="#3B82F6"/>
                          </svg>
                        )}
                      </div>

                      {/* Name and Role */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 font-medium text-xs sm:text-sm truncate">{member.name}</h4>
                        <p className="text-gray-500 text-xs">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Team Stats */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">12+</div>
              <div className="text-gray-500 text-xs sm:text-sm">Team Members</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">20+</div>
              <div className="text-gray-500 text-xs sm:text-sm">Years Experience</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">4</div>
              <div className="text-gray-500 text-xs sm:text-sm">Departments</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-gray-500 text-xs sm:text-sm">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission, Vision & Values Section */}
      <section className="py-10 sm:py-12 md:py-14 lg:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-4 xl:gap-6 2xl:gap-8 items-center">
            {/* Left - Title */}
            <div className="lg:col-span-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2rem] xl:text-[2rem] 2xl:text-[42px] font-semibold text-gray-900 leading-normal">
                Our Mission, Vision & Values
              </h2>
            </div>

            {/* Center - Description */}
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-500 leading-relaxed mb-3 sm:mb-4">
                We are driven by a clear purpose, a bold vision for the future, and guiding values that shape every decision we make.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-base 2xl:text-lg text-gray-500 leading-relaxed">
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
