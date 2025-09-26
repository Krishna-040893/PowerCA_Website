'use client'

import {useRef  } from 'react'
import {motion, useInView  } from 'framer-motion'
import {AnimatedCounter  } from '@/components/animations/animated-counter'

const stats = [
  {
    value: 15000,
    suffix: '+',
    label: 'Active Users',
    description: 'CA professionals trust PowerCA daily'
  },
  {
    value: 500,
    suffix: '+',
    label: 'CA Firms',
    description: 'Growing practices with PowerCA'
  },
  {
    value: 99.9,
    suffix: '%',
    label: 'Uptime',
    description: 'Reliable service you can count on'
  },
  {
    value: 10,
    suffix: '+',
    label: 'Hours Saved Weekly',
    description: 'Average time saved per firm'
  }
]

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading CA Firms
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their practice with PowerCA
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-2">
                {isInView && (
                  <AnimatedCounter
                    to={stat.value}
                    duration={2}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}