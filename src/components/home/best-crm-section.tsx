'use client'

import { CheckCircle } from 'lucide-react'

export function BestCRMSection() {
  const features = [
    'Automated compliance tracking',
    'Real-time financial reporting',
    'Secure document management',
    'Client portal access',
    'Multi-user collaboration',
    'Mobile app support'
  ]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Best Advancing Chartered <br />
              Accountant CRM
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              PowerCA is the most comprehensive practice management solution designed
              specifically for Chartered Accountants. Manage your entire practice from
              client onboarding to compliance delivery with our integrated platform.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">60%</div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">3x</div>
                <div className="text-sm text-gray-600">ROI Increase</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Dashboard mockup */}
                <div className="bg-gray-100 h-4 rounded mb-4 w-3/4"></div>
                <div className="bg-gray-100 h-4 rounded mb-6 w-1/2"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded p-4">
                    <div className="bg-blue-200 h-8 w-8 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-full"></div>
                  </div>
                  <div className="bg-green-50 rounded p-4">
                    <div className="bg-green-200 h-8 w-8 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-full"></div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="bg-gray-200 h-3 rounded w-1/3"></div>
                    <div className="bg-green-400 h-3 rounded w-12"></div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="bg-gray-200 h-3 rounded w-1/3"></div>
                    <div className="bg-blue-400 h-3 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}