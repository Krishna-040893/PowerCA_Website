"use client"

import { TrendingUp, Clock, Shield, Users, Zap, Award } from "lucide-react"

export function BenefitsOfPowerCA() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Productivity",
      value: "40%",
      description: "Average productivity increase"
    },
    {
      icon: Clock,
      title: "Save Time",
      value: "5+ hrs",
      description: "Saved per week"
    },
    {
      icon: Shield,
      title: "Data Security",
      value: "100%",
      description: "Secure & encrypted"
    },
    {
      icon: Users,
      title: "Client Satisfaction",
      value: "95%",
      description: "Happy clients"
    },
    {
      icon: Zap,
      title: "Faster Processing",
      value: "10x",
      description: "Faster than manual"
    },
    {
      icon: Award,
      title: "Compliance",
      value: "100%",
      description: "Always compliant"
    }
  ]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Benefits of PowerCA
          </h2>
          <p className="text-lg text-gray-600">
            Measurable improvements for your CA practice
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {benefit.value}
              </div>
              <p className="text-sm text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-blue-100">CA Firms</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50L+</div>
              <div className="text-blue-100">Returns Filed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}