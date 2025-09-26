'use client'

import Link from 'next/link'
import {Button  } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 px-4 sm:px-0">
            Practice Management Solution for <br />
            <span className="text-blue-600">Professionals</span>{' '}
            <span className="text-gray-700">Chartered Accountants</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-4 sm:px-0">
            Streamline your CA practice with our comprehensive software suite
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/book-demo">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-sm font-medium">GST & ITR Filing</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-sm font-medium">Client Management</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-sm font-medium">Financial Reports</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-sm font-medium">Task Automation</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl p-6 border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">245</div>
                  <div className="text-sm text-gray-600">Active Clients</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">89</div>
                  <div className="text-sm text-gray-600">Returns Filed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-gray-600">Pending Tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}