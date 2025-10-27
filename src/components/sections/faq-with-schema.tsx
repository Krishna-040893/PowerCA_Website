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
    console.log('Clicked FAQ index:', index, 'Current open:', openIndex)
    // If clicking the same item, close it. Otherwise, open the new one
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

          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
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
                      'px-6 overflow-hidden transition-all duration-300 ease-in-out',
                      openIndex === index ? 'py-4 max-h-[1000px] opacity-100' : 'max-h-0 py-0 opacity-0'
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
    answer: 'PowerCA automates repetitive tasks like invoice generation, compliance deadline tracking, and client communications. Our users report saving 10+ hours weekly. The centralized dashboard gives you instant access to all client information, eliminating time wasted searching for documents.'
  },
  {
    question: 'What kind of support does PowerCA provide?',
    answer: 'PowerCA offers multiple levels of support including 24/7 email support, business hours phone support, live chat assistance, video training sessions, and on-site training for enterprise clients. We are planning to provide extensive documentation, video tutorials, help tooltips inside the app, and regular webinars to help you maximize the software\'s potential.'
  },
  {
    question: 'Is PowerCA available on mobile devices?',
    answer: 'PowerCA is currently a client-server application designed for desktop use. We are planning to launch a mobile app for onsite or out of office users to add quick task updates, making it easier to stay connected with your practice while on the go.'
  },
  {
    question: 'How secure is my client data on PowerCA?',
    answer: 'PowerCA is a client-server application where your data is stored on your own server or local infrastructure - giving you complete control and ownership of all client information. We do not store any of your client data on external servers or the cloud, ensuring maximum security and privacy. Your sensitive financial information stays within your organization\'s secure environment, protected by your own security measures and access controls.'
  },
  {
    question: 'What is the pricing structure for PowerCA?',
    answer: 'PowerCA offers two pricing options: 1) Launch Offer (First Year) - ₹50,000 + taxes (50% off from ₹1,00,000, available till Oct 31, 2025) with installation, training, and ongoing support. 2) Annual Subscription - 0.20% of your annual turnover + taxes OR minimum ₹10,000 + taxes (whichever is higher), includes implementation, training, and ongoing support. Contact us to choose the plan that best fits your practice size.'
  },
  {
    question: 'Can PowerCA handle multiple branches or locations?',
    answer: 'Yes, PowerCA is designed to handle multiple branches, locations, and even multiple firms within the same organization. We use localized servers for each branch or location, ensuring that each operates independently with its own data and users. This setup provides maximum security and performance for each location while maintaining the flexibility to manage diverse operations across your organization.'
  },
  {
    question: 'How long does it take to implement PowerCA in my practice?',
    answer: 'Most CA firms are fully operational on PowerCA within 3-5 days. This includes initial setup, data migration, and basic training. Our implementation team provides step-by-step guidance, and you can start using basic features immediately while gradually adopting advanced functionalities.'
  }
]