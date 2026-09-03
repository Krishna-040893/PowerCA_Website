'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const benefits = [
  {
    number: '1.',
    title: 'Organized Digital Workflows',
    description: 'Replace manual registers with easily retrievable digital data. Job Masters, Job Cards, Checklists, and Job Plans bring discipline and efficiency to daily routines.'
  },
  {
    number: '2.',
    title: 'Knowledge-Driven Templates',
    description: 'Convert auditor expertise into reusable, practice-oriented templates so every staff member works at peak efficiency.'
  },
  {
    number: '3.',
    title: 'Built-In Best Practices',
    description: 'Adopt proven methods from leading audit firms - targets, weekly reviews, wrap-up checklists, service requests, and detailed job notes - for quality service and proper documentation.'
  },
  {
    number: '4.',
    title: 'Higher Service Value',
    description: 'Present complete Job Reports to clients to improve billability and acceptance. Costing tools flag loss-making assignments and guide internal course correction.'
  },
  {
    number: '5.',
    title: 'Culture of Accountability',
    description: 'Work diaries, task and client notes, reminders, attendance logs, and approvals foster documentation discipline and a professional work culture.'
  }
]

export function BenefitsAccordion() {
  const [openBenefit, setOpenBenefit] = useState(0)

  const toggleBenefit = (index: number) => {
    setOpenBenefit(openBenefit === index ? -1 : index)
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {benefits.map((benefit, index) => {
        const isOpen = openBenefit === index
        return (
          <div
            key={index}
            className={`rounded-2xl border border-gray-200 bg-white transition-shadow ${
              isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md'
            }`}
          >
            <button
              onClick={() => toggleBenefit(index)}
              className="w-full rounded-2xl px-4 sm:px-5 lg:px-6 py-3 sm:py-4 text-left flex items-center justify-between"
              aria-expanded={isOpen}
              aria-controls={`benefit-panel-${index}`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                <span className="text-base sm:text-lg lg:text-2xl font-bold text-[#155dfc] leading-snug">{benefit.number}</span>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 pr-3 sm:pr-4">{benefit.title}</h3>
              </div>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              id={`benefit-panel-${index}`}
              className={`px-4 sm:px-5 lg:px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'pb-4 sm:pb-5 max-h-[1000px] opacity-100' : 'max-h-0 py-0 opacity-0'
              }`}
            >
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base ml-7 sm:ml-9 lg:ml-12">
                {benefit.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
