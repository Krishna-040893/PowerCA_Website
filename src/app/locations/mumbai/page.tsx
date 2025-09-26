import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckCircle2, Users, TrendingUp, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Mumbai - PowerCA Practice Management for Chartered Accountants',
  description: 'PowerCA - Modern practice management software designed for Chartered Accountants in Mumbai. Complete solution with job cards, billing, and compliance tracking. Book your Mumbai demo today.',
  keywords: 'CA software Mumbai, chartered accountant software Mumbai, CA practice management Mumbai, tax software Mumbai, GST software Mumbai, accounting software Mumbai',
  openGraph: {
    title: 'PowerCA - Modern CA Practice Management Software in Mumbai',
    description: 'Streamline your Mumbai CA practice with PowerCA. Job cards, automated billing, and compliance tracking designed for chartered accountants.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/mumbai',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Mumbai',
  description: 'Practice management software for Chartered Accountants in Mumbai',
  url: 'https://powerca.in/locations/mumbai',
  areaServed: {
    '@type': 'City',
    name: 'Mumbai',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
}

export default function MumbaiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 lg:px-8 pt-4">
          <Breadcrumb
            items={[
              { label: 'Locations', href: '/locations' },
              { label: 'Mumbai', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Modern CA Practice Management Software for <span className="text-blue-600">Mumbai</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Designed specifically for Chartered Accountants in Mumbai. Save 10+ hours weekly with PowerCA's comprehensive practice management solution
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Mumbai Demo
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline">
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">Built for Mumbai CAs</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">10+ Hours Saved Weekly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">100% GST Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tailored for Mumbai's CA Professionals
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Maharashtra GST Compliance</h3>
                <p className="text-gray-600 mb-4">
                  Pre-configured for Maharashtra state GST requirements with automatic updates for local tax changes
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">GSTR filing automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">E-way bill generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Input tax credit tracking</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Mumbai Business Network</h3>
                <p className="text-gray-600 mb-4">
                  Connect with fellow Mumbai CAs and share best practices through our exclusive community
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Local CA directory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Mumbai CA events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Referral network</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Local Support Team</h3>
                <p className="text-gray-600 mb-4">
                  Dedicated Mumbai-based support team available during business hours with on-site assistance
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Hindi & Marathi support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Same-day resolution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">On-site training available</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Mumbai CAs Can Expect
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "PowerCA can help transform your practice to handle 3x more clients with the same team."
                </p>
                <div>
                  <p className="font-semibold">Expected Benefits</p>
                  <p className="text-sm text-gray-600">For CA Firms in Andheri & Western Mumbai</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Our GST module is optimized for Maharashtra compliance to save hours during filing season."
                </p>
                <div>
                  <p className="font-semibold">Key Feature</p>
                  <p className="text-sm text-gray-600">Perfect for Bandra & Central Mumbai Practices</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Get dedicated local support in Mumbai that understands your specific practice needs."
                </p>
                <div>
                  <p className="font-semibold">Our Promise</p>
                  <p className="text-sm text-gray-600">Supporting South Mumbai & Beyond</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Local Stats */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              PowerCA Capabilities for Mumbai
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <p className="text-gray-600">Hours Saved Weekly</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <p className="text-gray-600">GST Compliant</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <p className="text-gray-600">Cloud Access</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">30-Day</div>
                <p className="text-gray-600">Free Trial</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your PowerCA Journey in Mumbai Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get started with a free trial and personalized demo for your Mumbai practice
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Mumbai Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Contact Local Team
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions - Mumbai
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Do you provide on-site training in Mumbai?</h3>
                <p className="text-gray-600">
                  Yes, we offer comprehensive on-site training for CA firms in Mumbai and surrounding areas. Our local team can visit your office for personalized training sessions.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Is PowerCA compliant with Maharashtra GST requirements?</h3>
                <p className="text-gray-600">
                  Absolutely! PowerCA is fully compliant with Maharashtra state GST requirements and automatically updates for any regulatory changes.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Can I migrate data from Tally or other software?</h3>
                <p className="text-gray-600">
                  Yes, we provide complete data migration support from Tally, Busy, and other accounting software. Our Mumbai team assists with the entire migration process.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">What areas in Mumbai do you serve?</h3>
                <p className="text-gray-600">
                  We serve all areas of Mumbai including South Mumbai, Western Suburbs, Central Mumbai, Harbor Line areas, and Navi Mumbai.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}