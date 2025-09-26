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
    description: 'Adopt proven methods from leading audit firms—targets, weekly reviews, wrap-up checklists, service requests, and detailed job notes—for quality service and proper documentation.'
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
    <div className="space-y-4">
      {benefits.map((benefit, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleBenefit(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl font-bold text-[#ee8529]">{benefit.number}</span>
              <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                openBenefit === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openBenefit === index && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600 ml-12">{benefit.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}