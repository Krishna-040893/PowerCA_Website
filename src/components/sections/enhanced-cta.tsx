'use client'

import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {Badge  } from '@/components/ui/badge'
import { ArrowRight, Clock, Users, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import {useState, useEffect  } from 'react'

export function EnhancedCTASection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700">
        <div className="absolute inset-0 bg-grid-white/10" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Limited time badge */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Badge className="bg-yellow-400 text-gray-900 border-yellow-500 px-4 py-2 text-sm font-semibold">
              <Clock className="w-4 h-4 mr-2" />
              Limited Time Offer Ends In: {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </Badge>
          </motion.div>

          {/* Main heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
              CA Practice Today?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join 500+ progressive CA firms already saving 10+ hours weekly and growing revenue by 40%
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">
                <span className="text-yellow-400 font-bold">127</span> firms joined this week
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">
                <span className="text-yellow-400 font-bold">4.9/5</span> user rating
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-primary-700 px-8 py-6 text-lg font-semibold shadow-2xl group"
                asChild
              >
                <Link href="/demo">
                  Start Your Free Trial Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                asChild
              >
                <Link href="/demo">
                  Schedule Live Demo
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Free onboarding support
            </div>
          </div>

          {/* Testimonial snippet */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
          >
            <p className="text-white italic mb-3">
              "PowerCA reduced our admin work by 70%. We now focus on what matters - growing our practice and serving clients better."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-gray-900 font-bold">
                AS
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">CA Amit Singh</p>
                <p className="text-primary-200 text-sm">Managing Partner, Singh & Co.</p>
              </div>
            </div>
          </motion.div>

          {/* Urgency message */}
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-8 text-yellow-300 font-medium"
          >
            ⚡ Special pricing ends soon - Save 20% on annual plans
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}