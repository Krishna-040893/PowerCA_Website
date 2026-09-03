'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/home/section-header'
import { Reveal } from '@/components/ui/reveal'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  /** Closing words of the title, set in bold. */
  titleEmphasis?: string
  description?: string
  faqs: FAQItem[]
  className?: string
}

export function FAQWithSchema({
  title = 'Frequently Asked Questions',
  titleEmphasis,
  description,
  faqs,
  className
}: FAQSectionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  // Generate FAQ schema markup
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  }

  const toggleAccordion = (index: number) => {
    // Toggle the accordion independently - can have multiple open at once
    setOpenIndices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className={cn('py-7 sm:py-10 md:py-12 lg:py-[60px]', className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <SectionHeader
              title={title}
              emphasis={titleEmphasis}
              description={description}
            />
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-start">
              {faqs.map((faq, index) => {
                const isOpen = openIndices.has(index)
                return (
                  <Reveal key={`faq-${index}-${faq.question.substring(0, 20)}`} delay={(index % 2) * 0.05}>
                  <div
                    className={cn(
                      'rounded-2xl border border-gray-200 bg-white h-auto transition-shadow',
                      isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md'
                    )}
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full rounded-2xl px-4 sm:px-5 lg:px-6 py-3 sm:py-4 text-left flex items-center justify-between"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 pr-3 sm:pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    <div
                      id={`faq-answer-${index}`}
                      className={cn(
                        'px-4 sm:px-5 lg:px-6 overflow-hidden transition-all duration-300 ease-in-out',
                        isOpen ? 'pb-4 sm:pb-5 max-h-[1000px] opacity-100' : 'max-h-0 py-0 opacity-0'
                      )}
                    >
                      <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// Pre-configured FAQ for Power CA
export const powerCAFAQs: FAQItem[] = [
  {
    question: 'What is Power CA and who is it designed for?',
    answer: 'Power CA is a comprehensive practice management software designed specifically for Chartered Accountants in India. It helps CAs manage their entire practice including job cards, billing, compliance tracking, client management, and document handling - all in one integrated platform.'
  },
  {
    question: 'How does Power CA help save time for CA firms?',
    answer: 'Power CA automates repetitive tasks like invoice generation, compliance deadline tracking, and client communications. Our users report saving 10+ hours weekly. The centralized dashboard gives you instant access to all client information, eliminating time wasted searching for documents.'
  },
  {
    question: 'What kind of support does Power CA provide?',
    answer: 'Power CA offers multiple levels of support including 24/7 email support, business hours phone support, live chat assistance, video training sessions, and on-site training for enterprise clients. We are planning to provide extensive documentation, video tutorials, help tooltips inside the app, and regular webinars to help you maximize the software\'s potential.'
  },
  {
    question: 'Is Power CA available on mobile devices?',
    answer: 'Power CA is currently a client-server application designed for desktop use. We are planning to launch a mobile app for onsite or out of office users to add quick task updates, making it easier to stay connected with your practice while on the go.'
  },
  {
    question: 'How secure is my client data on Power CA?',
    answer: 'Power CA is a client-server application where your data is stored on your own server or local infrastructure - giving you complete control and ownership of all client information. We do not store any of your client data on external servers or the cloud, ensuring maximum security and privacy. Your sensitive financial information stays within your organization\'s secure environment, protected by your own security measures and access controls.'
  },
  {
    question: 'What is the pricing structure for Power CA?',
    answer: 'Power CA offers flexible pricing plans to suit your needs: 1) Annual License at ₹1,500/user/year, 2) 2 Year Pack at ₹3,000/user (one-time payment), and 3) Enterprise/Large Practitioner with custom pricing for 20+ users. All plans include installation, demo, and ongoing support. Contact us to learn more about how Power CA can fit your practice needs.'
  },
  {
    question: 'Can Power CA handle multiple branches or locations?',
    answer: 'Yes, Power CA is designed to handle multiple branches, locations, and even multiple firms within the same organization. We use localized servers for each branch or location, ensuring that each operates independently with its own data and users. This setup provides maximum security and performance for each location while maintaining the flexibility to manage diverse operations across your organization.'
  },
  {
    question: 'How long does it take to implement Power CA in my practice?',
    answer: 'Most CA firms are fully operational on Power CA within 3-5 days. This includes initial setup, data migration, and basic training. Our implementation team provides step-by-step guidance, and you can start using basic features immediately while gradually adopting advanced functionalities.'
  }
]