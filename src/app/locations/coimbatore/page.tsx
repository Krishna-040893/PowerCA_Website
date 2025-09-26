import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckCircle2, TrendingUp, Shield, Factory, Shirt, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Coimbatore - PowerCA for Tamil Nadu Chartered Accountants',
  description: 'PowerCA - Professional practice management software for Chartered Accountants in Coimbatore. Specialized for textile, manufacturing, and engineering industries. Tamil language support. Book demo today.',
  keywords: 'CA software Coimbatore, chartered accountant software Coimbatore, CA practice management Coimbatore, GST software Coimbatore, tax software Coimbatore, textile industry accounting',
  openGraph: {
    title: 'PowerCA - CA Practice Management Software in Coimbatore',
    description: 'Transform your Coimbatore CA practice with PowerCA. Built for textile and manufacturing sector compliance.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/coimbatore',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Coimbatore',
  description: 'Practice management software for Chartered Accountants in Coimbatore',
  url: 'https://powerca.in/locations/coimbatore',
  areaServed: {
    '@type': 'City',
    name: 'Coimbatore',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Coimbatore',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
}

export default function CoimbatorePage() {
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
              { label: 'Coimbatore', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                CA Software for <span className="text-blue-600">Coimbatore's</span> Manchester of South India
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                PowerCA - Designed for Chartered Accountants serving Coimbatore's textile, manufacturing, and engineering industries. Complete Tamil language support included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Coimbatore Demo (கோயம்புத்தூர்)
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
                  <Shirt className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">Textile Industry Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Manufacturing Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">Tamil Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tailored for Coimbatore's Business Landscape
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Textile Industry Specialization</h3>
                <p className="text-gray-600 mb-4">
                  Complete features for Coimbatore's textile mills, garment exporters, and yarn manufacturers
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Textile GST codes & HSN</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Export documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Job work compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">RoSCTL scheme support</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Engineering & Pump Industry</h3>
                <p className="text-gray-600 mb-4">
                  Specialized modules for Coimbatore's pump, motor, and foundry industries
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Engineering GST rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Capital goods tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">MSME compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Foundry sector billing</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Tamil Language Interface</h3>
                <p className="text-gray-600 mb-4">
                  Complete Tamil language support for seamless adoption across your team
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tamil UI (தமிழ்)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tamil invoice templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tamil support team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Local training sessions</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Industry Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Serving Coimbatore's Key Industries
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <Shirt className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Textile Mills</h3>
                <p className="text-sm text-gray-600">
                  Spinning mills, weaving units, and garment exporters
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Factory className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Manufacturing</h3>
                <p className="text-sm text-gray-600">
                  Pumps, motors, wet grinders, and machinery
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Home className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Real Estate</h3>
                <p className="text-sm text-gray-600">
                  Builders, developers, and property management
                </p>
              </Card>

              <Card className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">IT & Services</h3>
                <p className="text-sm text-gray-600">
                  IT parks, service sector, and startups
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Coimbatore CAs Choose PowerCA
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Perfect for managing textile industry clients with complex GST requirements and export documentation."
                </p>
                <div>
                  <p className="font-semibold">Textile Excellence</p>
                  <p className="text-sm text-gray-600">Ideal for RS Puram & Peelamedu CAs</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Tamil language support ensures our entire team can use the software effectively."
                </p>
                <div>
                  <p className="font-semibold">Local Language</p>
                  <p className="text-sm text-gray-600">Perfect for Gandhipuram & Saibaba Colony</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Excellent features for pump and motor manufacturing industry compliance."
                </p>
                <div>
                  <p className="font-semibold">Manufacturing Ready</p>
                  <p className="text-sm text-gray-600">Supporting SIDCO & Industrial Areas</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Local Areas Coverage */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Serving All Areas of Coimbatore
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                'RS Puram',
                'Peelamedu',
                'Gandhipuram',
                'Saibaba Colony',
                'Race Course',
                'Avinashi Road',
                'Singanallur',
                'Saravanampatti',
                'Ganapathy',
                'Vadavalli',
                'Thudiyalur',
                'Kuniyamuthur',
              ].map((area) => (
                <div key={area} className="bg-white p-3 rounded-lg text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-700">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Transform Your Coimbatore CA Practice Today
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join progressive CAs in Coimbatore using PowerCA for modern practice management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Coimbatore Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Call Coimbatore Team
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              தமிழில் ஆதரவு கிடைக்கும் (Support available in Tamil)
            </p>
          </div>
        </section>
      </div>
    </>
  )
}