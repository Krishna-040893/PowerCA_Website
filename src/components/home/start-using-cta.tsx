"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export function StartUsingCTA() {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="container mx-auto max-w-7xl text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Start using Power CA today
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Join thousands of CA professionals who trust PowerCA
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/book-demo">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}