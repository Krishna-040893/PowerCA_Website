"use client"

import { FileText, Users, Calculator, BarChart3, Clock, Shield } from "lucide-react"

export function StreamlinePractice() {
  const features = [
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized document storage"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Secure client collaboration"
    },
    {
      icon: Calculator,
      title: "Tax Calculations",
      description: "Automated tax computations"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time business insights"
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Billable hours management"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "256-bit encryption"
    }
  ]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Streamline your practice
          </h2>
          <p className="text-lg text-gray-600">
            All-in-one solution for modern CA firms
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}