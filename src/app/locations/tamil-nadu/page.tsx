import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { MapPin, Users, Building2, Factory, Gem, Shirt, ShoppingBag, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'CA Software in Tamil Nadu - PowerCA for Chartered Accountants Across TN',
  description: 'PowerCA - Leading practice management software for Chartered Accountants across Tamil Nadu. Serving Chennai, Coimbatore, Madurai, Trichy, Salem, and more. Tamil language support.',
  keywords: 'CA software Tamil Nadu, chartered accountant software TN, CA practice management Tamil Nadu, GST software Tamil Nadu, tax software TN',
  openGraph: {
    title: 'PowerCA - CA Practice Management Software for Tamil Nadu',
    description: 'Complete practice management solution for Chartered Accountants across Tamil Nadu with Tamil language support.',
    images: ['/og-image.jpg'],
    locale: 'en_IN',
  },
  alternates: {
    canonical: 'https://powerca.in/locations/tamil-nadu',
  },
}

const cities = [
  {
    name: 'Chennai',
    href: '/locations/chennai',
    description: 'Capital city & commercial hub',
    icon: Building2,
    specialties: ['IT Services', 'Manufacturing', 'Export-Import'],
    areas: ['T. Nagar', 'Anna Nagar', 'Guindy', 'Porur']
  },
  {
    name: 'Coimbatore',
    href: '/locations/coimbatore',
    description: 'Manchester of South India',
    icon: Shirt,
    specialties: ['Textile Mills', 'Engineering', 'Pumps & Motors'],
    areas: ['RS Puram', 'Peelamedu', 'Gandhipuram', 'Saibaba Colony']
  },
  {
    name: 'Madurai',
    href: '/locations/madurai',
    description: 'Temple City & Trading Hub',
    icon: Building2,
    specialties: ['Temple Trusts', 'Trading', 'Jasmine Trade'],
    areas: ['KK Nagar', 'Anna Nagar', 'Mattuthavani', 'Goripalayam']
  },
  {
    name: 'Trichy',
    href: '/locations/trichy',
    description: 'Industrial & Diamond Hub',
    icon: Gem,
    specialties: ['BHEL', 'Heavy Industry', 'Diamond Trade'],
    areas: ['Thillai Nagar', 'Cantonment', 'Srirangam', 'BHEL Township']
  },
  {
    name: 'Salem',
    href: '/locations/salem',
    description: 'Steel City of Tamil Nadu',
    icon: Factory,
    specialties: ['Steel Industry', 'Textiles', 'Sago Manufacturing'],
    areas: ['Fairlands', 'Junction', 'Hasthampatti', 'Five Roads']
  },
  {
    name: 'Tiruppur',
    href: '/locations/tiruppur',
    description: 'Knitwear Capital of India',
    icon: Shirt,
    specialties: ['Garment Export', 'Knitwear', 'Textile Processing'],
    areas: ['Noyyal', 'Mangalam', 'Kumaran Road', 'Thennampalayam']
  },
  {
    name: 'Erode',
    href: '/locations/erode',
    description: 'Turmeric City & Textile Hub',
    icon: ShoppingBag,
    specialties: ['Turmeric Trade', 'Textiles', 'Handloom'],
    areas: ['Perundurai', 'Bhavani', 'Sathyamangalam', 'Gobichettipalayam']
  },
  {
    name: 'Vellore',
    href: '/locations/vellore',
    description: 'Healthcare & Leather Hub',
    icon: Building2,
    specialties: ['Healthcare', 'Leather Industry', 'Education'],
    areas: ['Katpadi', 'Sathuvachari', 'Gandhi Nagar', 'Fort']
  }
]

export default function TamilNaduPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 lg:px-8 pt-4">
          <Breadcrumb
            items={[
              { label: 'Locations', href: '/locations' },
              { label: 'Tamil Nadu', current: true }
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                CA Software for <span className="text-blue-600">Tamil Nadu</span>
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                PowerCA - Comprehensive practice management software for Chartered Accountants across Tamil Nadu
              </p>
              <p className="text-lg text-gray-600 mb-8">
                தமிழ்நாட்டில் உள்ள சார்ட்டர்ட் அக்கவுண்டன்ட்களுக்கான முழுமையான மென்பொருள்
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/book-demo">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book Tamil Nadu Demo
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline">
                    View Pricing Plans
                  </Button>
                </Link>
              </div>

              {/* State-wide Stats */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 font-semibold">8+ Major Cities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Tamil Language Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">TN GST Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features for Tamil Nadu */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Designed for Tamil Nadu's Business Environment
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Tamil Language Interface</h3>
                <p className="text-gray-600">
                  Complete Tamil language support with localized invoicing, reports, and user interface for seamless adoption.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">TN State GST Compliance</h3>
                <p className="text-gray-600">
                  Pre-configured for Tamil Nadu GST requirements with automatic updates for state-specific regulations.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Industry Specialization</h3>
                <p className="text-gray-600">
                  Specialized modules for textile, manufacturing, trading, temples, and service sectors prevalent in Tamil Nadu.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Multi-City Operations</h3>
                <p className="text-gray-600">
                  Manage practices across multiple Tamil Nadu cities with location-specific compliance and reporting.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Local Support Network</h3>
                <p className="text-gray-600">
                  Dedicated support teams across major TN cities with on-site training and assistance available.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-3">Export-Import Features</h3>
                <p className="text-gray-600">
                  Complete documentation support for TN's thriving export industries including textiles and engineering goods.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">
              PowerCA Across Tamil Nadu Cities
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Select your city to explore location-specific features and local support options
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cities.map((city) => {
                const Icon = city.icon
                return (
                  <Link key={city.name} href={city.href}>
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="flex items-start gap-4">
                        <Icon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{city.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{city.description}</p>

                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Key Industries:</p>
                            <div className="flex flex-wrap gap-1">
                              {city.specialties.map((specialty) => (
                                <span key={specialty} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-1">Areas Served:</p>
                            <p className="text-xs text-gray-600">
                              {city.areas.join(', ')}
                            </p>
                          </div>

                          <Button variant="link" className="p-0 mt-3 text-blue-600 hover:text-blue-700">
                            Learn More →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Industry Coverage */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Industries We Serve Across Tamil Nadu
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                'Textile & Garments',
                'Manufacturing',
                'IT & Software',
                'Healthcare',
                'Education',
                'Temple Trusts',
                'Trading',
                'Export-Import',
                'Real Estate',
                'Agriculture',
                'Jewelry',
                'Engineering',
              ].map((industry) => (
                <div key={industry} className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-700">{industry}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Transform Your Tamil Nadu CA Practice with PowerCA
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join progressive CAs across Tamil Nadu using PowerCA for modern practice management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo">
                <Button size="lg" variant="secondary">
                  Schedule Demo
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                  Contact TN Team
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-100 mt-6">
              முழு தமிழ் ஆதரவுடன் | Complete Tamil Language Support
            </p>
          </div>
        </section>
      </div>
    </>
  )
}