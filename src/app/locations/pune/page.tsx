import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckCircle2, Users, TrendingUp, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Pune - PowerCA Practice Management for Maharashtra CAs',
  description: 'PowerCA - Modern practice management software for Chartered Accountants in Pune. IT hub and manufacturing sector expertise. Complete GST and compliance solution. Book demo today.',
  keywords: 'CA software Pune, chartered accountant software Pune, CA practice management Pune, GST software Pune, tax software Maharashtra',
  openGraph: {
    title: 'PowerCA - Professional CA Practice Management Software in Pune',
    description: 'Optimize your Pune CA practice with PowerCA. Built for IT companies and manufacturing sector compliance.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/pune',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Pune',
  description: 'Practice management software for Chartered Accountants in Pune',
  url: 'https://powerca.in/locations/pune',
  areaServed: {
    '@type': 'City',
    name: 'Pune',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
}

export default function PunePage() {
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
              { label: 'Pune', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Smart CA Software for <span className="text-blue-600">Pune's</span> Growing Economy
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Designed for Chartered Accountants in Pune's IT and manufacturing hubs. Complete practice management with Maharashtra compliance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Pune Demo
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
                  <span className="text-gray-700 font-semibold">IT Park Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Manufacturing Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">MH GST Expert</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Built for Pune's Diverse Business Landscape
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">IT Hub Specialization</h3>
                <p className="text-gray-600 mb-4">
                  Optimized for Pune's IT parks including Hinjewadi, Kharadi, and Magarpatta
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Software export compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">STPI documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">IT company GST handling</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Manufacturing Excellence</h3>
                <p className="text-gray-600 mb-4">
                  Special features for Pune's automotive and engineering industries
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Auto industry compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Engineering GST codes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">MIDC area support</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Education Sector Tools</h3>
                <p className="text-gray-600 mb-4">
                  Features for managing educational institution accounts and compliance
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">80G documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">12A registration support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Educational trust filing</span>
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
              Why Pune CAs Choose PowerCA
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Perfect for managing IT company clients in Hinjewadi and Kharadi tech parks."
                </p>
                <div>
                  <p className="font-semibold">IT Sector Excellence</p>
                  <p className="text-sm text-gray-600">Ideal for Hinjewadi & Kharadi Practices</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Comprehensive features for automotive and engineering sector compliance."
                </p>
                <div>
                  <p className="font-semibold">Manufacturing Ready</p>
                  <p className="text-sm text-gray-600">Perfect for MIDC & Chakan Area CAs</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Marathi language support and local expertise make it perfect for Pune."
                </p>
                <div>
                  <p className="font-semibold">Local Support</p>
                  <p className="text-sm text-gray-600">Available Across Pune</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Elevate Your Pune Practice with PowerCA
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Experience practice management designed for Pune's dynamic business environment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Pune Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Contact Pune Team
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}