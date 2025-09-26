'use client'

import {motion  } from 'framer-motion'
import {Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
 } from '@/components/ui/accordion'
import {Badge  } from '@/components/ui/badge'
import {HelpCircle, MessageCircle  } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import Link from 'next/link'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How long does it take to set up PowerCA?',
        answer: 'Most firms are up and running within 24 hours. Our onboarding team helps you import your client data, configure your workflows, and train your team. We also provide video tutorials and documentation for self-service setup.'
      },
      {
        question: 'Can I import my existing client data?',
        answer: 'Yes! PowerCA supports importing your jobs, bills, clients and all other data from Excel or CSV. Our migration team will help you transfer all your client information, documents, and historical data seamlessly.'
      },
      {
        question: 'Do I need technical knowledge to use PowerCA?',
        answer: 'Not at all. PowerCA is designed for CA professionals, not IT experts. Our intuitive interface requires no technical knowledge. If you can use WhatsApp or email, you can use PowerCA.'
      }
    ]
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        question: 'What makes PowerCA different from other practice management software?',
        answer: 'PowerCA is built specifically for Indian CAs keeping data security and protection in mind. This is built on a client server model where you own the data and need not worry about data breaches.'
      },
      {
        question: 'Can multiple team members use PowerCA simultaneously?',
        answer: 'Yes! PowerCA supports unlimited team members, client creation, job creation, billing, etc. There are no limits on our application.'
      },
      {
        question: 'Does PowerCA integrate with other tools?',
        answer: "PowerCA integrates with popular tools like Tally for Financial Statements Preparation. We're constantly adding new integrations based on user feedback."
      }
    ]
  },
  {
    category: 'Security & Compliance',
    questions: [
      {
        question: 'How secure is my client data?',
        answer: 'PowerCA uses a client-server architecture where all your data is stored locally on your own premises, not in the cloud. This means you have complete control and ownership of your data, eliminating the risk of cloud-based data breaches.'
      },
      {
        question: 'Is PowerCA compliant with data protection regulations?',
        answer: 'Yes, PowerCA is fully compliant with Indian data protection laws and GDPR. We undergo regular security audits and maintain strict data privacy policies. Your data is never shared with third parties.'
      },
      {
        question: 'What happens to my data if I cancel my subscription?',
        answer: "Since PowerCA is a client-server application, your data always remains on your own servers. Even if you discontinue the subscription, you retain complete access to all your data as it's stored locally on your premises. You can export it in standard formats (Excel, PDF) at any time."
      }
    ]
  },
  {
    category: 'Pricing & Billing',
    questions: [
      {
        question: 'What is the current pricing for PowerCA?',
        answer: "As part of our special launch offer, PowerCA software is completely FREE until March 2026! You only pay ₹22,000 for implementation, installation, training and support. After March 2026, there's an annual subscription fee of 0.25% of your turnover."
      },
      {
        question: 'What does the ₹22,000 implementation fee include?',
        answer: "The implementation fee covers server installation, client installation on all your systems, complete training for your team, and ongoing support until March 2026. This ensures you're fully set up and operational with PowerCA."
      },
      {
        question: 'How does the annual subscription work after March 2026?',
        answer: 'After March 2026, PowerCA charges an annual subscription fee of just 0.25% of your turnover. The first year is free, and renewals happen every February. This ensures maximum support with minimum recurring cost for your practice administration.'
      }
    ]
  }
]

export function FAQSection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <HelpCircle className="w-3 h-3 mr-1" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-600">
            Can't find your answer? Our support team is just a click away.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="mb-8"
            >
              {/* Category Header */}
              <h3 className="text-lg font-semibold text-primary-600 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary-600 rounded-full" />
                {category.category}
              </h3>

              {/* Questions in this category */}
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-200 transition-colors"
                  >
                    <AccordionTrigger className="px-6 py-4 text-left hover:bg-gray-50 hover:no-underline">
                      <span className="text-gray-900 font-medium pr-4">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-2">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 lg:p-12 text-center">
            <MessageCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our support team is here to help. Get instant answers through chat or schedule a call with our product experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-primary-600 hover:bg-primary-700 text-white"
                asChild
              >
                <Link href="/support">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
                asChild
              >
                <Link href="/demo">
                  Schedule a Demo
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}