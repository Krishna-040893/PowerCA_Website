"use client"

import { motion } from "framer-motion"
import { 
  FileText, 
  Receipt, 
  BarChart3,
  Users,
  Calculator,
  UserCheck,
  Search,
  Edit,
  DollarSign,
  TrendingUp,
  Building,
  PieChart,
  Clock,
  Shield,
  Zap,
  Globe,
  Award
} from "lucide-react"

const features = [
  {
    title: "Job Card Management",
    description: "Comprehensive job management with intuitive dashboard, advanced search, and seamless edit functions for efficient workflow control.",
    icon: FileText,
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    title: "Billing Module", 
    description: "Streamline invoicing with automated billing, payment tracking, and GST compliance.",
    icon: Receipt,
    className: "col-span-1",
    gradient: "from-green-500/10 to-emerald-500/10",
  },
  {
    title: "Financial Statements",
    description: "Generate accurate financial statements, balance sheets, and P&L reports with real-time data.",
    icon: BarChart3,
    className: "col-span-1",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    title: "Clients Module",
    description: "Centralized client management with detailed profiles, documents, and communication history.",
    icon: Users,
    className: "col-span-1 md:col-span-2",
    gradient: "from-orange-500/10 to-red-500/10",
  },
  {
    title: "Costing Module",
    description: "Track project costs and analyze profitability with detailed analytics.",
    icon: Calculator,
    className: "col-span-1",
    gradient: "from-indigo-500/10 to-purple-500/10",
  },
  {
    title: "CRM Module",
    description: "Build stronger client relationships with integrated CRM featuring lead tracking and engagement analytics.",
    icon: UserCheck,
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    gradient: "from-teal-500/10 to-blue-500/10",
  }
]

interface BentoCardProps {
  title: string
  description: string
  icon: any
  className?: string
  gradient?: string
  delay?: number
}

const BentoCard = ({ title, description, icon: Icon, className = "", gradient = "", delay = 0 }: BentoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl glass group cursor-pointer ${className}`}
    >      
      {/* Gradient overlay for hover effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-all duration-500 rounded-2xl`} />
      
      {/* Content */}
      <div className="relative p-6 md:p-8 h-full flex flex-col">
        {/* Icon with animation */}
        <motion.div 
          className="mb-4"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex p-3 rounded-lg bg-white/80 shadow-lg">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        </motion.div>
        
        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed flex-grow">
          {description}
        </p>
        
        {/* Interactive element */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center text-sm text-primary-600 font-medium">
            <span>Learn more</span>
            <motion.svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  )
}

export function BentoFeaturesSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Empower Your Practice with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Power CA
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Comprehensive modules designed to streamline every aspect of your CA practice
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <BentoCard
              key={feature.title}
              {...feature}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-primary-600">40%</div>
            <div className="text-sm text-gray-600 mt-1">Revenue Growth</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">10+</div>
            <div className="text-sm text-gray-600 mt-1">Hours Saved Weekly</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">24/7</div>
            <div className="text-sm text-gray-600 mt-1">Support Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">100%</div>
            <div className="text-sm text-gray-600 mt-1">Uptime Guaranteed</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}