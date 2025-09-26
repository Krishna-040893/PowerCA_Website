'use client'

import { TrendingUp, Clock, Shield, Users, BarChart3, Zap, Award, HeadphonesIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Increase Productivity',
      description: 'Automate repetitive tasks and focus on high-value client work',
      metric: '40% time saved'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Streamline workflows and reduce manual data entry',
      metric: '5+ hours/week'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Bank-level encryption and secure data storage',
      metric: '256-bit SSL'
    },
    {
      icon: Users,
      title: 'Better Client Service',
      description: 'Provide real-time updates and self-service portals',
      metric: '95% satisfaction'
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with comprehensive analytics',
      metric: 'Real-time reports'
    },
    {
      icon: Zap,
      title: 'Faster Processing',
      description: 'Quick filing and instant document generation',
      metric: '10x faster'
    },
    {
      icon: Award,
      title: 'Compliance Ready',
      description: 'Stay updated with latest tax laws and regulations',
      metric: '100% compliant'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Expert help whenever you need it',
      metric: '< 2hr response'
    }
  ]

  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Benefits of PowerCA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your practice with measurable improvements in efficiency and client satisfaction
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3">
                {benefit.description}
              </p>

              <div className="text-sm font-medium text-blue-600">
                {benefit.metric}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <div className="grid lg:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Happy CA Firms</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50L+</div>
              <div className="text-gray-600">Returns Filed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}