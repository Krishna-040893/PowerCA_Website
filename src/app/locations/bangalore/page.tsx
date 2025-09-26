import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Users, TrendingUp, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Bangalore - PowerCA Practice Management for Tech-Savvy CAs',
  description: 'PowerCA - Modern practice management software for Chartered Accountants in Bangalore. Specialized for tech startups and IT companies. Complete GST and compliance solution. Book demo today.',
  keywords: 'CA software Bangalore, chartered accountant software Bengaluru, CA practice management Bangalore, startup accounting software, IT company CA software Bangalore',
  openGraph: {
    title: 'PowerCA - Modern CA Practice Management Software in Bangalore',
    description: 'Specialized features for Bangalore CAs handling startup and IT company compliance.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/bangalore',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Bangalore',
  description: 'Practice management software for Chartered Accountants in Bangalore',
  url: 'https://powerca.in/locations/bangalore',
  areaServed: {
    '@type': 'City',
    name: 'Bangalore',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bangalore',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
}

export default function BangalorePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="pt-20 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                CA Software Built for <span className="text-blue-600">Bangalore's</span> Tech Economy
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Designed specifically for Chartered Accountants in India's Silicon Valley. Perfect for startup compliance and IT company accounting
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Bangalore Demo
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline">
                    View Startup Plans
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">Startup-Ready Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">IT Company Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">ESOP Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Built for Bangalore's Startup Ecosystem
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Startup Compliance Suite</h3>
                <p className="text-gray-600 mb-4">
                  Specialized features for startups, IT companies, and tech businesses in Bangalore
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">ESOP management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Foreign remittance tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Angel tax compliance</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Karnataka Tax Integration</h3>
                <p className="text-gray-600 mb-4">
                  Seamless Karnataka GST compliance with automated e-filing and reconciliation
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Karnataka GST portal sync</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Professional tax automation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SEZ compliance</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Tech Hub Support</h3>
                <p className="text-gray-600 mb-4">
                  Tech-savvy support team understanding Bangalore's unique business environment
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">API integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Cloud-first approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Startup office visits</span>
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
              What Bangalore CAs Can Achieve
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Perfect for managing multiple startup clients. Our ESOP module is designed for tech companies."
                </p>
                <div>
                  <p className="font-semibold">Startup Feature</p>
                  <p className="text-sm text-gray-600">Ideal for Koramangala & HSR Layout Firms</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Built to handle foreign remittances and IT company compliance seamlessly."
                </p>
                <div>
                  <p className="font-semibold">Tech Compliance</p>
                  <p className="text-sm text-gray-600">Perfect for Whitefield & Electronic City Practices</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "API integration capabilities to connect with your startup clients' tech stacks."
                </p>
                <div>
                  <p className="font-semibold">Tech Integration</p>
                  <p className="text-sm text-gray-600">Designed for Tech Park CAs</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Power Your Bangalore Practice with PowerCA
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial and experience modern practice management designed for tech-savvy CAs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Book Bangalore Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Talk to Tech Team
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}