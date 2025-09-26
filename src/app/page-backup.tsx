import {HeroSection  } from '@/components/sections/hero'
import {DashboardPreview  } from '@/components/sections/dashboard-preview'
import {SocialProof  } from '@/components/sections/social-proof'
import {BentoFeaturesSection  } from '@/components/sections/bento-features'
import {PricingSection  } from '@/components/sections/pricing'
import {TestimonialsSection  } from '@/components/sections/testimonials'
import {FAQSection  } from '@/components/sections/faq-section'
import {EnhancedCTASection  } from '@/components/sections/enhanced-cta'
import {AnimatedSection  } from '@/components/animations/animated-section'

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
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/50 to-background/90" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatedSection>
          <HeroSection />
        </AnimatedSection>

        <AnimatedSection>
          <SocialProof />
        </AnimatedSection>

        <AnimatedSection>
          <DashboardPreview />
        </AnimatedSection>

        <AnimatedSection>
          <BentoFeaturesSection />
        </AnimatedSection>

        <AnimatedSection>
          <PricingSection />
        </AnimatedSection>

        <AnimatedSection>
          <TestimonialsSection />
        </AnimatedSection>

        <AnimatedSection>
          <FAQSection />
        </AnimatedSection>

        <AnimatedSection>
          <EnhancedCTASection />
        </AnimatedSection>
      </div>
    </div>
  )
}