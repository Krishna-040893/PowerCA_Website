<<<<<<< HEAD
"use client"

import { HeroSection } from "@/components/home/hero-section"
import { StreamlinePractice } from "@/components/home/streamline-practice"
import { PowerCAToolsSection } from "@/components/home/powerca-tools-section"
import { StartUsingCTA } from "@/components/home/start-using-cta"
import { BestCRMSection } from "@/components/home/best-crm-section"
import { ClientServerComparison } from "@/components/home/client-server-comparison"
import { BenefitsOfPowerCA } from "@/components/home/benefits-powerca"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Streamline your practice */}
      <StreamlinePractice />

      {/* PowerCA Tools CA */}
      <PowerCAToolsSection />

      {/* Start using PowerCA today */}
      <StartUsingCTA />

      {/* Best Advancing Chartered Accountant CRM */}
      <BestCRMSection />

      {/* Client - Server Model */}
      <ClientServerComparison />

      {/* Benefits of PowerCA */}
      <BenefitsOfPowerCA />

      {/* Footer */}
      <Footer />
=======
import { HeroSection } from "@/components/sections/hero"
import { DashboardPreview } from "@/components/sections/dashboard-preview"
import { SocialProof } from "@/components/sections/social-proof"
import { BentoFeaturesSection } from "@/components/sections/bento-features"
import { PricingSection } from "@/components/sections/pricing"
import { TestimonialsSection } from "@/components/sections/testimonials"
import { FAQSection } from "@/components/sections/faq-section"
import { EnhancedCTASection } from "@/components/sections/enhanced-cta"
import { AnimatedSection } from "@/components/animations/animated-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
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
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />
        
        {/* Diagonal lines */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
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
      {/* Hero Section - Full Width */}
      <div className="relative">
        <HeroSection />
        {/* Dashboard Preview Wrapper - Floating below hero */}
        <div className="absolute bottom-[-200px] md:bottom-[-350px] left-1/2 transform -translate-x-1/2 z-30 w-full max-w-[1200px] px-6">
          <AnimatedSection>
            <DashboardPreview />
          </AnimatedSection>
        </div>
      </div>
        
        {/* Add spacing for the floating dashboard */}
        <div className="relative z-10 mt-[400px] md:mt-[500px]">
          <AnimatedSection delay={0.1}>
            <SocialProof />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <BentoFeaturesSection />
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <PricingSection />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <TestimonialsSection />
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <FAQSection />
          </AnimatedSection>
          <AnimatedSection delay={0.45}>
            <EnhancedCTASection />
          </AnimatedSection>
        </div>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    </div>
  )
}