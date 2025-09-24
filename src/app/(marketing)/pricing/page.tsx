"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Monitor, Calendar, Check, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.06]">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #1D91EB 1px, transparent 1px),
                  linear-gradient(to bottom, #1D91EB 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
          </div>
          <div className="absolute inset-0 opacity-[0.04]">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle, #1BAF69 1.5px, transparent 1.5px)`,
                backgroundSize: '30px 30px',
                backgroundPosition: '0 0, 15px 15px'
              }}
            />
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200/50 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-100/40 to-secondary-100/40 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-1.5">
              LIMITED TIME OFFER
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
              Launch Offer
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-600">
              Get PowerCA at{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Zero Software Cost
              </span>
            </p>
          </motion.div>

          {/* Pricing Information Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl mx-auto mb-12"
          >
            <div className="glass-light rounded-2xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Regular Price</p>
                  <p className="text-3xl font-bold text-gray-400 line-through">₹1,00,000</p>
                  <p className="text-sm text-gray-500">+ Applicable Taxes</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-green-600 mb-2">Launch Offer</p>
                  <p className="text-3xl font-bold text-green-600">FREE Software</p>
                  <p className="text-sm text-gray-600">Only pay for implementation</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">What's Included Until March 2026:</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Server Installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Client Installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Complete Training</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Ongoing Support</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 pt-2">
                  <span className="font-medium">Implementation & Support Cost:</span> ₹22,000 only
                </p>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Limited Time:</span> This offer may be withdrawn at any time without prior notice.
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      After March 2026: Annual subscription at 0.25% of turnover
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* View PDF Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-16"
          >
            <p className="text-gray-600 mb-4">Refer Power CA Pricing Policy Document</p>
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 group"
              asChild
            >
              <Link href="/pricing-policy.pdf" target="_blank">
                <FileText className="w-5 h-5 mr-2" />
                View PDF
              </Link>
            </Button>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Special Launch Offer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="h-full rounded-2xl glass-light border-2 border-primary-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="p-8">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-primary-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Power CA</h3>
                  <p className="text-center text-primary-600 font-medium mb-8">(Special Launch Offer)</p>
                  
                  <div className="text-center mb-8">
                    <p className="text-5xl font-bold text-green-600 mb-2">FREE</p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <p className="text-sm text-center text-gray-600">
                      <span className="text-primary-600">※</span> Refer to the Note
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Badge className="bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 border-primary-200 px-4 py-2">
                      Be an Early Bird
                    </Badge>
                    <p className="text-sm text-gray-600 mt-3">to Enjoy the Offer</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Installation & Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 shadow-lg">
                  LAUNCH OFFER
                </Badge>
              </div>
              <div className="h-full rounded-2xl glass-primary border-2 border-primary-400 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
                <div className="p-8">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                    <Monitor className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Power CA</h3>
                  <p className="text-center text-gray-700 font-medium mb-2">Installation,</p>
                  <p className="text-center text-gray-700 font-medium mb-8">Implementation & Support till Mar'26</p>
                  
                  <p className="text-center text-sm text-gray-500 mb-6">(Tax Applicable)</p>
                  
                  <div className="text-center mb-8">
                    <p className="text-lg text-gray-600">₹</p>
                    <p className="text-5xl font-bold text-primary-600">22,000</p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg"
                    asChild
                  >
                    <Link href="/checkout">
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Annual Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative"
            >
              <div className="h-full rounded-2xl glass-light border-2 border-secondary-200 overflow-hidden hover:shadow-2xl hover:border-secondary-300 transition-all duration-300">
                <div className="p-8">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-secondary-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Power CA</h3>
                  <p className="text-center text-secondary-600 font-medium mb-8">Annual Subscription</p>
                  
                  <p className="text-center text-sm text-gray-500 mb-6 italic">
                    Maximum support, minimum recurring<br />
                    cost for your Practice Administration
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="text-center">
                      <p className="text-gray-700">
                        Annual Fees is <span className="font-bold text-2xl text-secondary-600">0.25%</span>
                      </p>
                      <p className="text-gray-700">of your turnover</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-gray-600">No fee for First Year</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-gray-600">Renewal every February</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}