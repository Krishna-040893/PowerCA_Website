"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { 
  Users, 
  FileText, 
  Folder, 
  Receipt, 
  CheckSquare, 
  BarChart,
  Shield,
  Clock,
  Globe,
  Zap,
  TrendingUp,
  Award
} from "lucide-react"
import { featuresConfig } from "@/config/features"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const iconMap: { [key: string]: any } = {
  Users,
  FileText,
  Folder,
  Receipt,
  CheckSquare,
  BarChart,
}

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="text-primary-600"> Manage Your Practice</span>
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive tools designed specifically for Chartered Accountants to streamline operations, ensure compliance, and accelerate growth.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuresConfig.mainFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon] || FileText
            
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-white group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                      <Icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Why CA Firms Choose PowerCA
              </h3>
              <p className="text-primary-100 mb-6">
                Join thousands of progressive CA firms who have transformed their practice with our comprehensive solution.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm">Save 10+ hours weekly with automation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm">Bank-grade security with 256-bit encryption</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm">Access from anywhere, anytime</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm">Lightning-fast performance</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">40%</p>
                <p className="text-primary-100 text-sm">Revenue Growth</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">500+</p>
                <p className="text-primary-100 text-sm">CA Firms</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Award className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">99.9%</p>
                <p className="text-primary-100 text-sm">Uptime SLA</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Shield className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">100%</p>
                <p className="text-primary-100 text-sm">Compliance</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}