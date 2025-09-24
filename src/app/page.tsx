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
    </div>
  )
}