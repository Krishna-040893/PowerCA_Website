"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      className="relative w-full max-w-[1200px] mx-auto"
    >
      {/* Glass morphism container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl glass-light">
        {/* Browser Chrome */}
        <div className="bg-gray-900/95 backdrop-blur-sm p-3 flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-800 rounded px-4 py-1 text-xs text-gray-300">
              app.powerca.com
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Welcome back, CA Sharma</h3>
              <p className="text-sm text-gray-600">Here's your practice overview</p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                This Month
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">34</p>
              <p className="text-xs text-orange-600 mt-1">5 due today</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">98.5%</p>
              <p className="text-xs text-green-600 mt-1">Excellent</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Revenue (Month)</p>
              <p className="text-2xl font-bold text-gray-900">₹12.4L</p>
              <p className="text-xs text-green-600 mt-1">+18% growth</p>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue Trend</h4>
              <div className="h-32 flex items-end justify-between gap-2">
                {[40, 65, 45, 75, 55, 80, 90].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Task Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GST Returns</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-primary-500" />
                    </div>
                    <span className="text-xs text-gray-500">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ITR Filing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-primary-500" />
                    </div>
                    <span className="text-xs text-gray-500">50%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Audit</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-primary-500" />
                    </div>
                    <span className="text-xs text-gray-500">33%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-400/20 via-secondary-400/20 to-accent-400/20 blur-3xl" />
    </motion.div>
  )
}