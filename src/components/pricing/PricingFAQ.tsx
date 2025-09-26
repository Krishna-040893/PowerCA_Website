import React from 'react'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: "What's included in the PowerCA subscription?",
    answer: "PowerCA subscription includes unlimited client management, document storage, automated compliance tracking, GST filing tools, invoice generation, payment processing, team collaboration features, and priority customer support."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. We also offer a 30-day money-back guarantee for new customers."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start your trial."
  },
  {
    question: "Do you offer discounts for CA firms with multiple users?",
    answer: "Yes, we offer volume discounts for firms with more than 5 users. Contact our sales team for custom pricing based on your team size."
  },
  {
    question: "How secure is my data with PowerCA?",
    answer: "We use bank-grade 256-bit SSL encryption for all data transfers. Your data is stored in secure, ISO 27001 certified data centers with regular backups and 99.9% uptime guarantee."
  },
  {
    question: "Can I import my existing client data?",
    answer: "Yes, we provide easy data import tools and our support team can help you migrate from your existing system at no additional cost."
  }
]

export const PricingFAQ: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about PowerCA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}