'use client'

import Link from 'next/link'
import {Button  } from '@/components/ui/button'
import {Card, CardContent  } from '@/components/ui/card'
import {Badge  } from '@/components/ui/badge'
import {Star, DollarSign, Users, TrendingUp,
  Target,
  Zap,
  Shield, CheckCircle, ArrowRight,
  Handshake,
  Calculator,
  BarChart3,
  Gift
 } from 'lucide-react'

export default function AffiliateProgramPage() {
  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: 'Earn 10% Commission',
      description: 'Get 10% commission on every successful referral conversion'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Grow Your Network',
      description: 'Build valuable professional connections while earning'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: 'Track Performance',
      description: 'Real-time dashboard to monitor referrals and earnings'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'Quick Payouts',
      description: 'Monthly commission payments directly to your account'
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: 'Trusted Platform',
      description: "Partner with India's leading CA practice management solution"
    },
    {
      icon: <Target className="h-8 w-8 text-indigo-500" />,
      title: 'Marketing Support',
      description: 'Access to marketing materials and dedicated support'
    }
  ]

  const features = [
    'Unique referral codes and tracking links',
    'Real-time analytics and reporting',
    'Monthly commission statements',
    'Dedicated affiliate support team',
    'Marketing materials and resources',
    'Performance-based bonus incentives'
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Register as Affiliate',
      description: 'Sign up with your details and get approved by our team'
    },
    {
      step: '2',
      title: 'Get Your Referral Code',
      description: 'Receive unique tracking codes and marketing materials'
    },
    {
      step: '3',
      title: 'Promote PowerCA',
      description: 'Share with your network using your referral links'
    },
    {
      step: '4',
      title: 'Earn Commissions',
      description: 'Get paid 10% for every successful conversion'
    }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Tally Partner',
      location: 'Mumbai',
      quote: "PowerCA affiliate program has been a game-changer. I've earned ₹2.5L in commissions in just 6 months!",
      earnings: '₹2.5L+ earned'
    },
    {
      name: 'Priya Sharma',
      role: 'Business Consultant',
      location: 'Delhi',
      quote: 'The tracking system is excellent and payments are always on time. Highly recommend this program.',
      earnings: '₹1.8L+ earned'
    },
    {
      name: 'Amit Patel',
      role: 'Software Reseller',
      location: 'Ahmedabad',
      quote: "My clients love PowerCA and I love the commissions. It's a win-win for everyone!",
      earnings: '₹3.2L+ earned'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center overflow-hidden bg-white">
        {/* Container with padding for the background image */}
        <div className="absolute inset-0 px-12">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: 'url(/images/hero-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Optional overlay for better text readability */}
            <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Join Our Partner Network
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
              PowerCA Affiliate Program
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
              Partner with India's leading CA practice management solution and earn
              <span className="text-blue-600 font-semibold"> 10% commission </span>
              on every successful referral
            </p>

            {/* Value Proposition */}
            <div className="mb-12">
              <div className="flex items-center justify-center text-gray-500 text-sm md:text-base">
                <div className="flex items-center">
                  <div className="w-8 h-px bg-gray-300 mr-3"></div>
                  <span className="whitespace-nowrap">10% Commission</span>
                  <span className="mx-3 text-gray-400">•</span>
                  <span className="whitespace-nowrap">₹50L+ Paid</span>
                  <span className="mx-3 text-gray-400">•</span>
                  <span className="whitespace-nowrap">500+ Partners</span>
                  <div className="w-8 h-px bg-gray-300 ml-3"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/affiliate-program/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px]"
              >
                <span>Join as Affiliate</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-12 py-20">
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 py-20">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Partner with PowerCA?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join hundreds of successful partners earning substantial commissions
                by promoting India's most trusted CA software
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4 flex justify-center">{benefit.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in 4 simple steps and begin earning commissions immediately
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
                {index < howItWorks.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mt-6 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We provide all the tools and support you need to maximize your
                earnings as a PowerCA affiliate partner.
              </p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                asChild
              >
                <Link href="/affiliate-program/register">
                  Start Earning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <Card className="p-8">
                <div className="text-center mb-6">
                  <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Affiliate Dashboard Preview
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Total Earnings</span>
                    <span className="text-2xl font-bold text-green-600">₹45,650</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Active Referrals</span>
                    <span className="text-2xl font-bold text-blue-600">23</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Conversion Rate</span>
                    <span className="text-2xl font-bold text-purple-600">18.5%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our top-performing affiliates who are earning substantial
              commissions with PowerCA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="mb-4">
                    <Badge className="bg-green-100 text-green-800">
                      {testimonial.earnings}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Calculator */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Earnings Calculator
            </h2>
            <p className="text-xl text-gray-600">
              See how much you can earn as a PowerCA affiliate
            </p>
          </div>

          <Card className="p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">₹59,500</div>
                <div className="text-gray-600">PowerCA Annual Plan</div>
              </div>
              <div>
                <Gift className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-600 mb-2">₹5,950</div>
                <div className="text-gray-600">Your Commission (10%)</div>
              </div>
              <div>
                <Handshake className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-600 mb-2">₹59,500</div>
                <div className="text-gray-600">10 Referrals/Month</div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg text-center">
              <div className="text-lg text-gray-700 mb-2">
                Potential Monthly Earnings:
              </div>
              <div className="text-4xl font-bold text-blue-600">
                ₹59,500
              </div>
              <div className="text-gray-600 mt-2">
                Based on 10 referrals per month
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-12 py-20">
        <div className="relative rounded-2xl overflow-hidden" style={{
          backgroundImage: 'url(/images/streamline-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-blue-600/90"></div>
          <div className="relative z-10 py-20">
            <div className="container mx-auto max-w-4xl text-center px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join our affiliate program today and start earning commissions
                from your first referral. No joining fees, no hidden costs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/affiliate-program/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[200px]"
                >
                  <span>Register as Affiliate</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transition-all duration-200 min-w-[200px]"
                >
                  Contact Us
                </Link>
              </div>

              <div className="mt-12 text-blue-100 text-center">
                <p className="mb-2">Questions? Email us at</p>
                <a
                  href="mailto:affiliates@powerca.in"
                  className="text-white font-semibold hover:underline"
                >
                  affiliates@powerca.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}