'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SectionHeader } from '@/components/home/section-header'
import { PageHero, heroButtonClass } from '@/components/layout/page-hero'
import { Reveal } from '@/components/ui/reveal'
import { Crown, CodeXml, PenTool, Settings } from 'lucide-react'

// "Arul Maniam TS" -> "AM": first letters of the first two words.
function initials(name: string) {
  return name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

export default function AboutPage() {
  // Team data organized by departments
  const teamDepartments = [
    {
      title: 'Leadership',
      icon: Crown,
      members: [
        { name: 'Arul Maniam TS', role: 'Founder & CEO', lead: true },
        { name: 'Rajendran T', role: 'Partner' },
        { name: 'Karthikeyan R', role: 'Manager' },
        { name: 'Thirunavukkarasu M', role: 'Asst. Manager & Developer' }
      ]
    },
    {
      title: 'Development',
      icon: CodeXml,
      members: [
        { name: 'Mansur Ali B', role: 'Developer' },
        { name: 'Maheshwari R', role: 'Developer' },
        { name: 'Vanithamani D', role: 'Developer' },
        { name: 'Satheeshkumar K', role: 'Database Developer' }
      ]
    },
    {
      title: 'Design',
      icon: PenTool,
      members: [
        { name: 'Karthikeyan G', role: 'Web Designer' },
        { name: 'Nikila R', role: 'Web Designer' },
        { name: 'Dhanveer Banu A', role: 'Web Designer' }
      ]
    },
    {
      title: 'Operations, Support & Marketing',
      icon: Settings,
      members: [
        { name: 'Jagadeeswari M', role: 'Admin' },
        { name: 'Ramajayanthi G', role: 'Customer Support' },
        { name: 'Kaleeswari K', role: 'QA Testing' },
        { name: 'Nalini Sofiya G', role: 'Social Media Marketing' }
      ]
    }
  ]
  const teamSize = teamDepartments.reduce((total, department) => total + department.members.length, 0)
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
                <div className="flex items-center gap-3.5 border-b border-gray-100 px-5 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1D6FB8]">
                    <department.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-medium leading-snug text-[#001525] font-inter">
                      {department.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">{department.members.length} members</p>
                  </div>
                </div>

                <ul className="divide-y divide-gray-100 px-5">
                  {department.members.map((member) => (
                    <li key={member.name} className="flex items-center gap-3 py-3.5">
                      <span
                        className={
                          member.lead
                            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D91EB] text-xs font-semibold text-white'
                            : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#1D6FB8]'
                        }
                      >
                        {initials(member.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm sm:text-[15px] font-medium text-[#001525]">{member.name}</p>
                        <p className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
                          <span className="truncate">{member.role}</span>
                          {member.lead && (
                            <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1D6FB8]">
                              Lead
                            </span>
                          )}
                        </p>
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
              { value: String(teamSize), label: 'Team Members' },
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
