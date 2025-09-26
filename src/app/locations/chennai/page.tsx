import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckCircle2, Users, TrendingUp, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Chennai - PowerCA Practice Management for Tamil Nadu CAs',
  description: 'PowerCA - Professional practice management software for Chartered Accountants in Chennai and Tamil Nadu. Complete GST, income tax, and compliance solution. Book your Chennai demo today.',
  keywords: 'CA software Chennai, chartered accountant software Chennai, CA practice management Tamil Nadu, GST software Chennai, tax software Chennai',
  openGraph: {
    title: 'PowerCA - Professional CA Practice Management Software in Chennai',
    description: 'Streamline your Chennai CA practice with PowerCA. Designed for Tamil Nadu tax compliance and GST requirements.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/chennai',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Chennai',
  description: 'Practice management software for Chartered Accountants in Chennai',
  url: 'https://powerca.in/locations/chennai',
  areaServed: {
    '@type': 'City',
    name: 'Chennai',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chennai',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
}

export default function ChennaiPage() {
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
              { label: 'Chennai', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Advanced CA Software for <span className="text-blue-600">Chennai</span> Professionals
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Tailored for Chartered Accountants in Chennai and Tamil Nadu. Complete practice management with Tamil Nadu GST compliance built-in
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Chennai Demo
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
                  <span className="text-gray-700 font-semibold">Tamil Nadu Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Tamil & English Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">TN GST Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Designed for Chennai's CA Community
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Tamil Nadu Tax Compliance</h3>
                <p className="text-gray-600 mb-4">
                  Pre-configured for Tamil Nadu state tax requirements with automatic regulatory updates
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">TN GST portal integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tamil Nadu VAT support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Professional tax automation</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Manufacturing Sector Focus</h3>
                <p className="text-gray-600 mb-4">
                  Special features for Chennai's strong manufacturing and export industries
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Export documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SEZ compliance tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Manufacturing GST handling</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Bilingual Support</h3>
                <p className="text-gray-600 mb-4">
                  Complete support in Tamil and English for better accessibility
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tamil language interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Local phone support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Chennai training sessions</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Benefits for Chennai CAs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Streamline your practice with features designed for Chennai's diverse business environment."
                </p>
                <div>
                  <p className="font-semibold">Manufacturing Compliance</p>
                  <p className="text-sm text-gray-600">Perfect for T. Nagar & Anna Nagar Practices</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Handle export-import documentation and SEZ compliance with specialized modules."
                </p>
                <div>
                  <p className="font-semibold">Export-Import Features</p>
                  <p className="text-sm text-gray-600">Ideal for Guindy & Porur Business Parks</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Tamil language support ensures your entire team can use the software effectively."
                </p>
                <div>
                  <p className="font-semibold">Local Language Advantage</p>
                  <p className="text-sm text-gray-600">Supporting All Chennai Locations</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Transform Your Chennai Practice with PowerCA
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today and experience practice management designed for Tamil Nadu CAs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Chennai Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Contact Chennai Team
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}