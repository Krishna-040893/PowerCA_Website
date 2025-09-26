'use client'

import { FileText, Receipt, BarChart3, Users, Calculator, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Job Card Management',
    description: 'Comprehensive job management with intuitive dashboard, advanced search, and seamless edit functions for efficient workflow control.',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-500',
    demo: {
      type: 'dashboard',
      content: ['Active Jobs: 42', 'Pending: 8', 'Completed: 156', 'Quick Search', 'Edit Mode']
    }
  },
  {
    title: 'Billing Module',
    description: 'Streamline your invoicing process with automated billing, payment tracking, and comprehensive financial reporting.',
    icon: Receipt,
    gradient: 'from-green-500 to-emerald-500',
    demo: {
      type: 'list',
      content: ['Generate GST Invoices', 'Payment Reminders', 'Recurring Billing', 'Payment Gateway Integration']
    }
  },
  {
    title: 'Financial Statements',
    description: 'Generate accurate financial statements, balance sheets, and P&L reports with real-time data synchronization.',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-500',
    demo: {
      type: 'chart',
      content: ['Balance Sheet', 'P&L Statement', 'Cash Flow', 'Trial Balance']
    }
  },
  {
    title: 'Clients Module',
    description: 'Centralized client management system with detailed profiles, document storage, and communication history.',
    icon: Users,
    gradient: 'from-orange-500 to-red-500',
    demo: {
      type: 'cards',
      content: ['247 Active Clients', 'KYC Documents', 'Communication Log', 'Task Assignment']
    }
  },
  {
    title: 'Costing Module',
    description: 'Track project costs, analyze profitability, and optimize resource allocation with detailed cost analytics.',
    icon: Calculator,
    gradient: 'from-indigo-500 to-purple-500',
    demo: {
      type: 'metrics',
      content: ['Cost Analysis', 'Profit Margins', 'Resource Tracking', 'Budget vs Actual']
    }
  },
  {
    title: 'CRM Module',
    description: 'Build stronger client relationships with integrated CRM featuring lead tracking, follow-ups, and engagement analytics.',
    icon: UserCheck,
    gradient: 'from-teal-500 to-blue-500',
    demo: {
      type: 'pipeline',
      content: ['Lead Pipeline', 'Follow-up Reminders', 'Client Interactions', 'Conversion Analytics']
    }
  }
]

export function FeaturesGrid() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1D91EB 1px, transparent 1px),
              linear-gradient(to bottom, #1D91EB 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />

        {/* Diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              #1D91EB 35px,
              #1D91EB 36px
            )`
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Empower Your Practice with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Power CA
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Comprehensive modules designed to streamline every aspect of your CA practice, from client management to financial reporting.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

                {/* Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Demo Content */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {feature.demo.type === 'dashboard' && (
                      <div className="space-y-2">
                        {feature.demo.content.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{item.includes(':') ? item.split(':')[0] : item}</span>
                            {item.includes(':') && (
                              <span className="font-semibold text-gray-900">{item.split(':')[1]}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {feature.demo.type === 'list' && (
                      <ul className="space-y-1">
                        {feature.demo.content.map((item, i) => (
                          <li key={i} className="flex items-center text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {feature.demo.type === 'chart' && (
                      <div className="flex items-end justify-between h-20 px-2">
                        {[40, 65, 45, 75, 55].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 mx-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t opacity-70"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    )}

                    {feature.demo.type === 'cards' && (
                      <div className="grid grid-cols-2 gap-2">
                        {feature.demo.content.map((item, i) => (
                          <div key={i} className="bg-white rounded p-2 text-xs text-center text-gray-600">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    {feature.demo.type === 'metrics' && (
                      <div className="space-y-2">
                        {feature.demo.content.map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{item}</span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                style={{ width: `${60 + i * 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {feature.demo.type === 'pipeline' && (
                      <div className="space-y-2">
                        {feature.demo.content.map((item, i) => (
                          <div key={i} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}