"use client"

import { Card } from "@/components/ui/card"
import { FileText, Users, BarChart3, Calendar, Shield, Zap } from "lucide-react"

export function StreamlineSection() {
  const features = [
    {
      icon: FileText,
      title: "Document Management",
      description: "Organize and access all client documents in one secure location"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Give clients secure access to their documents and reports"
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Generate comprehensive financial reports with just a few clicks"
    },
    {
      icon: Calendar,
      title: "Compliance Calendar",
      description: "Never miss a deadline with automated compliance reminders"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Bank-level encryption to keep your client data safe"
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Automate repetitive tasks and focus on what matters"
    }
  ]

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Streamline your practice
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage your CA practice efficiently in one integrated platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}