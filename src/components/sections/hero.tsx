"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SlideIn } from "@/components/animations/slide-in"
import { FadeIn } from "@/components/animations/fade-in"
import { ArrowRight, FileText, Shield, Users, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { RotatingText } from "@/components/ui/rotating-text"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-50/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-secondary-50/30 to-transparent" />
      </div>
      
      {/* Grid pattern overlay - matching pricing page */}
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
      
      {/* Dot pattern overlay - matching pricing page */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px'
        }}
      />
      
      {/* Diagonal lines pattern */}
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
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-200/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary-200/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-100/40 to-secondary-100/40 rounded-full blur-3xl"
        />
      </div>
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-white/40" />

      {/* Content Container */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <SlideIn direction="down" delay={0}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center px-4 py-2 rounded-full glass-primary border border-primary-200/50 text-primary-700 text-sm font-medium mb-6 shadow-lg"
              >
                <Shield className="w-4 h-4 mr-2" />
                Practice Management Solution for Professionals
              </motion.div>
            </SlideIn>

            {/* Main Headline */}
            <SlideIn direction="up" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Simplify Your Practice,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 block mt-2">
                  Amplify Your{" "}
                  <RotatingText 
                    words={["Growth", "Potential", "Revenue"]}
                    className="ml-2"
                  />
                </span>
              </h1>
            </SlideIn>

            {/* PowerCA Description */}
            <SlideIn direction="up" delay={0.3}>
              <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-4xl mx-auto leading-relaxed">
                Power CA is a robust administrative tool designed to take control and bring efficiency to your practice. 
                Empower your practice by seamlessly managing your tasks, billing, documentation and other functions. 
                We cordially welcome you to explore further.
              </p>
            </SlideIn>

            {/* Subheadline */}
            <SlideIn direction="up" delay={0.4}>
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-10">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary-400"></div>
                <p className="text-base sm:text-lg font-medium">
                  Save 10+ hours weekly • Ensure 100% compliance • Grow effortlessly
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400"></div>
              </div>
            </SlideIn>

            {/* CTA Buttons */}
            <SlideIn direction="up" delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 group"
                  asChild
                >
                  <Link href="/book-demo">
                    Book Your Demo
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg group border-2 hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-700 transition-all"
                  asChild
                >
                  <Link href="/docs/PowercaPromoters.pdf" download>
                    <FileText className="mr-2 w-5 h-5" />
                    Promoter's Perspective
                  </Link>
                </Button>
              </div>
            </SlideIn>

            {/* Trust Indicators */}
            <FadeIn delay={0.8}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 glass-light rounded-lg px-4 py-3"
                >
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700">
                    <strong className="text-gray-900">15,000+</strong> Active Users
                  </span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 glass-light rounded-lg px-4 py-3"
                >
                  <Shield className="w-5 h-5 text-secondary-600" />
                  <span className="text-gray-700">
                    <strong className="text-gray-900">100%</strong> Data Security
                  </span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center space-x-2 glass-light rounded-lg px-4 py-3"
                >
                  <TrendingUp className="w-5 h-5 text-accent-600" />
                  <span className="text-gray-700">
                    <strong className="text-gray-900">40%</strong> Revenue Growth
                  </span>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Bottom Wave Shape */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path 
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="white"
            fillOpacity="0.1"
          />
          <path 
            d="M0 120L48 115C96 110 192 100 288 95C384 90 480 90 576 92C672 94 768 98 864 100C960 102 1056 102 1152 100C1248 98 1344 94 1392 92L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="white"
            fillOpacity="0.5"
          />
          <path 
            d="M0 120L48 118C96 116 192 112 288 110C384 108 480 108 576 108C672 108 768 108 864 108C960 108 1056 108 1152 108C1248 108 1344 108 1392 108L1440 108V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}