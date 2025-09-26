import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckCircle2, Factory, Gem, Building, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Trichy (Tiruchirappalli) - PowerCA for Tamil Nadu CAs',
  description: 'PowerCA - Practice management software for Chartered Accountants in Trichy. Specialized for BHEL, manufacturing, and diamond trade. Tamil language support. Book demo today.',
  keywords: 'CA software Trichy, CA software Tiruchirappalli, chartered accountant software Trichy, GST software Trichy, BHEL accounting, diamond trade accounting',
  openGraph: {
    title: 'PowerCA - CA Practice Management Software in Trichy',
    description: 'Transform your Trichy CA practice with PowerCA. Built for heavy industries and manufacturing sector.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/trichy',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Trichy',
  description: 'Practice management software for Chartered Accountants in Tiruchirappalli',
  url: 'https://powerca.in/locations/trichy',
  areaServed: {
    '@type': 'City',
    name: 'Tiruchirappalli',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tiruchirappalli',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
}

export default function TrichyPage() {
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
              { label: 'Tamil Nadu', href: '/locations/tamil-nadu' },
              { label: 'Trichy', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                CA Software for <span className="text-blue-600">Trichy's</span> Industrial Hub
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                PowerCA - Designed for Chartered Accountants in Tiruchirappalli serving BHEL, heavy industries, and diamond traders. Complete Tamil support included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Trichy Demo (திருச்சி)
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
                  <Factory className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">BHEL Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Diamond Trade</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">PSU Compliance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Built for Trichy's Industrial Economy
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">BHEL & Heavy Industries</h3>
                <p className="text-gray-600 mb-4">
                  Specialized features for BHEL vendors, contractors, and heavy industry suppliers
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">PSU vendor compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Works contract GST</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">TDS on contracts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">MSME registration</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Diamond & Jewelry Trade</h3>
                <p className="text-gray-600 mb-4">
                  Complete features for Trichy's thriving diamond and gold jewelry businesses
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Jewelry GST rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Hallmarking compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Interstate trade docs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Making charges billing</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Manufacturing Sector</h3>
                <p className="text-gray-600 mb-4">
                  Support for fabrication units, engineering goods, and ancillary industries
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Manufacturing GST</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Input tax credit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Capital goods tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Export benefits</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Business Districts Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Supporting Trichy's Key Business Areas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <Factory className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">BHEL Township</h3>
                <p className="text-sm text-gray-600">
                  Heavy engineering and power equipment
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Gem className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Chathram Bus Stand</h3>
                <p className="text-sm text-gray-600">
                  Diamond and jewelry market hub
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Building className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Cantonment</h3>
                <p className="text-sm text-gray-600">
                  Commercial and business center
                </p>
              </Card>

              <Card className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Thillai Nagar</h3>
                <p className="text-sm text-gray-600">
                  Prime commercial district
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Local Areas Coverage */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Serving All Areas of Trichy
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                'Thillai Nagar',
                'Cantonment',
                'Srirangam',
                'KK Nagar',
                'Woraiyur',
                'Tennur',
                'Puthur',
                'Crawford',
                'Thennur',
                'Ponmalai',
                'Mannarpuram',
                'Ariyamangalam',
              ].map((area) => (
                <div key={area} className="bg-gray-50 p-3 rounded-lg text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-700">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Trichy CAs Choose PowerCA
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Perfect for managing BHEL vendor compliance and heavy industry contracts."
                </p>
                <div>
                  <p className="font-semibold">Industrial Excellence</p>
                  <p className="text-sm text-gray-600">Ideal for BHEL Township CAs</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Excellent features for diamond and jewelry trade GST compliance."
                </p>
                <div>
                  <p className="font-semibold">Jewelry Trade Ready</p>
                  <p className="text-sm text-gray-600">Perfect for Chathram Area</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Tamil interface helps our entire team adopt the software quickly."
                </p>
                <div>
                  <p className="font-semibold">Local Language</p>
                  <p className="text-sm text-gray-600">Supporting All Trichy CAs</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Elevate Your Trichy CA Practice with PowerCA
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join Trichy's progressive CAs using PowerCA for modern practice management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Trichy Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Call Trichy Team
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              தமிழில் முழு ஆதரவு (Complete Tamil Support)
            </p>
          </div>
        </section>
      </div>
    </>
  )
}