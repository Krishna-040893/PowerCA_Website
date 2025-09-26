import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckCircle2, TrendingUp, ShoppingBag, Flower2, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Madurai - PowerCA for Temple City Chartered Accountants',
  description: 'PowerCA - Practice management software for Chartered Accountants in Madurai. Specialized for trading, textiles, and temple trusts. Tamil language support. Book your Madurai demo today.',
  keywords: 'CA software Madurai, chartered accountant software Madurai, CA practice management Madurai, GST software Madurai, tax software Madurai, temple trust accounting',
  openGraph: {
    title: 'PowerCA - CA Practice Management Software in Madurai',
    description: 'Streamline your Madurai CA practice with PowerCA. Built for trading businesses and temple trust compliance.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/madurai',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'PowerCA Madurai',
  description: 'Practice management software for Chartered Accountants in Madurai',
  url: 'https://powerca.in/locations/madurai',
  areaServed: {
    '@type': 'City',
    name: 'Madurai',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Madurai',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
}

export default function MaduraiPage() {
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
              { label: 'Madurai', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                CA Software for <span className="text-blue-600">Madurai</span> - The Temple City
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                PowerCA - Designed for Chartered Accountants in Madurai serving temples, trusts, trading businesses, and textile merchants. Complete Tamil support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Madurai Demo (மதுரை)
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
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">Temple Trust Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Trading Focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flower2 className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">Jasmine Trade Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tailored for Madurai's Unique Business Environment
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Temple & Trust Accounting</h3>
                <p className="text-gray-600 mb-4">
                  Specialized features for Madurai's numerous temples and religious trusts
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">80G & 12A compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Donation tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">FCRA compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Trust deed management</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Trading & Wholesale</h3>
                <p className="text-gray-600 mb-4">
                  Complete features for Madurai's vibrant trading and wholesale markets
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Wholesale GST billing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Multi-state GST</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Jasmine trade billing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Agricultural produce GST</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Textile & Handloom</h3>
                <p className="text-gray-600 mb-4">
                  Features for Madurai's famous Sungudi saree and textile businesses
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Handloom GST rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Cotton trade compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Textile export docs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Job work tracking</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Business Areas Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Supporting Madurai's Business Districts
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Temple Areas</h3>
                <p className="text-sm text-gray-600">
                  Meenakshi Temple vicinity & surrounding trusts
                </p>
              </Card>

              <Card className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Mattuthavani</h3>
                <p className="text-sm text-gray-600">
                  Vegetable & fruit wholesale market
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Flower2 className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Flower Market</h3>
                <p className="text-sm text-gray-600">
                  Jasmine and flower trading hub
                </p>
              </Card>

              <Card className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">KK Nagar</h3>
                <p className="text-sm text-gray-600">
                  Commercial and business center
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Local Areas Coverage */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Serving All Areas of Madurai
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                'Anna Nagar',
                'KK Nagar',
                'Goripalayam',
                'Tallakulam',
                'Villapuram',
                'Simmakkal',
                'Mattuthavani',
                'Sellur',
                'Thirunagar',
                'Bibikulam',
                'Ellis Nagar',
                'Avaniyapuram',
              ].map((area) => (
                <div key={area} className="bg-gray-50 p-3 rounded-lg text-center shadow-sm">
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
              Modernize Your Madurai CA Practice with PowerCA
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join Madurai's progressive CAs using PowerCA for efficient practice management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Madurai Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Call Madurai Team
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              தமிழ் ஆதரவுடன் (With Tamil Support)
            </p>
          </div>
        </section>
      </div>
    </>
  )
}