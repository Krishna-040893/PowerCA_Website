"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, CheckCircle } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Trusted by 5000+ CA Professionals
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Practice Management Solution for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Professionals</span>
              <span className="text-gray-700"> Chartered Accountants</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Streamline your practice with our comprehensive suite of tools designed specifically for CA firms.
              Manage clients, automate compliance, and grow your practice effortlessly.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">GST & ITR Filing</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">Client Management</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">Task Automation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">Document Portal</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg">
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-lg border-2">
                <Play className="mr-2 h-5 w-5" />
                Watch Video
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">5000+</span> Happy CA Firms
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-2">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8">
                {/* Mock Dashboard UI */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Client Overview</h3>
                    <span className="text-sm text-gray-500">This Month</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">245</div>
                      <div className="text-sm text-gray-500">Active Clients</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">89</div>
                      <div className="text-sm text-gray-500">Returns Filed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">12</div>
                      <div className="text-sm text-gray-500">Pending Tasks</div>
                    </div>
                  </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Today's Tasks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-blue-50 rounded">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                      <span className="text-sm">GST Return - ABC Corp</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-50 rounded">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                      <span className="text-sm">ITR Filing - John Doe</span>
                    </div>
                    <div className="flex items-center p-2 bg-yellow-50 rounded">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3" />
                      <span className="text-sm">Audit Report - XYZ Ltd</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
              Live Dashboard
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
              Real-time Updates
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}