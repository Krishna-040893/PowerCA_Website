"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ChevronLeft, ChevronRight, Server, Database, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "CA Rajesh Kumar",
    firm: "Kumar & Associates",
    location: "Mumbai",
    rating: 5,
    content: "PowerCA has transformed how we manage our practice. The automation features alone save us 15+ hours every week. The compliance tracking is exceptional.",
    avatar: "/avatars/avatar-1.jpg",
    initials: "RK"
  },
  {
    name: "CA Priya Sharma",
    firm: "Sharma Tax Consultants",
    location: "Delhi",
    rating: 5,
    content: "The best investment we've made for our firm. Client management is now effortless, and the document management system is incredibly secure and organized.",
    avatar: "/avatars/avatar-2.jpg",
    initials: "PS"
  },
  {
    name: "CA Amit Patel",
    firm: "Patel & Co.",
    location: "Ahmedabad",
    rating: 5,
    content: "Outstanding software! The ROI calculator showed us potential savings, but the actual results exceeded our expectations. Highly recommend to all CA firms.",
    avatar: "/avatars/avatar-3.jpg",
    initials: "AP"
  },
  {
    name: "CA Sunita Reddy",
    firm: "Reddy Financial Services",
    location: "Bangalore",
    rating: 5,
    content: "PowerCA's customer support is phenomenal. The onboarding was smooth, and the team helped us migrate all our data seamlessly. It's been a game-changer.",
    avatar: "/avatars/avatar-4.jpg",
    initials: "SR"
  }
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Practicing Chartered Accountants Say
          </h2>
          <p className="text-xl text-gray-600">
            Don't just take our word for it. Here's what our clients have to say about PowerCA.
          </p>
        </motion.div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent-500 text-accent-500" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">
                        {testimonial.firm}, {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-gray-200">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent-500 text-accent-500" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 italic">
                  "{testimonials[currentIndex].content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage 
                      src={testimonials[currentIndex].avatar} 
                      alt={testimonials[currentIndex].name} 
                    />
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {testimonials[currentIndex].initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonials[currentIndex].firm}, {testimonials[currentIndex].location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2 items-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-primary-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-600 mb-6">Trusted by Chartered Accountants</p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
              <Server className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700 font-semibold">Client Server Application</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
              <Database className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700 font-semibold">Own Your Data</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700 font-semibold">Secure Application</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700 font-semibold">Stop Revenue Leakage</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}