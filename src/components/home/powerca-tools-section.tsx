"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function PowerCAToolsSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            PowerCA Tools CA
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Comprehensive tools designed for Chartered Accountants
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Everything you need to manage your CA practice
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-gray-600">Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Cloud Based</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">5000+</div>
                <div className="text-sm text-gray-600">CA Firms</div>
              </div>
            </div>

            <Link href="/features">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Explore All Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}