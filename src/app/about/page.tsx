'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SectionHeader } from '@/components/home/section-header'
import { PageHero, heroButtonClass } from '@/components/layout/page-hero'
import { Reveal } from '@/components/ui/reveal'

// Illustrated avatar, shared by every member card.
function MemberAvatar({ gender }: { gender: string }) {
  return gender === 'female' ? (
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
  )
}

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
      <PageHero
        backgroundImage="/images/about-hero-bg.jpg"
        badge={{
          icon: (
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          label: 'Efficiency. Accuracy. Power CA.',
        }}
        title="Explore Power CA –"
        accent="Built by a Team of Passionate Experts"
        description="Power CA is created by experienced professionals to simplify practice management and deliver reliable, efficient tools for your day-to-day work."
      >
        <div className="flex justify-center px-2">
          <Link href="/" className={`${heroButtonClass} w-auto min-w-[220px] sm:min-w-[200px]`}>
            <span>Visit Our Main Site</span>
            <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </PageHero>

      {/* Elevate your practice to the next level with Power CA */}
      <section className="pt-7 sm:pt-10 md:pt-12 lg:pt-[60px] pb-0 bg-white bg-dot-pattern">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <SectionHeader
            title="Elevate your practice to the"
            emphasis="next level with Power CA"
            description="Power CA was developed by CA Arul Maniam as a passion project to streamline the administrative tasks for his CA firm."
            cta={{ href: '/modules', label: 'All Modules' }}
            ctaSpacing="none"
          />
        </div>
      </section>

      {/* Image Section */}
      <section className="pt-4 sm:pt-5 lg:pt-6 pb-7 sm:pb-10 md:pb-12 lg:pb-[60px] bg-white bg-dot-pattern">
        <div className="container mx-auto px-4 sm:px-6 lg:px-6">
          <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-10 xl:gap-12 items-start">
            {/* Left - Image */}
            <Reveal className="lg:col-span-2">
              <Image
                src="/images/about-mask-group.png"
                alt="Power CA Team"
                width={500}
                height={300}
                className="w-full h-auto rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-16px_rgba(16,24,40,0.18)]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
            </Reveal>

            {/* Right - Text */}
            <Reveal delay={0.05} className="lg:col-span-3">
              <p className="text-[15px] sm:text-[17px] text-gray-500 leading-relaxed mb-6 sm:mb-8">
                The concept for this software was envisioned over two decades ago, inspired by the need to bring structure and efficiency to professional audit practices. For years the idea matured through research, real-world experience, and continuous refinement. Advancements in technology have now made it possible to deliver the full vision as a robust, cloud-ready solution. In 2025, we proudly launch it for practicing professionals, turning a long-standing dream into a practical, modern reality.
              </p>

              {/* Testimonial Card */}
              <figure className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] mb-6 sm:mb-8">
                <blockquote className="text-[15px] sm:text-[17px] leading-relaxed text-[#001525]">
                  &ldquo;Power CA has helped me streamline my practice, increasing its efficiency and productivity.&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                    A
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#001525]">CA Arul Maniam</span>
                    <span className="block text-xs text-gray-500">Practicing Chartered Accountant</span>
                  </span>
                </figcaption>
              </figure>

              {/* Contact Sales Team */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]">
                <h3 className="mb-4 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Contact our sales team</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0">
                    <Image
                      src="/images/karthikeyan-profile.png"
                      alt="Karthikeyan R"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#001525] font-semibold text-base">
                      Karthikeyan R <span className="text-gray-500 font-normal">— Manager</span>
                    </p>
                    <a href="tel:+919842324635" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      +91 98423 24635
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Our Team Members */}
      <section className="relative py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white bg-dot-pattern overflow-hidden">
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

        <div className="container mx-auto px-6 sm:px-10 md:px-12 lg:px-6 relative z-10">
          <div className="mb-10 sm:mb-12 lg:mb-14">
            <SectionHeader
              title="Our Team"
              emphasis="Members"
              description="A dedicated team of professionals working together to deliver excellence in practice management solutions."
            />
          </div>

          {/* One card per department, in the module-card style. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {teamDepartments.map((department, index) => (
              <Reveal key={department.title} delay={(index % 4) * 0.05} className="h-full">
              <div
                className="group h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]"
              >
                {/* Tinted title band, so each card reads as its own group. */}
                <div className="border-b border-gray-100 bg-gradient-to-b from-blue-50/80 to-blue-50/30 px-5 py-4">
                  <h3 className="text-base sm:text-lg font-semibold leading-snug text-[#001525] font-inter">
                    {department.title}
                  </h3>
                </div>

                <ul className="divide-y divide-gray-100 px-5">
                  {department.members.map((member) => (
                    <li key={member.name} className="flex items-center gap-3 py-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-100">
                        <MemberAvatar gender={member.gender} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#001525]">{member.name}</p>
                        <p className="truncate text-xs text-gray-500">{member.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              </Reveal>
            ))}
          </div>
          {/* Team Stats - one strip, divided, rather than four separate boxes */}
          <Reveal className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 divide-y divide-x divide-gray-100 sm:divide-y-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]">
            {[
              { value: '12+', label: 'Team Members' },
              { value: '20+', label: 'Years Experience' },
              { value: '4', label: 'Departments' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-5 sm:py-6 text-center">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#001525]">{stat.value}</div>
                <div className="mt-1 text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Our Mission, Vision & Values Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white bg-dot-pattern">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6">
          <SectionHeader
            title="Our Mission, Vision &"
            emphasis="Values"
            description="We are driven by a clear purpose, a bold vision for the future, and guiding values that shape every decision we make. Our mission defines what we do today, our vision paints the picture of tomorrow, and our core values keep us true to our principles as we innovate and grow."
            cta={{ href: '/modules', label: 'All Modules' }}
          />

          {/* Mission, Vision & Values Cards */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {/* Mission Card */}
            <Reveal className="h-full">
            <div className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]">
              <div className="mb-6 sm:mb-7 flex h-11 w-11 items-center justify-center rounded-[6px] bg-blue-50">
                <Image
                  src="/images/mission-icon.svg"
                  alt="Mission Icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain"
                />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Our Mission</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-inter">
                Develop a comprehensive and efficient practice management solution that streamlines operations, ensures compliance with regulations, prioritizes data security and privacy, promotes integration and collaboration, provides analytics and business intelligence, offers a user-friendly interface, and commits to continuous improvement and innovation in professional practice.
              </p>
            </div>
            </Reveal>

            {/* Vision Card */}
            <Reveal delay={0.05} className="h-full">
            <div className="group h-full rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-12px_rgba(16,24,40,0.16)]">
              <div className="mb-6 sm:mb-7 flex h-11 w-11 items-center justify-center rounded-[6px] bg-blue-50">
                <Image
                  src="/images/vision-icon.svg"
                  alt="Vision Icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain"
                />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Our Vision</h3>
              <p className="text-sm leading-relaxed text-gray-500 font-inter">
                Create a revolutionizing application, transforming the way professionals manage their practice by delivering a comprehensive, user-friendly, and innovative solution that optimizes processes, ensures regulatory compliance, enables secure data management, promotes seamless collaboration, and empowers data-driven decision-making for sustainable growth and success of professionals.
              </p>
            </div>
            </Reveal>

            {/* Values Card */}
            <Reveal delay={0.1} className="sm:col-span-2 md:col-span-1">
            <div className="h-full bg-white border rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1" style={{ borderColor: '#B6C9F3' }}>
              <div className="mb-6 sm:mb-7 flex h-11 w-11 items-center justify-center rounded-[6px] bg-blue-50">
                <Image
                  src="/images/values-icon.svg"
                  alt="Values Icon"
                  width={32}
                  height={32}
                  className="h-6 w-6 object-contain"
                />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold leading-snug text-[#001525] font-inter">Our Values</h3>
              <div className="text-sm leading-relaxed text-gray-500 font-inter">
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
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  )
}
