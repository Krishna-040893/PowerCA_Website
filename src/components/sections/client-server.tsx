'use client'

import {Card  } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Monitor, Server, Cloud, Shield, Zap, Users } from 'lucide-react'
import Link from 'next/link'

export function ClientServerModel() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Client - Server Model
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible deployment options to suit your firm's needs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client Model */}
          <Card className="p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 ml-4">Desktop Client</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Install PowerCA directly on your computer for offline access and maximum performance
            </p>

            <div className="space-y-3">
              <div className="flex items-start">
                <Zap className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Fast Performance</h4>
                  <p className="text-sm text-gray-600">Runs directly on your machine for instant response</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Data Security</h4>
                  <p className="text-sm text-gray-600">Your data stays on your local system</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Single User</h4>
                  <p className="text-sm text-gray-600">Perfect for individual practitioners</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Server Model */}
          <Card className="p-8 hover:shadow-xl transition-shadow border-2 border-blue-200">
            <div className="absolute -top-3 right-6 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
              Recommended
            </div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 ml-4">Server Model</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Deploy on your server for multi-user access and centralized data management
            </p>

            <div className="space-y-3">
              <div className="flex items-start">
                <Cloud className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Multi-User Access</h4>
                  <p className="text-sm text-gray-600">Team collaboration with role-based permissions</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Centralized Data</h4>
                  <p className="text-sm text-gray-600">Single source of truth for all your data</p>
                </div>
              </div>
              <div className="flex items-start">
                <Zap className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Anywhere Access</h4>
                  <p className="text-sm text-gray-600">Work from office, home, or on the go</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Not sure which model is right for you?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-white rounded-full hover:opacity-90 transition-opacity px-8"
              style={{ backgroundColor: '#155dfc' }}
              asChild
            >
              <Link href="/checkout">Book Demo</Link>
            </Button>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Talk to our experts →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}