'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeroStats {
  users: string
  features: string
  satisfaction: string
}

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  showStats?: boolean
  className?: string
}

// Memoize the component to prevent unnecessary re-renders
export const MemoizedHeroSection = memo<HeroSectionProps>(({
  title = "Streamline Your CA Practice",
  subtitle = "All-in-one platform for modern Chartered Accountants",
  ctaText = "Start Free Trial",
  ctaLink = "/register",
  showStats = true,
  className = ""
}) => {
  // Memoize computed values
  const stats: HeroStats = useMemo(() => ({
    users: "10,000+",
    features: "50+",
    satisfaction: "98%"
  }), [])

  const features = useMemo(() => [
    "Client Management",
    "GST Filing",
    "Document Storage",
    "Invoice Generation"
  ], [])

  // Memoize callbacks to prevent child re-renders
  const handleCtaClick = useCallback((e: React.MouseEvent) => {
    // Track analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        location: 'hero_section',
        action: 'start_trial'
      })
    }
  }, [])

  // Memoize animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }), [])

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }), [])

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 py-24 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-1.5">
              <TrendingUp className="w-4 h-4 mr-2" />
              #1 CA Practice Management Software
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-center text-gray-900 mb-6"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-center text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {/* Features List */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {features.map((feature) => (
              <div key={feature} className="flex items-center text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                {feature}
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-12"
          >
            <Link href={ctaLink}>
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={handleCtaClick}
              >
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          {showStats && (
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.features}</p>
                <p className="text-sm text-gray-600">Features</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.satisfaction}</p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <svg
          className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 transform opacity-10"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="100" />
        </svg>
        <svg
          className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 transform opacity-10"
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="100" />
        </svg>
      </div>
    </section>
  )
})

MemoizedHeroSection.displayName = 'MemoizedHeroSection'