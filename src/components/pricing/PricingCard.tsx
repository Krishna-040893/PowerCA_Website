import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  title: string
  subtitle?: string
  price: string
  period: string
  features: string[]
  isPopular?: boolean
  onSelect: () => void
  disabled?: boolean
  className?: string
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  period,
  features,
  isPopular = false,
  onSelect,
  disabled = false,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "relative bg-white rounded-2xl border-2 p-8",
        isPopular ? "border-[#4F46E5] shadow-2xl scale-105" : "border-gray-200",
        className
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#4F46E5] text-white px-4">
          MOST POPULAR
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600 ml-2">/ {period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          "w-full py-3 text-lg",
          isPopular
            ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            : "bg-gray-900 hover:bg-gray-800 text-white"
        )}
      >
        Get Started
      </Button>
    </motion.div>
  )
}