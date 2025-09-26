'use client'

import {Card  } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Monitor, Server, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function ClientServerComparison() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Client - Server Model
          </h2>
          <p className="text-lg text-gray-600">
            Choose the deployment option that best fits your practice
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Desktop Client */}
          <Card className="p-8 relative hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 ml-4">Desktop Client</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Install PowerCA on your computer for offline access and maximum performance.
              Perfect for individual practitioners and small firms.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Works offline without internet</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Data stored locally on your system</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">One-time license fee</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Single user access</span>
              </li>
            </ul>

            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                Learn More
              </Button>
            </Link>
          </Card>

          {/* Server Model */}
          <Card className="p-8 relative hover:shadow-xl transition-shadow border-2 border-blue-200">
            <div className="absolute -top-3 right-6 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Recommended
            </div>

            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 ml-4">Server Model</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Cloud-based solution for multi-user access and real-time collaboration.
              Ideal for growing firms and teams.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Access from anywhere, anytime</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Real-time data synchronization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Automatic backups & updates</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <span className="text-gray-700">Multi-user collaboration</span>
              </li>
            </ul>

            <Link href="/book-demo">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </Link>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing the right solution?
          </p>
          <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
            Talk to our experts →
          </Link>
        </div>
      </div>
    </section>
  )
}