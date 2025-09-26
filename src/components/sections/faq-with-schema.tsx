'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  description?: string
  faqs: FAQItem[]
  className?: string
}

export function FAQWithSchema({
  title = 'Frequently Asked Questions',
  description,
  faqs,
  className
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-gray-500 flex-shrink-0 transition-transform',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={cn(
                    'px-6 overflow-hidden transition-all duration-300',
                    openIndex === index ? 'py-4 max-h-96' : 'max-h-0'
                  )}
                >
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// Pre-configured FAQ for PowerCA
export const powerCAFAQs: FAQItem[] = [
  {
    question: 'What is PowerCA and who is it designed for?',
    answer: 'PowerCA is a comprehensive practice management software designed specifically for Chartered Accountants in India. It helps CAs manage their entire practice including job cards, billing, compliance tracking, client management, and document handling - all in one integrated platform.'
  },
  {
    question: 'How does PowerCA help save time for CA firms?',
    answer: 'PowerCA automates repetitive tasks like invoice generation, compliance deadline tracking, and client communications. Our users report saving 10+ hours weekly through features like automated GST filing, bulk invoice generation, and intelligent compliance reminders. The centralized dashboard gives you instant access to all client information, eliminating time wasted searching for documents.'
  },
  {
    question: 'Is PowerCA compliant with Indian GST and tax regulations?',
    answer: 'Yes, PowerCA is 100% compliant with Indian GST and tax regulations. The software automatically updates for any regulatory changes, supports all GSTR forms, handles state-specific compliance requirements, and includes features for TDS, income tax, and professional tax management. We work closely with tax professionals to ensure our software meets all statutory requirements.'
  },
  {
    question: 'Can I migrate my existing data from Tally or other software?',
    answer: 'Absolutely! PowerCA provides comprehensive data migration support from popular accounting software including Tally, Busy, Marg, and Excel. Our technical team assists with the entire migration process to ensure all your client data, transactions, and documents are transferred accurately without any data loss.'
  },
  {
    question: 'What kind of support does PowerCA provide?',
    answer: 'PowerCA offers multiple levels of support including 24/7 email support, business hours phone support, live chat assistance, video training sessions, and on-site training for enterprise clients. We also provide extensive documentation, video tutorials, and regular webinars to help you maximize the software\'s potential.'
  },
  {
    question: 'Is PowerCA available on mobile devices?',
    answer: 'Yes, PowerCA is fully cloud-based and responsive, meaning you can access it from any device with an internet connection - including smartphones, tablets, laptops, and desktops. Your data syncs in real-time across all devices, allowing you to work from anywhere.'
  },
  {
    question: 'How secure is my client data on PowerCA?',
    answer: 'Security is our top priority. PowerCA uses bank-level 256-bit SSL encryption, automated daily backups, secure AWS cloud hosting, role-based access controls, and two-factor authentication. We are compliant with data protection regulations and ensure your client\'s sensitive financial information is always protected.'
  },
  {
    question: 'What is the pricing structure for PowerCA?',
    answer: 'PowerCA offers flexible pricing plans based on the size of your practice. We have plans for solo practitioners, small firms (2-5 users), medium firms (6-20 users), and enterprise solutions for large practices. All plans include a 30-day free trial with full features and no credit card required. Contact us for detailed pricing information.'
  },
  {
    question: 'Can PowerCA handle multiple branches or locations?',
    answer: 'Yes, PowerCA is designed to handle multi-branch operations seamlessly. You can manage multiple office locations, assign location-specific users, track branch-wise performance, and consolidate reporting across all locations from a single dashboard.'
  },
  {
    question: 'How long does it take to implement PowerCA in my practice?',
    answer: 'Most CA firms are fully operational on PowerCA within 3-5 days. This includes initial setup, data migration, and basic training. Our implementation team provides step-by-step guidance, and you can start using basic features immediately while gradually adopting advanced functionalities.'
  }
]