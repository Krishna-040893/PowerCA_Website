"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Calculator, BarChart3, Users, Shield, Clock } from "lucide-react"
import Link from "next/link"

export function PowerCATools() {
  const tools = [
    {
      icon: FileText,
      title: "ITR Filing",
      description: "Automated income tax return filing"
    },
    {
      icon: Calculator,
      title: "GST Returns",
      description: "Simplified GST compliance"
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Comprehensive reporting tools"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Secure client collaboration"
    },
    {
      icon: Shield,
      title: "Audit Tools",
      description: "Streamlined audit procedures"
    },
    {
      icon: Clock,
      title: "Task Manager",
      description: "Efficient task tracking"
    }
  ]

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Professional Tools
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            PowerCA Tools for CA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools designed specifically for Chartered Accountants to manage their practice efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {tool.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/features">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Explore All Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}