import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/home/section-header'
import { PageHero } from '@/components/layout/page-hero'
import { Reveal } from '@/components/ui/reveal'
import {
  Calculator,
  Receipt,
  FileText,
  Home,
  Award,
  IndianRupee,
  TrendingUp,
  Shield,
  ArrowRight,
  Calendar,
  PiggyBank,
  CreditCard
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free Tax & Financial Calculators for CAs - PowerCA Tools',
  description: 'Free online calculators for Chartered Accountants. GST, Income Tax, TDS, HRA, Gratuity calculators. Accurate calculations with latest Indian tax rates.',
  keywords: 'tax calculators, GST calculator, income tax calculator, TDS calculator, HRA calculator, gratuity calculator, CA tools, financial calculators India',
  openGraph: {
    title: 'Free Tax Calculators & CA Tools - PowerCA',
    description: 'Complete suite of tax and financial calculators for Indian CAs and businesses.',
    images: ['/og-image.jpg'],
  },
}

const calculators = [
  {
    title: 'GST Calculator',
    description: 'Calculate CGST, SGST, and IGST instantly. Add or remove GST from amounts.',
    icon: Receipt,
    href: '/tools/gst-calculator',
    color: 'bg-blue-500',
    popular: true,
    features: ['CGST/SGST split', 'Inclusive/Exclusive', 'All GST rates', 'Export results'],
  },
  {
    title: 'Income Tax Calculator',
    description: 'Calculate income tax for FY 2024-25. Compare old vs new tax regime.',
    icon: IndianRupee,
    href: '/tools/income-tax-calculator',
    color: 'bg-green-500',
    popular: true,
    features: ['New vs Old regime', 'All age groups', 'Deductions', 'Monthly TDS'],
  },
  {
    title: 'TDS Calculator',
    description: 'Calculate TDS on various payments as per latest rates and sections.',
    icon: FileText,
    href: '/tools/tds-calculator',
    color: 'bg-purple-500',
    popular: false,
    features: ['All TDS sections', 'With/Without PAN', 'Compliance notes', 'Due dates'],
  },
  {
    title: 'HRA Calculator',
    description: 'Calculate HRA exemption under Section 10(13A). Maximize tax savings on rent.',
    icon: Home,
    href: '/tools/hra-calculator',
    color: 'bg-orange-500',
    popular: true,
    features: ['Metro/Non-metro', 'Tax savings', 'Document checklist', '3 conditions'],
  },
  {
    title: 'Gratuity Calculator',
    description: 'Calculate gratuity as per Payment of Gratuity Act. Check tax exemption limits.',
    icon: Award,
    href: '/tools/gratuity-calculator',
    color: 'bg-indigo-500',
    popular: false,
    features: ['Covered/Not covered', 'Tax exemption', 'Eligibility check', 'Formula display'],
  },
  {
    title: 'Advance Tax Calculator',
    description: 'Calculate advance tax liability and payment schedule for FY 2024-25.',
    icon: Calendar,
    href: '/tools/advance-tax-calculator',
    color: 'bg-cyan-500',
    popular: true,
    features: ['Quarterly installments', 'New vs Old regime', 'Interest calculation', 'Due dates'],
  },
  {
    title: 'Capital Gains Calculator',
    description: 'Calculate tax on capital gains from sale of property, shares, and other assets.',
    icon: TrendingUp,
    href: '/tools/capital-gains-calculator',
    color: 'bg-emerald-500',
    popular: true,
    features: ['LTCG/STCG', 'Indexation benefit', 'Latest rates', 'Exemptions u/s 54'],
  },
  {
    title: 'NPS Calculator',
    description: 'Calculate NPS returns, tax benefits under 80CCD, and monthly pension.',
    icon: PiggyBank,
    href: '/tools/nps-calculator',
    color: 'bg-pink-500',
    popular: false,
    features: ['Tax savings ₹2L', 'Retirement corpus', 'Monthly pension', 'Annuity options'],
  },
  {
    title: 'EMI Calculator',
    description: 'Calculate EMIs for home, car, personal, and education loans with amortization.',
    icon: CreditCard,
    href: '/tools/emi-calculator',
    color: 'bg-amber-500',
    popular: true,
    features: ['All loan types', 'Amortization schedule', 'Prepayment benefits', 'Interest breakdown'],
  },
]

const upcomingCalculators = [
  { name: 'PPF Calculator', icon: IndianRupee },
  { name: 'SIP Calculator', icon: TrendingUp },
  { name: 'FD Calculator', icon: Calculator },
  { name: 'Retirement Calculator', icon: Shield },
  { name: 'Sukanya Samriddhi Calculator', icon: PiggyBank },
  { name: 'Mutual Fund Returns', icon: TrendingUp },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <PageHero
        badge={{
          icon: <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5" />,
          label: 'Free Tools for Professionals',
        }}
        title="Free Tax &"
        accent="Financial Calculators"
        description="Professional calculators designed for Chartered Accountants. Accurate calculations with latest Indian tax rates and compliance rules."
      >
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {[
            { emoji: '🇮🇳', label: 'India Specific' },
            { emoji: '📊', label: 'FY 2024-25 Updated' },
            { emoji: '✅', label: '100% Accurate' },
            { emoji: '🆓', label: 'Always Free' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.10)]"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm font-semibold text-[#001525]">{item.label}</span>
            </div>
          ))}
        </div>
      </PageHero>

      {/* Calculators Grid */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {calculators.map((calc, index) => {
              const Icon = calc.icon
              return (
                <Reveal key={calc.title} delay={(index % 3) * 0.05}>
                <Card className="relative h-full overflow-hidden hover:shadow-xl transition-shadow">
                  {calc.popular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <div className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${calc.color} text-white mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{calc.title}</h3>
                    <p className="text-gray-600 mb-4">{calc.description}</p>

                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {calc.features.map((feature) => (
                          <span key={feature} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link href={calc.href}>
                      <Button className="w-full group">
                        Open Calculator
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <SectionHeader title="Coming" emphasis="Soon" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {upcomingCalculators.map((calc) => {
              const Icon = calc.icon
              return (
                <div key={calc.name} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-gray-400 mb-3">
                    <Icon className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{calc.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <SectionHeader title="Why Use PowerCA" emphasis="Calculators?" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Calculator className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">100% Accurate</h3>
              <p className="text-sm text-gray-600">
                Calculations based on latest tax laws and government notifications
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                No data stored. All calculations happen in your browser
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Download Results</h3>
              <p className="text-sm text-gray-600">
                Export calculation results for client records and filing
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Always Updated</h3>
              <p className="text-sm text-gray-600">
                Regularly updated with latest tax slabs and rates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-blue-600">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-white font-inter mb-4">
            Need More Than Just Calculators?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            PowerCA offers complete practice management software with automated compliance, client management, and billing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-demo">
              <Button size="lg" variant="secondary">
                Book Free Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-7 sm:py-10 md:py-12 lg:py-[60px] bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose prose-gray">
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-4">About Our Tax Calculators</h2>
            <p className="text-gray-600 mb-4">
              PowerCA's suite of tax and financial calculators are designed specifically for Chartered Accountants and tax professionals in India.
              Each calculator is meticulously updated to reflect the latest changes in Indian tax laws, including GST rates, income tax slabs for FY 2024-25,
              and TDS provisions.
            </p>
            <p className="text-gray-600 mb-4">
              Our calculators help CAs provide instant, accurate calculations to clients, whether it's determining GST liability,
              computing income tax under new vs old regime, calculating HRA exemptions, or determining gratuity amounts.
              All calculations include detailed breakdowns, compliance notes, and can be downloaded for record-keeping.
            </p>
            <p className="text-gray-600">
              These tools are part of PowerCA's commitment to simplifying tax compliance and financial planning for Indian professionals.
              While our calculators are free to use, PowerCA also offers comprehensive practice management software that automates these calculations
              within your client workflows.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}