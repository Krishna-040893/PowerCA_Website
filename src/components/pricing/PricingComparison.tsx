import React from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Feature {
  name: string
  starter: boolean | string
  professional: boolean | string
  enterprise: boolean | string
}

const features: Feature[] = [
  {
    name: 'Client Management',
    starter: 'Up to 50',
    professional: 'Unlimited',
    enterprise: 'Unlimited'
  },
  {
    name: 'Document Storage',
    starter: '10 GB',
    professional: '100 GB',
    enterprise: 'Unlimited'
  },
  {
    name: 'Team Members',
    starter: '1',
    professional: 'Up to 10',
    enterprise: 'Unlimited'
  },
  {
    name: 'GST Filing Tools',
    starter: true,
    professional: true,
    enterprise: true
  },
  {
    name: 'Invoice Generation',
    starter: true,
    professional: true,
    enterprise: true
  },
  {
    name: 'Payment Processing',
    starter: false,
    professional: true,
    enterprise: true
  },
  {
    name: 'API Access',
    starter: false,
    professional: false,
    enterprise: true
  },
  {
    name: 'Custom Integrations',
    starter: false,
    professional: false,
    enterprise: true
  },
  {
    name: 'Priority Support',
    starter: false,
    professional: true,
    enterprise: true
  },
  {
    name: 'Dedicated Account Manager',
    starter: false,
    professional: false,
    enterprise: true
  }
]

const renderFeatureValue = (value: boolean | string) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-gray-300 mx-auto" />
    )
  }
  return <span className="text-gray-700">{value}</span>
}

export const PricingComparison: React.FC = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compare Plans
          </h2>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your practice
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Features</TableHead>
                <TableHead className="text-center">Starter</TableHead>
                <TableHead className="text-center">Professional</TableHead>
                <TableHead className="text-center">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{feature.name}</TableCell>
                  <TableCell className="text-center">
                    {renderFeatureValue(feature.starter)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderFeatureValue(feature.professional)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderFeatureValue(feature.enterprise)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </section>
  )
}