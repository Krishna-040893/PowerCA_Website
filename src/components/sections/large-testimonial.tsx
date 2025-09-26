'use client'

import {motion  } from 'framer-motion'
import {Quote, Star  } from 'lucide-react'

export function LargeTestimonial() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-3xl" />

          {/* Glassmorphism overlay */}
          <div className="relative rounded-3xl overflow-hidden glass-light shadow-2xl">
            <div className="relative z-10 p-8 lg:p-16">
              <div className="max-w-4xl mx-auto">
                {/* Quote Icon */}
                <div className="mb-8">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Quote className="w-8 h-8 text-primary-600" />
                  </div>
                </div>

                {/* Testimonial Text */}
                <blockquote className="mb-8">
                  <p className="text-2xl lg:text-3xl font-medium text-gray-900 leading-relaxed">
                    "PowerCA has completely transformed how we manage our practice. The automation features alone have saved us
                    <span className="text-primary-600 font-semibold"> over 15 hours per week</span>,
                    allowing us to focus on what matters most - serving our clients. The compliance tracking is flawless,
                    and the client portal has improved our professional image significantly."
                  </p>
                </blockquote>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-gray-600">5.0 out of 5</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-semibold">
                      RS
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-gray-900 text-lg">CA Rajesh Sharma</div>
                    <div className="text-gray-600">Senior Partner, Sharma & Associates</div>
                    <div className="text-sm text-gray-500 mt-1">Mumbai | 247 Clients | Using PowerCA since 2022</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-200">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary-600">40%</div>
                    <div className="text-sm text-gray-600 mt-1">Revenue Growth</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary-600">15hrs</div>
                    <div className="text-sm text-gray-600 mt-1">Saved Weekly</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary-600">100%</div>
                    <div className="text-sm text-gray-600 mt-1">Compliance Rate</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary-600">4.9</div>
                    <div className="text-sm text-gray-600 mt-1">Client Satisfaction</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full opacity-50 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-100 rounded-full opacity-50 blur-2xl" />
        </motion.div>
      </div>
    </section>
  )
}